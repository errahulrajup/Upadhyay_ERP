import type { RpcClient, RpcResponse } from '@upadhyay-erp/erp-services';

interface SupabaseLikeClient {
  rpc<T>(name: string, args: Record<string, unknown>): Promise<RpcResponse<T>>;
}

export class SupabaseRpcClient implements RpcClient {
  constructor(private readonly client: SupabaseLikeClient) {}

  async call<T>(name: string, args: Record<string, unknown>): Promise<RpcResponse<T>> {
    return this.client.rpc<T>(name, args);
  }
}

