export function provenance(endpoint) {
 const host=new URL(endpoint).hostname;
 const roots=['helius-rpc.com','quiknode.pro','quicknode.pro','alchemy.com','solana.com','ankr.com','triton.one','rpcpool.com'];
 const providerFamily=roots.find(r=>host===r||host.endsWith(`.${r}`))??'custom endpoint (withheld)';
 return {providerFamily,nodeVersion:process.version,platform:process.platform,transport:'Node fetch HTTPS JSON-RPC; no direct TPU, bundles or tips',senderLocation:'Physical location and route unmeasured; local desktop configured Europe/Warsaw',endpointCredentials:'withheld'};
}
