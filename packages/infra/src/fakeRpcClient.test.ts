import { describe, expect, it } from 'vitest';
import { FirstSliceService } from '@upadhyay-erp/erp-services';
import { FakeRpcClient } from './fakeRpcClient';

describe('FakeRpcClient', () => {
  it('supports first-slice service simulation', async () => {
    const rpc = new FakeRpcClient();
    const service = new FirstSliceService(rpc);

    const result = await service.confirmDispatch({
      customerId: '11111111-1111-4111-8111-111111111111',
      fgLotId: '22222222-2222-4222-8222-222222222222',
      qty: 10,
      actorId: '33333333-3333-4333-8333-333333333333',
    });

    expect(result.ok).toBe(true);
    expect(rpc.calls[0]?.name).toBe('fin.confirm_dispatch');
  });
});

