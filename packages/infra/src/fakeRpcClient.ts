import type { RpcClient, RpcResponse } from '@upadhyay-erp/erp-services';

const fakeIds: Record<string, string> = {
  'inv.approve_grn': 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0001',
  'mfg.create_batch': 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0002',
  'qa.release_batch_qc': 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0003',
  'fin.confirm_dispatch': 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0004',
  'fin.create_invoice_from_dispatch': 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0005',
  'fin.post_payment': 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa0006',
};

export class FakeRpcClient implements RpcClient {
  readonly calls: Array<{ name: string; args: Record<string, unknown> }> = [];

  async call<T>(name: string, args: Record<string, unknown>): Promise<RpcResponse<T>> {
    this.calls.push({ name, args });

    if (name === 'mfg.start_batch' || name === 'mfg.complete_batch') {
      return { data: undefined as T, error: null };
    }

    return {
      data: (fakeIds[name] ?? 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaa9999') as T,
      error: null,
    };
  }
}

