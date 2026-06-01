import { describe, expect, it } from 'vitest';
import { FirstSliceService } from './firstSliceService';
import type { RpcClient } from './rpcClient';

class FakeRpcClient implements RpcClient {
  calls: Array<{ name: string; args: Record<string, unknown> }> = [];

  async call<T>(name: string, args: Record<string, unknown>) {
    this.calls.push({ name, args });
    return { data: '11111111-1111-4111-8111-111111111111' as T, error: null };
  }
}

describe('FirstSliceService', () => {
  it('maps GRN approval to the transactional RPC', async () => {
    const rpc = new FakeRpcClient();
    const service = new FirstSliceService(rpc);

    const result = await service.approveGrn(
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
    );

    expect(result.ok).toBe(true);
    expect(rpc.calls[0]?.name).toBe('inv.approve_grn');
  });

  it('blocks invalid QC pass before RPC call', async () => {
    const rpc = new FakeRpcClient();
    const service = new FirstSliceService(rpc);

    const result = await service.releaseBatchQc({
      batchId: '22222222-2222-4222-8222-222222222222',
      verdict: 'PASS',
      analyst: 'A',
      reviewer: 'R',
      actorId: '33333333-3333-4333-8333-333333333333',
      results: [{ parameter: 'pH', specification: '6-7', result: '9', verdict: 'FAIL' }],
    });

    expect(result.ok).toBe(false);
    expect(rpc.calls).toHaveLength(0);
  });
});

