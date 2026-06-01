export interface RpcResponse<T> {
  data: T | null;
  error: unknown | null;
}

export interface RpcClient {
  call<T>(name: string, args: Record<string, unknown>): Promise<RpcResponse<T>>;
}

export class MissingRpcClient implements RpcClient {
  async call<T>(name: string): Promise<RpcResponse<T>> {
    return {
      data: null,
      error: {
        code: 'CONFIG',
        message: `RPC client is not configured for ${name}`,
      },
    };
  }
}

