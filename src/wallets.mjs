import {generateKeyPairSync} from 'node:crypto';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {createKeyPairSignerFromBytes} from '@solana/kit';
export async function wallets() {
  mkdirSync('secrets',{recursive:true,mode:0o700});
  const paths=Array.from({length:4},(_,i)=>`secrets/payer-${i}.json`);
  if (paths.some(existsSync)) throw Error('Key files already exist; refusing to overwrite');
  const addresses=[];
  for (const path of paths) {
    const {privateKey}=generateKeyPairSync('ed25519');
    const jwk=privateKey.export({format:'jwk'});
    const bytes=Buffer.concat([Buffer.from(jwk.d,'base64url'),Buffer.from(jwk.x,'base64url')]);
    const signer=await createKeyPairSignerFromBytes(bytes);
    writeFileSync(path,JSON.stringify([...bytes])+'\n',{mode:0o600,flag:'wx'});
    addresses.push({path,address:signer.address});
  }
  writeFileSync('data/payer-addresses.json',JSON.stringify(addresses,null,2)+'\n');
  console.log('Four local keypairs created; public addresses saved to data/payer-addresses.json. No funds moved.');
}
