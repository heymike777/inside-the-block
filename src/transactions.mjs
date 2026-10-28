import { createHash } from 'node:crypto';
import { address, pipe, createTransactionMessage, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstructions, signTransactionMessageWithSigners, getBase64EncodedWireTransaction, getSignatureFromTransaction } from '@solana/kit';
const compute = address('ComputeBudget111111111111111111111111111111');
const memo = address('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
export async function buildProbe(signer, lifetime, cell, tag) {
  const limit = new Uint8Array(5); limit[0] = 2; new DataView(limit.buffer).setUint32(1, cell.units, true);
  const price = new Uint8Array(9); price[0] = 3; new DataView(price.buffer).setBigUint64(1, BigInt(cell.price), true);
  const message = pipe(createTransactionMessage({ version: 0 }),
    m => setTransactionMessageFeePayerSigner(signer, m),
    m => setTransactionMessageLifetimeUsingBlockhash({ blockhash: lifetime.blockhash, lastValidBlockHeight: BigInt(lifetime.lastValidBlockHeight) }, m),
    m => appendTransactionMessageInstructions([{ programAddress: compute, data: limit }, { programAddress: compute, data: price }, { programAddress: memo, data: new TextEncoder().encode(createHash('sha256').update(tag).digest('hex').slice(0,16)) }], m));
  const tx = await signTransactionMessageWithSigners(message);
  return { wire: getBase64EncodedWireTransaction(tx), signature: getSignatureFromTransaction(tx), message: Buffer.from(tx.messageBytes).toString('base64') };
}
