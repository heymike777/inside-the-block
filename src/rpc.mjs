import { performance } from 'node:perf_hooks';
export function rpcClient(url, record = () => {}) {
  let id = 0;
  return async (method, params = []) => {
    const start = performance.now();
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }), signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw Error(`RPC HTTP ${response.status} for ${method}`);
    const body = await response.json();
    record({ method, params, at: new Date().toISOString(), durationMs: performance.now() - start, response: body });
    if (body.error) throw Error(`RPC ${method}: ${JSON.stringify(body.error)}`);
    return body.result;
  };
}
