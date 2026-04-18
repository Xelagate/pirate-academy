import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  generateKeyPairSigner,
  createKeyPairSignerFromBytes,
  pipe,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
  getSignatureFromTransaction,
  lamports,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { readFileSync } from "fs";
import { homedir } from "os";
import { getRegisterPirateInstructionAsync } from "../app/generated/pirate-academy";

const RPC_URL = "https://api.devnet.solana.com";

async function main() {
  const rpc = createSolanaRpc(RPC_URL);
  const rpcSubscriptions = createSolanaRpcSubscriptions(
    RPC_URL.replace("https://", "wss://")
  );
  const sendAndConfirm = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  // Existing devnet wallet as funder
  const keyBytes = JSON.parse(
    readFileSync(`${homedir()}/.config/solana/id.json`, "utf8")
  );
  const funder = await createKeyPairSignerFromBytes(new Uint8Array(keyBytes));

  // Fresh ephemeral pirate keypair so the PDA is always new
  const pirate = await generateKeyPairSigner();
  console.log("Funder:", funder.address);
  console.log("Pirate (ephemeral):", pirate.address);

  // Fund the pirate wallet from the funder
  const { value: bh1 } = await rpc.getLatestBlockhash().send();
  const fundTx = await pipe(
    createTransactionMessage({ version: 0 }),
    (msg) => setTransactionMessageFeePayer(funder.address, msg),
    (msg) => setTransactionMessageLifetimeUsingBlockhash(bh1, msg),
    (msg) =>
      appendTransactionMessageInstruction(
        getTransferSolInstruction({
          source: funder,
          destination: pirate.address,
          amount: lamports(10_000_000n),
        }),
        msg
      ),
    (msg) => signTransactionMessageWithSigners(msg)
  );
  await sendAndConfirm(fundTx, { commitment: "confirmed" });
  console.log("Funded pirate with 0.01 SOL");

  // Register the pirate profile
  const { value: bh2 } = await rpc.getLatestBlockhash().send();
  const ix = await getRegisterPirateInstructionAsync({
    authority: pirate,
    crewName: "Smoke Test Crew",
  });

  const tx = await pipe(
    createTransactionMessage({ version: 0 }),
    (msg) => setTransactionMessageFeePayer(pirate.address, msg),
    (msg) => setTransactionMessageLifetimeUsingBlockhash(bh2, msg),
    (msg) => appendTransactionMessageInstruction(ix, msg),
    (msg) => signTransactionMessageWithSigners(msg)
  );

  const sig = getSignatureFromTransaction(tx);
  await sendAndConfirm(tx, { commitment: "confirmed" });

  console.log(
    "\nExplorer:",
    `https://explorer.solana.com/tx/${sig}?cluster=devnet`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
