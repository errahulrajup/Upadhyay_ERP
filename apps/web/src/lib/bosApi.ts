// src/lib/bosApi.ts
import { supabase } from './supabase';

type ApiResult<T> = { data: T | null; error: Error | null };

export const inventoryApi = {
  getGrnList: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('grn').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    // Fallback Mock Data
    return {
      data: [
        { id: '1', grn_no: 'GRN-1001', supplier: 'Alpha Chemicals', status: 'PENDING_QC', date: '2026-06-01' },
        { id: '2', grn_no: 'GRN-1002', supplier: 'Beta Foods', status: 'APPROVED', date: '2026-05-28' },
      ],
      error: null
    };
  },
  getSuppliers: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('suppliers').select('*').eq('status', 'ACTIVE');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    // Fallback Mock Data
    return {
      data: [
        { id: 'sup1', name: 'Global Foods Inc.' },
        { id: 'sup2', name: 'Alpha Chemicals' },
      ],
      error: null
    };
  },
  getMaterials: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('materials').select('*').eq('status', 'ACTIVE');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    // Fallback Mock Data
    return {
      data: [
        { id: 'mat1', name: 'Citric Acid', code: 'RM-01' },
        { id: 'mat2', name: 'Sugar', code: 'RM-02' },
        { id: 'mat3', name: 'Apple Concentrate', code: 'RM-03' },
      ],
      error: null
    };
  },
  createGrn: async (payload: { supplierId: string, materialId: string, qty: number, expectedExpiry: string }): Promise<ApiResult<void>> => {
    console.log(`RPC Call: create_grn_strict`, payload);
    const { error } = await supabase.rpc('create_grn_strict', { 
      p_supplier_id: payload.supplierId, 
      p_material_id: payload.materialId,
      p_qty: payload.qty,
      p_rate: 0,
      p_invoice_no: 'INV-TEMP',
      p_expected_expiry: payload.expectedExpiry,
      p_user_id: '00000000-0000-0000-0000-000000000000' 
    });
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
  getRmLots: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('rm_lots').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'l1', lot_no: 'LOT-A-99', ingredient: 'Citric Acid', qty: 500, expiry: '2027-01-01', status: 'APPROVED', location: 'Ambient-01' },
        { id: 'l2', lot_no: 'LOT-B-88', ingredient: 'Sugar', qty: 100, expiry: '2026-08-15', status: 'QUARANTINE', location: 'Quarantine-Bay' },
      ],
      error: null
    };
  },
  getFgLots: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('fg_lots').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'fg1', lot_no: 'FG-BAT-400', product: 'Premium Apple Juice', qty: 1000, holding_status: 'RELEASED', location: 'FG-Bay-01' },
        { id: 'fg2', lot_no: 'FG-BAT-401', product: 'Orange Concentrate', qty: 500, holding_status: 'INCUBATION', location: 'Cold-Room-1' },
      ],
      error: null
    };
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
  transferStock: async (lotId: string, toLocationId: string, reason: string): Promise<ApiResult<void>> => {
    console.log(`RPC Call: transfer_rm_stock(${lotId} -> ${toLocationId})`);
    const { error } = await supabase.rpc('transfer_rm_stock', {
      p_lot_id: lotId,
      p_to_location_id: toLocationId,
      p_reason: reason,
      p_user_id: '00000000-0000-0000-0000-000000000000'
    });
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 600));
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
    if (error) console.error("Supabase RPC Error:", error);
    // Simulate delay for UI if DB is offline
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
};

export const productionApi = {
  getRecipes: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('recipes').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'r1', product: 'Premium Apple Juice', version: 2, status: 'ACTIVE' },
        { id: 'r2', product: 'Orange Concentrate', version: 1, status: 'ACTIVE' },
      ],
      error: null
    };
  },
  getBatches: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('batches').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'b1', batch_no: 'BAT-405', recipe: 'Premium Apple Juice', status: 'RUNNING', expected_yield: 1000 },
        { id: 'b2', batch_no: 'BAT-406', recipe: 'Orange Concentrate', status: 'PLANNED', expected_yield: 500 },
      ],
      error: null
    };
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
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
  getPendingQc: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('fg_lots').select('*').eq('qc_status', 'PENDING');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'fg1', lot_no: 'FG-BAT-400', product: 'Premium Apple Juice', qty: 1000, qc_status: 'PENDING' },
      ],
      error: null
    };
  },
};

export const dispatchApi = {
  getDispatches: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('dispatches').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'd1', dispatch_no: 'DSP-8001', customer: 'Global Foods Inc', status: 'DRAFT', date: '2026-06-01' },
        { id: 'd2', dispatch_no: 'DSP-8002', customer: 'Local Mart', status: 'SHIPPED', date: '2026-05-30' },
      ],
      error: null
    };
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
    try {
      const { data, error } = await supabase.from('chart_of_accounts').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'coa1', account_code: '1000', account_name: 'Cash in Hand', account_type: 'ASSET', status: 'ACTIVE' },
        { id: 'coa2', account_code: '4000', account_name: 'Sales Revenue', account_type: 'REVENUE', status: 'ACTIVE' },
        { id: 'coa3', account_code: '5000', account_name: 'Raw Material Purchases', account_type: 'EXPENSE', status: 'ACTIVE' },
      ],
      error: null
    };
  },
  getPurchaseOrders: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('purchase_orders').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'po1', po_number: 'PO-26-001', supplier_id: 'sup1', total_amount: 150000, status: 'APPROVED', expected_delivery: '2026-06-15' },
        { id: 'po2', po_number: 'PO-26-002', supplier_id: 'sup2', total_amount: 45000, status: 'DRAFT', expected_delivery: '2026-06-20' },
      ],
      error: null
    };
  },
  getInvoices: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('invoices').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'i1', invoice_number: 'INV-9002', type: 'SALES', total_amount: 45000, status: 'PAID', due_date: '2026-05-30' },
        { id: 'i2', invoice_number: 'INV-9003', type: 'SALES', total_amount: 12000, status: 'UNPAID', due_date: '2026-06-10' },
        { id: 'i3', invoice_number: 'BILL-101', type: 'PURCHASE', total_amount: 55000, status: 'UNPAID', due_date: '2026-06-15' },
      ],
      error: null
    };
  },
  getGeneralLedger: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('general_ledger').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'gl1', transaction_date: '2026-06-01', reference_type: 'INVOICE', debit: 45000, credit: 0, narration: 'Sales to Local Mart' },
        { id: 'gl2', transaction_date: '2026-06-01', reference_type: 'INVOICE', debit: 0, credit: 45000, narration: 'Sales Revenue' },
      ],
      error: null
    };
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
};

export const hrApi = {
  // Phase 19: HRMS & Payroll Methods
  getEmployees: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('employees').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'emp1', employee_code: 'EMP-001', first_name: 'Rahul', last_name: 'Sharma', department: 'Production', designation: 'Supervisor', base_salary: 35000, status: 'ACTIVE' },
        { id: 'emp2', employee_code: 'EMP-002', first_name: 'Amit', last_name: 'Kumar', department: 'QC', designation: 'Analyst', base_salary: 28000, status: 'ACTIVE' },
      ],
      error: null
    };
  },
  getAttendance: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('attendance_logs').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'att1', employee_id: 'emp1', date: new Date().toISOString().split('T')[0], status: 'PRESENT', punch_in: '08:00 AM' },
        { id: 'att2', employee_id: 'emp2', date: new Date().toISOString().split('T')[0], status: 'PRESENT', punch_in: '08:15 AM' },
      ],
      error: null
    };
  },
  getPayrollRecords: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('payroll_records').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'pay1', employee_id: 'emp1', pay_period: '2026-05', base_pay: 35000, allowances: 2000, deductions: 500, net_pay: 36500, status: 'PAID' },
        { id: 'pay2', employee_id: 'emp2', pay_period: '2026-05', base_pay: 28000, allowances: 1000, deductions: 200, net_pay: 28800, status: 'PROCESSED' },
      ],
      error: null
    };
  },
  processPayroll: async (payload: any): Promise<ApiResult<void>> => {
    console.log(`RPC Call: process_payroll`, payload);
    const { error } = await supabase.rpc('process_payroll', {
      p_employee_id: payload.employeeId,
      p_pay_period: payload.payPeriod,
      p_allowances: payload.allowances,
      p_deductions: payload.deductions
    });
    if (error) console.error("Supabase RPC Error:", error);
    await new Promise(r => setTimeout(r, 600));
    return { data: undefined, error };
  },
};

export const dmsApi = {
  // Phase 20: DMS & Analytics Methods
  getDocuments: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('documents').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'doc1', title: 'FSSAI License 2026', document_type: 'CERTIFICATE', department: 'Compliance', valid_until: '2027-01-01', status: 'ACTIVE' },
        { id: 'doc2', title: 'ISO 9001:2015 Audit Report', document_type: 'AUDIT_REPORT', department: 'QA', valid_until: '2026-12-31', status: 'ACTIVE' },
        { id: 'doc3', title: 'Supplier Agreement - Alpha Chem', document_type: 'AGREEMENT', department: 'Procurement', valid_until: '2028-05-01', status: 'ACTIVE' },
      ],
      error: null
    };
  },
};

export const complianceApi = {
  getHaccpRecords: async (): Promise<ApiResult<any[]>> => {
    return {
      data: [
        { id: 'h1', control_point: 'CCP-1: Pasteurization', status: 'COMPLIANT', recorded_at: '2026-06-01 10:00 AM' },
        { id: 'h2', control_point: 'CCP-2: Metal Detection', status: 'DEVIATION', recorded_at: '2026-06-01 11:30 AM' },
      ],
      error: null
    };
  },
  getRecalls: async (): Promise<ApiResult<any[]>> => {
    return {
      data: [
        { id: 'rc1', recall_no: 'REC-26-001', affected_lot: 'FG-BAT-399', status: 'ACTIVE', severity: 'HIGH' },
      ],
      error: null
    };
  },
  getCapa: async (): Promise<ApiResult<any[]>> => {
    return {
      data: [
        { id: 'c1', capa_no: 'CAPA-40', source: 'CCP-2 Deviation', status: 'OPEN', owner: 'QA Lead' },
      ],
      error: null
    };
  },
  getSops: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('sop_register').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'sop1', sop_code: 'SOP-HYG-01', title: 'Personal Hygiene Policy', department: 'HR', status: 'ACTIVE', next_review_date: '2026-12-01' },
        { id: 'sop2', sop_code: 'SOP-CLN-02', title: 'CIP Cleaning Procedure', department: 'Production', status: 'ACTIVE', next_review_date: '2026-10-15' },
      ],
      error: null
    };
  },
  getTrainingRecords: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('training_matrix').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 't1', employee_name: 'Rahul Sharma', training_topic: 'Allergen Control', training_date: '2026-05-20', status: 'COMPLETED' },
        { id: 't2', employee_name: 'Amit Kumar', training_topic: 'Personal Hygiene', training_date: '2026-06-05', status: 'PENDING' },
      ],
      error: null
    };
  },
  initiateRecall: async (batchId: string): Promise<ApiResult<void>> => {
    await new Promise(r => setTimeout(r, 800));
    return { data: undefined, error: null };
  },
  closeCapa: async (capaId: string): Promise<ApiResult<void>> => {
    await new Promise(r => setTimeout(r, 700));
    return { data: undefined, error: null };
  },
};

export const rndApi = {
  getDraftRecipes: async (): Promise<ApiResult<any[]>> => {
    return {
      data: [
        { id: 'rd1', name: 'Experimental Mango Juice V3', status: 'DRAFT', author: 'Dr. Smith' },
        { id: 'rd2', name: 'Low Sugar Apple Base', status: 'PENDING_APPROVAL', author: 'J. Doe' },
      ],
      error: null
    };
  }
};

export const traceabilityApi = {
  getTraceabilityTree: async (lotNo: string): Promise<ApiResult<any>> => {
    await new Promise(r => setTimeout(r, 600));
    return {
      data: {
        id: 'fg_node',
        label: `FG Lot: ${lotNo || 'FG-BAT-405'}`,
        type: 'FG',
        parents: [
          {
            id: 'batch_node',
            label: 'Batch: BAT-405',
            type: 'BATCH',
            parents: [
              {
                id: 'rm_node',
                label: 'RM Lot: LOT-A-99 (Citric Acid)',
                type: 'RM',
                parents: [
                  {
                    id: 'grn_node',
                    label: 'GRN: GRN-1002 (Supplier: Beta Foods)',
                    type: 'GRN',
                    parents: []
                  }
                ]
              }
            ]
          }
        ]
      },
      error: null
    };
  }
};
