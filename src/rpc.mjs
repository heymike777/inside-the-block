import { performance } from 'node:perf_hooks';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export function rpcClient(url, record = () => {}) {
  let id = 0;
  return async (method, params = []) => {
    const readOnly=method.startsWith('get')||method==='simulateTransaction';
    for(let attempt=0;;attempt++){
      const start=performance.now();let response;
      try {
        response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params}),signal:AbortSignal.timeout(20000)});
      }catch(e){
        record({method,params,at:new Date().toISOString(),durationMs:performance.now()-start,attempt,transportError:e.name});
        if(readOnly&&attempt<2){await sleep(200*2**attempt);continue;}
        throw Error(`RPC transport failure for ${method}`);
      }
      if(!response.ok){
        record({method,params,at:new Date().toISOString(),durationMs:performance.now()-start,attempt,httpStatus:response.status});
        if(readOnly&&attempt<2&&[429,502,503,504].includes(response.status)){await sleep(200*2**attempt);continue;}
        throw Error(`RPC HTTP ${response.status} for ${method}`);
      }
      const body=await response.json();
      record({method,params,at:new Date().toISOString(),durationMs:performance.now()-start,attempt,response:body});
      if(body.error)throw Error(`RPC ${method}: ${JSON.stringify(body.error)}`);
      return body.result;
    }
  };
}
