// const { ethers } = require("ethers");
// const { MongoClient } = require("mongodb");

import { MongoClient } from "mongodb";
import DAProvider from "../server/provider/DAProvider";
import { client, collectionName, connectMongo, dbName } from "../db/mongoclient";
import { Status } from "./evm";



// // Setup MongoDB
// const uri = "mongodb://admin:adminpassword@localhost:27017/";
// const client = new MongoClient(uri, {
// 	useNewUrlParser: true,
// 	useUnifiedTopology: true,
// });
// const dbName = "RouterRelay";
// const collectionName = "depositData";

// Setup ethers provider and wallet
// const provider = new ethers.JsonRpcProvider(
// 	"https://polygon.blockpi.network/v1/rpc/77c61dcd6cd6031f37f82cf022d15cb484c7af13"
// );
// const privateKey =
//     "3043018513db8d21ea691c50eaa09135b47336c8518af8e9d265e603384d7628"; // Relayer's Private Key
// const wallet = new ethers.Wallet(privateKey, provider);

// Contract ABI and Address
// const contractABI = [
//     "function sendTokenDeposit(bytes32 salt, tuple(address callTo, address approvalTo, bytes data, address srcToken, address refundAddress) genericData) external",
//     "function balanceOf(address account) external view returns (uint256)",
// ];
// const contractAddress = "0x26054DeB0968d40F2488f6822d390317047cef18";
// const contract = new ethers.Contract(contractAddress, contractABI, wallet);




async function processEntries() {
    try {
        const collection = client.db(dbName).collection(collectionName);
        const entries = await collection.find({ relayTxn: null }).toArray();

        for (let entry of entries) {
            const depositMeta = entry.depositMeta as {
                depositAddress: `0x${string}`;
                genericData: {
                    callTo: `0x${string}`;
                    approvalTo: `0x${string}`;
                    data: `0x${string}`;
                    srcToken: `0x${string}`;
                    refundAddress: `0x${string}`;
                };
                salt: `0x${string}`;
                sourceAmount: string;
                chainId: number;
            };
            const createdAt = entry.createdAt as Date;
            console.log(entry.createdAt);
            if (createdAt < new Date(Date.now() - 1000 * 60 * 5)) {
                collection.deleteOne({ _id: entry._id });
                continue;
            }

            const salt = depositMeta.salt;
            const genericData = depositMeta.genericData;
            const chainId = depositMeta.chainId;
            // const sourceAmount = depositMeta.sourceAmount;

            // Check the token balance
            const da = new DAProvider();
            // const balance = await tokenContract.balanceOf(depositMeta.depositAddress);
            const balance = await da.getTokenBalance(
                chainId,
                genericData.srcToken,
                depositMeta.depositAddress
            );
            console.log(balance == BigInt(0));
            if (balance > 0) {
                // balance is greater than 0
                try {
                    // Simulate the transaction
                    // const tx = await contract.callStatic.sendTokenDeposit(
                    // 	salt,
                    // 	genericData,
                    // 	{ from: wallet.address }
                    // );
                    // If simulation succeeds, send the real transaction
                    const realTx = await da.sendTokenDeposit(chainId, salt, genericData);
                    // Update the database entry with the transaction hash
                    await collection.updateOne(
                        { _id: entry._id },
                        { $set: { relayTxn: realTx, status: Status.DISPATCHED } }
                    );
                    da.waitForTransactionReceipt(chainId, realTx, 1, collection);

                    console.log(
                        "Transaction successful with hash:",
                        realTx
                    );
                } catch (simError) {
                    console.error("Transaction simulation failed:", simError);
                }
            } else {
                console.log(
                    "Insufficient token balance to proceed with the transaction."
                );
            }
        }
    } catch (err) {
        console.error("Error processing entries:", err);
    }
}

async function relayer() {
    await connectMongo();
    while (true) {
        await processEntries();
        console.log("Waiting for 3 seconds before checking for new entries...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
}
// run();

export default relayer;