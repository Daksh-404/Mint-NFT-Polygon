import { Connection, Keypair, LAMPORTS_PER_SOL } from  "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, transfer } from  "@solana/spl-token";

const quicknodeEndpoint = 'https://multi-powerful-putty.solana-devnet.discover.quiknode.pro/36e395be7071530d54e42f38a43d664f417fdc1a/';
const connection = new Connection(quicknodeEndpoint, "confirmed");
const secret = [251,221,227,35,209,62,220,71,50,21,142,165,216,141,51,59,43,2,88,173,231,62,252,238,19,15,118,160,91,103,212,48,45,111,149,73,40,194,135,199,106,88,125,25,247,100,60,208,14,30,129,144,46,218,38,143,220,179,54,41,163,62,12,25];
const fromWallet = Keypair.fromSecretKey(new Uint8Array(secret));
(async () => {
    
    // Create a new token 
    const mint = await createMint(
        connection, 
        fromWallet,            // Payer of the transaction
        fromWallet.publicKey,  // Account that will control the minting 
        null,                  // Account that will control the freezing of the token 
        0                      // Location of the decimal place 
    );

    // Get the token account of the fromWallet Solana address. If it does not exist, create it.
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );

    // Generate a new wallet to receive the newly minted token
    const toWallet = Keypair.generate();

    // Get the token account of the toWallet Solana address. If it does not exist, create it.
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        toWallet.publicKey
    );

    // Minting 1 new token to the "fromTokenAccount" account we just returned/created.
    let signature = await mintTo(
        connection,
        fromWallet,               // Payer of the transaction fees 
        mint,                     // Mint for the account 
        fromTokenAccount.address, // Address of the account to mint to 
        fromWallet.publicKey,     // Minting authority
        1                         // Amount to mint 
    );

    await setAuthority(
        connection,
        fromWallet,            // Payer of the transaction fees
        mint,                  // Account 
        fromWallet.publicKey,  // Current authority 
        0,                     // Authority type: "0" represents Mint Tokens 
        null                   // Setting the new Authority to null
    );

    signature = await transfer(
        connection,
        fromWallet,               // Payer of the transaction fees 
        fromTokenAccount.address, // Source account 
        toTokenAccount.address,   // Destination account 
        fromWallet.publicKey,     // Owner of the source account 
        1                         // Number of tokens to transfer 
    );

    console.log("SIGNATURE", signature);
})();

//NOTE: run commands- npx tsc index.ts, node index.js
//NOTE: open Solana explorer - https://explorer.solana.com/?cluster=devnet to verify the signature
