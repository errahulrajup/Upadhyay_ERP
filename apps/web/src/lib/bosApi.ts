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
  getRmLots: async (): Promise<ApiResult<any[]>> => {
    try {
      const { data, error } = await supabase.from('rm_lots').select('*');
      if (data && data.length > 0) return { data, error };
    } catch(e) {}
    return {
      data: [
        { id: 'l1', lot_no: 'LOT-A-99', ingredient: 'Citric Acid', qty: 500, expiry: '2027-01-01', status: 'APPROVED' },
        { id: 'l2', lot_no: 'LOT-B-88', ingredient: 'Sugar', qty: 100, expiry: '2026-08-15', status: 'QUARANTINE' },
      ],
      error: null
    };
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
};

export const qcApi = {
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
  getInvoices: async (): Promise<ApiResult<any[]>> => {
    return {
      data: [
        { id: 'i1', invoice_no: 'INV-9002', customer: 'Local Mart', amount: 45000, status: 'PAID', date: '2026-05-30' },
        { id: 'i2', invoice_no: 'INV-9003', customer: 'Mega Store', amount: 12000, status: 'UNPAID', date: '2026-06-01' },
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
