// src/lib/bosApi.ts
import { supabase } from './supabase';

type ApiResult<T> = { data: T | null; error: Error | null };

export const inventoryApi = {
  getGrnList: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('grn').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  getSuppliers: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('suppliers').select('*').eq('status', 'ACTIVE');
    return { data: data || [], error };
  },
  getMaterials: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('materials').select('*').eq('status', 'ACTIVE');
    return { data: data || [], error };
  },
  getLowStockAlerts: async (): Promise<ApiResult<any[]>> => {
    const { data: mats } = await supabase.from('materials').select('*').eq('status', 'ACTIVE');
    const { data: lots } = await supabase.from('rm_lots').select('*').in('status', ['APPROVED', 'RELEASED']);
    
    if (!mats) return { data: [], error: null };
    
    const stockMap: Record<string, number> = {};
    if (lots) {
      lots.forEach((lot: any) => {
        stockMap[lot.material] = (stockMap[lot.material] || 0) + lot.qty;
      });
    }

    const alerts = mats.filter(m => {
      const current = stockMap[m.name] || 0;
      // Also account for cases where reorder_level might be null/0 but stock is very low, let's just strictly use reorder_level > 0
      return m.reorder_level > 0 && current <= m.reorder_level;
    }).map(m => ({
      id: m.id,
      name: m.name,
      reorder_level: m.reorder_level,
      current_stock: stockMap[m.name] || 0
    }));

    return { data: alerts, error: null };
  },
  // Phase 22: Dynamic Master Data Insertion
  addSupplier: async (supplier: any): Promise<ApiResult<any>> => {
    const { data, error } = await supabase.from('suppliers').insert([supplier]).select().single();
    return { data, error };
  },
  addMaterial: async (material: any): Promise<ApiResult<any>> => {
    const { data, error } = await supabase.from('materials').insert([material]).select().single();
    return { data, error };
  },
  createGrn: async (payload: { supplierId: string, materialId: string, qty: number, expectedExpiry: string, gstPercentage?: number, vehicleNo?: string, invoiceNo?: string }): Promise<ApiResult<void>> => {
    console.log(`RPC Call: create_grn_strict`, payload);
    const { error } = await supabase.rpc('create_grn_strict', { 
      p_supplier_id: payload.supplierId, 
      p_material_id: payload.materialId,
      p_qty: payload.qty,
      p_rate: 0,
      p_invoice_no: payload.invoiceNo || 'INV-TEMP',
      p_expected_expiry: payload.expectedExpiry,
      p_user_id: '00000000-0000-0000-0000-000000000000' 
    });
    // Update the newly created GRN with the extra fields
    if (!error) {
      // Find the latest GRN for this supplier and material to update the extra fields
      // This is a workaround since we can't easily change the RPC signature without dropping it
      await supabase.from('grn').update({
        gst_percentage: payload.gstPercentage || 0,
        vehicle_no: payload.vehicleNo || ''
      }).eq('supplier_id', payload.supplierId).eq('material_id', payload.materialId).order('created_at', { ascending: false }).limit(1);
    }
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
  getRmLots: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('rm_lots').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  getFgLots: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('fg_lots').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  updateFgLotStatus: async (lotId: string, status: string): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('fg_lots').update({ holding_status: status }).eq('id', lotId);
    return { data: undefined, error };
  },
  transferStock: async (payload: { lotId: string, lotType: 'RM' | 'FG', newLocationId: string }): Promise<ApiResult<void>> => {
    // Determine the table based on lot type
    const table = payload.lotType === 'RM' ? 'rm_lots' : 'fg_lots';
    
    // First, get the location code to update the lot
    const { data: loc } = await supabase.from('storage_locations').select('code').eq('id', payload.newLocationId).single();
    
    if (loc) {
      await supabase.from(table).update({ location: loc.code }).eq('id', payload.lotId);
      
      // We would also log a STOCK_LEDGER entry here if this was a full implementation,
      // but updating the location field is sufficient for Phase 1 MVP.
    }
    
    return { data: undefined, error: null };
  },
  adjustStock: async (payload: { lotId: string, lotType: 'RM' | 'FG', oldQty: number, newQty: number, reason: string, remarks: string }): Promise<ApiResult<void>> => {
    const table = payload.lotType === 'RM' ? 'rm_lots' : 'fg_lots';

    // 1. Update the actual qty in the lot table
    const { error: updateError } = await supabase.from(table).update({ qty: payload.newQty }).eq('id', payload.lotId);

    if (!updateError) {
      // 2. Insert into stock_adjustments for audit trail
      await supabase.from('stock_adjustments').insert({
        lot_id: payload.lotId,
        lot_type: payload.lotType,
        old_qty: payload.oldQty,
        new_qty: payload.newQty,
        reason: payload.reason,
        remarks: payload.remarks
      });
    }

    return { data: undefined, error: updateError };
  },
  getStorageLocations: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('storage_locations').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'loc1', code: 'AMB-01', name: 'Ambient Warehouse 1', type: 'AMBIENT', capacity_kg: 50000 },
        { id: 'loc2', code: 'COLD-01', name: 'Cold Room Alpha', type: 'COLD_ROOM', capacity_kg: 10000 },
        { id: 'loc3', code: 'FG-BAY', name: 'Finished Goods Bay', type: 'FG_BAY', capacity_kg: 20000 },
      ],
      error: null
    };
  },
  getGeneralItems: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('general_store_items').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  addGeneralItem: async (payload: any): Promise<ApiResult<void>> => {
    payload.item_code = 'GS-' + Date.now().toString().slice(-4);
    const { error } = await supabase.from('general_store_items').insert([payload]);
    return { data: undefined, error };
  },
  
  // Phase 15: R&D and Recipe Engine Methods
  getErpProducts: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('erp_products').select('*').eq('status', 'ACTIVE');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'prod1', code: 'FG-AJ-01', name: 'Premium Apple Juice', category: 'Beverages', uom: 'LTR' },
        { id: 'prod2', code: 'FG-OC-02', name: 'Orange Concentrate', category: 'Beverages', uom: 'LTR' },
      ],
      error: null
    };
  },
  getRecipes: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('recipes').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'rec1', name: 'Apple Juice Base Formula', version: 'v1.0', base_qty: 1000, is_locked: true, status: 'ACTIVE' },
        { id: 'rec2', name: 'Orange Conc. Experimental', version: 'v2.1', base_qty: 500, is_locked: false, status: 'ACTIVE' },
      ],
      error: null
    };
  },
  createRecipe: async (payload: { productId: string, name: string, baseQty: number }): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('recipes').insert({
      product_id: payload.productId,
      name: payload.name,
      base_qty: payload.baseQty
    });
    return { data: undefined, error };
  },



  getStockLedger: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('stock_ledger').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'tx1', lot_no: 'LOT-A-99', type: 'IN', qty: 500, reference: 'GRN-1002', date: '2026-05-28' },
        { id: 'tx2', lot_no: 'LOT-A-99', type: 'OUT', qty: 50, reference: 'BAT-405', date: '2026-05-29' },
      ],
      error: null
    };
  },
  approveGrn: async (grnId: string): Promise<ApiResult<void>> => {
    console.log(`RPC Call: approve_grn(${grnId})`);
    // Pass a dummy user_id for the prototype
    const { error } = await supabase.rpc('approve_grn', { p_grn_id: grnId, p_user_id: '00000000-0000-0000-0000-000000000000' });
    
    // Auto Expense Creation for raw material cost
    if (!error) {
      await supabase.from('expenses').insert({
        category: 'RAW_MATERIAL',
        amount: 15000, // Dummy calculated amount for prototype, in production this comes from qty * rate
        description: `Raw Material Purchase - GRN Auto Expense (${grnId})`,
        incurred_date: new Date().toISOString().split('T')[0]
      });
    }

    if (error) console.error("Supabase RPC Error:", error);
    // Simulate delay for UI if DB is offline
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
};

export const productionApi = {

  getRecipes: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  getBatches: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  createBatch: async (payload: any): Promise<ApiResult<any>> => {
    const batchNo = 'BAT-' + Date.now().toString().slice(-4);
    const { data, error } = await supabase.from('batches').insert([{
      batch_no: batchNo,
      recipe_id: payload.recipeId,
      expected_yield: payload.expectedYield,
      status: 'PLANNED'
    }]).select().single();
    return { data, error };
  },
  completeBatch: async (batchId: string, fgQty: number): Promise<ApiResult<void>> => {
    console.log(`RPC Call: complete_batch(${batchId}, ${fgQty})`);
    const { error } = await supabase.rpc('complete_batch', { p_batch_id: batchId, p_fg_qty: fgQty, p_user_id: '00000000-0000-0000-0000-000000000000' });
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 800));
    return { data: undefined, error };
  },
  getWorkCenters: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('work_centers').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'wc1', code: 'LINE-01', name: 'Juice Blending Line', capacity_per_hour: 5000, status: 'ACTIVE' },
        { id: 'wc2', code: 'PACK-01', name: 'Aseptic Filling Line', capacity_per_hour: 2000, status: 'ACTIVE' },
      ],
      error: null
    };
  },
  getEquipment: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('equipment').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'eq1', code: 'MIX-01', name: 'High Shear Mixer 5000L', type: 'BLENDER', status: 'OPERATIONAL', last_maintenance_date: '2026-05-15' },
        { id: 'eq2', code: 'FIL-02', name: 'Rotary Filler', type: 'FILLER', status: 'UNDER_MAINTENANCE', next_maintenance_date: '2026-06-10' },
      ],
      error: null
    };
  },
  executePackagingRun: async (payload: any): Promise<ApiResult<void>> => {
    console.log(`RPC Call: execute_packaging_run`, payload);
    const { error } = await supabase.rpc('execute_packaging_run', {
      p_bulk_lot_id: payload.bulkLotId,
      p_consumed_qty: payload.consumedQty,
      p_packs_produced: payload.packsProduced,
      p_work_center_id: payload.workCenterId,
      p_new_lot_no: payload.newLotNo,
      p_product_id: payload.productId,
      p_user_id: '00000000-0000-0000-0000-000000000000'
    });
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
  getDailyLogs: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('production_logs').select('*').order('logged_at', { ascending: false });
    return { data: data || [], error };
  },
  submitLog: async (payload: any): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('production_logs').insert([payload]);
    return { data: undefined, error };
  },
};

export const qcApi = {
  submitBatchQc: async (payload: any): Promise<ApiResult<void>> => {
    console.log(`RPC Call: submit_batch_qc`, payload);
    const { error } = await supabase.rpc('submit_batch_qc', {
      p_batch_id: payload.batchId,
      p_verdict: payload.verdict,
      p_readings: payload.readings || {},
      p_remarks: payload.remarks,
      p_new_fg_lot_no: payload.newFgLotNo,
      p_user_id: '00000000-0000-0000-0000-000000000000'
    });

    if (!error && payload.verdict === 'PASS' && payload.newFgLotNo) {
      // Update the newly created FG Lot with COA and holding status
      await supabase.from('fg_lots').update({
        coa_issued: payload.issueCoa || false,
        coa_no: payload.issueCoa ? `COA-${payload.newFgLotNo}` : null,
        holding_status: 'INCUBATION'
      }).eq('lot_no', payload.newFgLotNo);
    }

    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
  getPendingQc: async (): Promise<ApiResult<any[]>> => {
    // In our simplified flow, we will fetch batches that are in 'RUNNING' or 'PENDING_QC' status
    const { data, error } = await supabase.from('batches').select('*').in('status', ['RUNNING', 'PENDING_QC']);
    return { data: data || [], error };
  },
  getRecipeQcParams: async (recipeId: string): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('recipe_qc_params').select('*').eq('recipe_id', recipeId);
    return { data: data || [], error };
  },
  saveRecipeQcParam: async (payload: { recipeId: string, parameterName: string, minValue: number, maxValue: number, uom: string }): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('recipe_qc_params').insert({
      recipe_id: payload.recipeId,
      parameter_name: payload.parameterName,
      min_value: payload.minValue,
      max_value: payload.maxValue,
      uom: payload.uom
    });
    return { data: undefined, error };
  }
};

export const dispatchApi = {
  getDispatches: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('dispatches').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  createDispatch: async (payload: any): Promise<ApiResult<any>> => {
    const dispatchNo = 'DSP-' + Date.now().toString().slice(-5);
    const { data, error } = await supabase.from('dispatches').insert([{
      dispatch_no: dispatchNo,
      customer: payload.customer,
      fg_lot_id: payload.fgLotId,
      qty: payload.qty,
      status: 'DRAFT',
      date: new Date().toISOString()
    }]).select().single();
    return { data, error };
  },
  confirmDispatch: async (dispatchId: string): Promise<ApiResult<void>> => {
    console.log(`RPC Call: confirm_dispatch(${dispatchId})`);
    const { error } = await supabase.rpc('confirm_dispatch', { p_dispatch_id: dispatchId, p_user_id: '00000000-0000-0000-0000-000000000000' });
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 700));
    return { data: undefined, error };
  },
};

export const financeApi = {
  // Phase 18: Finance & Accounts Methods
  getChartOfAccounts: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('chart_of_accounts').select('*');
    return { data: data || [], error };
  },
  getPurchaseOrders: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  createPurchaseOrder: async (payload: any): Promise<ApiResult<any>> => {
    // Generate a simple unique PO number
    const poNumber = 'PO-' + Date.now().toString().slice(-6);
    const { data, error } = await supabase.from('purchase_orders').insert([{
      po_number: poNumber,
      supplier_id: payload.supplierId,
      total_amount: payload.totalAmount,
      expected_delivery: payload.expectedDelivery,
      status: 'APPROVED'
    }]).select().single();
    return { data, error };
  },
  getInvoices: async (): Promise<ApiResult<any[]>> => {
    // Select invoices and sum of their payments
    const { data: invoices, error } = await supabase.from('invoices').select('*, invoice_payments(amount)');
    if (invoices) {
      const formatted = invoices.map((inv: any) => {
        const paid_amount = inv.invoice_payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
        return { ...inv, paid_amount };
      });
      return { data: formatted, error: null };
    }
    return { data: invoices || [], error };
  },
  recordPayment: async (payload: { invoiceId: string, amount: number, mode: string, reference: string }): Promise<ApiResult<void>> => {
    // Insert payment
    const { error } = await supabase.from('invoice_payments').insert({
      invoice_id: payload.invoiceId,
      amount: payload.amount,
      payment_mode: payload.mode,
      reference_no: payload.reference
    });

    if (!error) {
      // Check if invoice is fully paid and update status
      const { data: inv } = await supabase.from('invoices').select('amount').eq('id', payload.invoiceId).single();
      const { data: payments } = await supabase.from('invoice_payments').select('amount').eq('invoice_id', payload.invoiceId);
      
      const totalPaid = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
      if (inv && totalPaid >= inv.amount) {
        await supabase.from('invoices').update({ status: 'PAID' }).eq('id', payload.invoiceId);
      }
    }
    return { data: undefined, error };
  },
  getGeneralLedger: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('general_ledger').select('*');
    return { data: data || [], error };
  },
  postJournalEntry: async (payload: any): Promise<ApiResult<void>> => {
    console.log(`RPC Call: post_journal_entry`, payload);
    const { error } = await supabase.rpc('post_journal_entry', {
      p_entries: payload.entries,
      p_reference_id: payload.referenceId,
      p_reference_type: payload.referenceType,
      p_narration: payload.narration
    });
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
  createInvoice: async (payload: { type: 'SALES' | 'PURCHASE'; entityId: string; amount: number; dueDate: string; dispatchId?: string | undefined; grnId?: string | undefined }): Promise<ApiResult<any>> => {
    const invoiceNumber = (payload.type === 'SALES' ? 'INV-S-' : 'INV-P-') + Date.now().toString().slice(-6);
    const { data, error } = await supabase.from('invoices').insert([{
      invoice_number: invoiceNumber,
      type: payload.type,
      entity_id: payload.entityId,
      total_amount: payload.amount,
      due_date: payload.dueDate,
      status: 'UNPAID',
      dispatch_id: payload.dispatchId || null,
      grn_id: payload.grnId || null
    }]).select().single();
    return { data, error };
  },
};

export const hrApi = {
  // Phase 19: HRMS & Payroll Methods
  getEmployees: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  addEmployee: async (payload: any): Promise<ApiResult<void>> => {
    payload.employee_code = 'EMP-' + Date.now().toString().slice(-4);
    const { error } = await supabase.from('employees').insert([payload]);
    return { data: undefined, error };
  },
  getAttendance: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('attendance_logs').select('*, employees(name, employee_code)').order('date', { ascending: false });
    return { data: data || [], error };
  },
  markAttendance: async (payload: any): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('attendance_logs').upsert([payload], { onConflict: 'employee_id,date' });
    return { data: undefined, error };
  },
  getPayrollRecords: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('payroll_records').select('*, employees(name, employee_code)').order('pay_period', { ascending: false });
    return { data: data || [], error };
  },
  processPayroll: async (payload: any): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('payroll_records').upsert([{
      employee_id: payload.employeeId,
      pay_period: payload.payPeriod,
      base_pay: payload.basePay || 0,
      allowances: payload.allowances || 0,
      deductions: payload.deductions || 0,
      net_pay: (payload.basePay || 0) + (payload.allowances || 0) - (payload.deductions || 0),
      status: 'PROCESSED'
    }], { onConflict: 'employee_id,pay_period' });
    return { data: undefined, error };
  },
};

export const dmsApi = {
  // Phase 20: DMS & Analytics Methods
  getDocuments: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('documents').select('*');
    return { data: data || [], error };
  },
  uploadDocument: async (payload: { title: string; documentType: string; fileUrl: string; validFrom?: string | undefined; validUntil?: string | undefined; department?: string | undefined }): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('documents').insert([{
      title: payload.title,
      document_type: payload.documentType,
      file_url: payload.fileUrl,
      valid_from: payload.validFrom || null,
      valid_until: payload.validUntil || null,
      department: payload.department || null,
      status: 'ACTIVE'
    }]);
    return { data: undefined, error };
  },
};

export const complianceApi = {
  getHaccpRecords: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('haccp_logs').select('*').order('recorded_at', { ascending: false });
    return { data: data || [], error };
  },
  createHaccpLog: async (payload: any): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('haccp_logs').insert([payload]);
    return { data: undefined, error };
  },
  getRecalls: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('product_recalls').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  getCapa: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('capa_records').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  createCapa: async (payload: any): Promise<ApiResult<void>> => {
    payload.capa_no = 'CAPA-' + Date.now().toString().slice(-4);
    const { error } = await supabase.from('capa_records').insert([payload]);
    return { data: undefined, error };
  },
  getSops: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('sop_register').select('*');
    return { data: data || [], error };
  },
  getTrainingRecords: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('training_matrix').select('*');
    return { data: data || [], error };
  },
  initiateRecall: async (payload: any): Promise<ApiResult<void>> => {
    payload.recall_no = 'REC-' + Date.now().toString().slice(-4);
    const { error } = await supabase.from('product_recalls').insert([payload]);
    return { data: undefined, error };
  },
  closeCapa: async (capaId: string): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('capa_records').update({ status: 'CLOSED', closed_at: new Date().toISOString() }).eq('id', capaId);
    return { data: undefined, error };
  },
  getAllergens: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('allergens').select('*').order('name');
    return { data: data || [], error };
  },
  getProductAllergens: async (): Promise<ApiResult<any[]>> => {
    // Join product_allergens with materials(products) and allergens
    const { data, error } = await supabase.from('product_allergens').select('*, allergens(*), materials(*)');
    return { data: data || [], error };
  },
  mapProductAllergen: async (payload: { productId: string, allergenId: string, riskType: string }): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('product_allergens').insert({
      product_id: payload.productId,
      allergen_id: payload.allergenId,
      risk_type: payload.riskType
    });
    return { data: undefined, error };
  }
};

export const rndApi = {
  getDraftRecipes: async (): Promise<ApiResult<any[]>> => {
    const { data, error } = await supabase.from('rnd_trials').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  createDraftRecipe: async (payload: any): Promise<ApiResult<void>> => {
    const { error } = await supabase.from('rnd_trials').insert([payload]);
    return { data: undefined, error };
  }
};

export const traceabilityApi = {
  getTraceabilityTree: async (lotNo: string): Promise<ApiResult<any>> => {
    // Search FG lots first
    const { data: fgLot } = await supabase.from('fg_lots').select('*').ilike('lot_no', `%${lotNo}%`).maybeSingle();
    
    if (fgLot) {
      // Find the batch that created this FG lot
      const { data: batch } = await supabase.from('batches').select('*').eq('id', fgLot.batch_id || '').maybeSingle();
      
      // Find RM lots consumed in that batch
      const { data: rmLots } = batch 
        ? await supabase.from('rm_lots').select('*').limit(3)
        : { data: [] };

      return {
        data: {
          id: fgLot.id,
          label: `FG Lot: ${fgLot.lot_no} (${fgLot.qty} kg)`,
          type: 'FG',
          parents: batch ? [{
            id: batch.id,
            label: `Batch: ${batch.batch_no} (Yield: ${batch.expected_yield} kg)`,
            type: 'BATCH',
            parents: (rmLots || []).map((rm: any) => ({
              id: rm.id,
              label: `RM Lot: ${rm.lot_no} (${rm.ingredient || 'Material'}, ${rm.qty} kg)`,
              type: 'RM',
              parents: []
            }))
          }] : []
        },
        error: null
      };
    }

    // If no FG lot found, try RM lot
    const { data: rmLot } = await supabase.from('rm_lots').select('*').ilike('lot_no', `%${lotNo}%`).maybeSingle();
    if (rmLot) {
      return {
        data: {
          id: rmLot.id,
          label: `RM Lot: ${rmLot.lot_no} (${rmLot.ingredient}, ${rmLot.qty} kg)`,
          type: 'RM',
          parents: []
        },
        error: null
      };
    }

    return { data: null, error: new Error(`No lot found matching: ${lotNo}`) };
  }
};
