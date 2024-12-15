import { Connection, Transaction, SystemProgram, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";


async function main() {
  const suppliedToPubkey = process.argv[2] || null;

  if (!suppliedToPubkey) {
    console.log('Please provide a public key to send to');
    process.exit(1);
  }

  const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");
  console.log(`SuppliedToPubkey: ${suppliedToPubkey}`);

  const toPubkey = new PublicKey(suppliedToPubkey);
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  console.log("Loaded our own keypair, the destination public key");

  const LAMPORTS_TO_SEND = 3000;

  try {
    const recipientInfo = await connection.getAccountInfo(toPubkey);
    console.log('Recipient Account Info:', recipientInfo);

    const transaction = new Transaction();

    const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey,
      lamports: LAMPORTS_TO_SEND,
    });

    transaction.add(sendSolInstruction);

    // Set recent blockhash to prevent duplicate transactions
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;

    const signature = await sendAndConfirmTransaction(connection, transaction, [ senderKeypair ]);

    console.log(`Finished! Send ${LAMPORTS_TO_SEND} to the address ${toPubkey}`);
    console.log(`Transaction signature is ${signature}!`);

  } catch (err) {
    console.log('Transaction error:', err);

    if (err.name === 'SendTransactionError') {
      console.error('Transaction Logs:', err.getLogs());
    }
  }
}

main();
