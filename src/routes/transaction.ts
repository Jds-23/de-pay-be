import { Router, Request, Response } from 'express';
import APIProvider from '../../utils/APIProvider';
import { logger } from '../../utils/logger';
import DAProvider from '../provider/DAProvider';
import { client, collectionName, connectMongo, dbName } from "../../db/mongoclient";
import { ObjectId } from 'mongodb';

/**
 * Creates a router for token-related routes.
 * 
 * @returns {Router} Router configured with token-related routes.
 */
export const transactionRoute = (): Router => {
    const transactionRouter = Router();

    // Endpoint to get token metadata
    transactionRouter.post('/transaction', async (req: Request, res: Response) => {
        try {
            // const { dataProvider } = req;
            // let tokenMetadata = pathProvider.tokenMetadata;
            // Check if tokenMetadata and its transaction property exist before proceeding
            // fetch("http://localhost:9019/transaction", {
            //     "headers": {
            //       "content-type": "application/json",
            //       "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
            //       "sec-ch-ua-mobile": "?0",
            //       "sec-ch-ua-platform": "\"macOS\"",
            //       "Referer": "http://localhost:3000/",
            //       "Referrer-Policy": "strict-origin-when-cross-origin"
            //     },
            //     "body": "{\"flowType\":\"trustless\",\"isTransfer\":true,\"isWrappedToken\":false,\"allowanceTo\":\"0x1396f41d89b96eaf29a7ef9ee01ad36e452235ae\",\"bridgeFee\":{\"amount\":\"24219\",\"decimals\":6,\"symbol\":\"USDT\",\"address\":\"0xc2132D05D31c914a87C6611C10748AEb04B58e8F\"},\"fromTokenAddress\":\"0xc2132d05d31c914a87c6611c10748aeb04b58e8f\",\"toTokenAddress\":\"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9\",\"source\":{\"chainId\":\"137\",\"chainType\":\"evm\",\"asset\":{\"decimals\":6,\"symbol\":\"USDT\",\"name\":\"Tether USD\",\"chainId\":\"137\",\"address\":\"0xc2132D05D31c914a87C6611C10748AEb04B58e8F\",\"resourceID\":\"usdt\",\"isMintable\":false,\"isWrappedAsset\":false},\"stableReserveAsset\":{\"decimals\":6,\"symbol\":\"USDT\",\"name\":\"Tether USD\",\"chainId\":\"137\",\"address\":\"0xc2132D05D31c914a87C6611C10748AEb04B58e8F\",\"resourceID\":\"usdt\",\"isMintable\":false,\"isWrappedAsset\":false},\"tokenAmount\":\"42957042\",\"stableReserveAmount\":\"42957042\",\"path\":[],\"flags\":[],\"priceImpact\":\"0\",\"tokenPath\":\"\",\"dataTx\":[]},\"destination\":{\"chainId\":\"42161\",\"chainType\":\"evm\",\"asset\":{\"decimals\":6,\"symbol\":\"USDT\",\"name\":\"Tether USD\",\"chainId\":\"42161\",\"address\":\"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9\",\"resourceID\":\"usdt\",\"isMintable\":false,\"isWrappedAsset\":false},\"stableReserveAsset\":{\"decimals\":6,\"symbol\":\"USDT\",\"name\":\"Tether USD\",\"chainId\":\"42161\",\"address\":\"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9\",\"resourceID\":\"usdt\",\"isMintable\":false,\"isWrappedAsset\":false},\"tokenAmount\":\"42932823\",\"stableReserveAmount\":\"42932823\",\"path\":[],\"flags\":[],\"priceImpact\":\"0\",\"tokenPath\":\"\",\"dataTx\":[]},\"partnerId\":1,\"fuelTransfer\":null,\"slippageTolerance\":\"1\",\"estimatedTime\":40,\"receiverAddress\":\"0xA40DA4D0272B2dc571bAf9122165Dd29989Ae81C\"}",
            //     "method": "POST"
            //   });
            const apiProvider = new APIProvider({
                name: "nitro_pathfinder_api",
                baseUrl: "https://api-beta.pathfinder.routerprotocol.com/api/v2/",
                retryCount: 3,
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const responseObject: {
                txn: {
                    to: `0x${string}`;
                    data: `0x${string}`;
                    from: `0x${string}`;
                };
                fromTokenAddress: `0x${string}`,
                source: {
                    tokenAmount: string;
                }
            } = await apiProvider.post('transaction', {
                body: {
                    ...req.body,
                    senderAddress: "0x40d5250D1ce81fdD1F0E0FB4F471E57AA0c1FaD3",
                }
            });
            const daProvider = new DAProvider();
            const genericData = {
                callTo: responseObject.txn.to,
                approvalTo: responseObject.txn.to,
                data: responseObject.txn.data,
                srcToken: responseObject.fromTokenAddress,
                refundAddress: responseObject.txn.from,
            }

            const nonce = await daProvider.getNonce(137); // Get the current timestamp
            // const salt = `0x${timestamp.toString(16).padStart(64, '0')}` as `0x${string}`; // Convert to hexadecimal and assert the type
            // console.log(salt); // Outputs the salt
            let salt =
                "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

            if (nonce) {
                salt = `0x${nonce.toString(16).padStart(64, '0')}` as `0x${string}`;
            }

            const depositAddress = await daProvider.getDA(137, {
                callTo: responseObject.txn.to,
                approvalTo: responseObject.txn.to,
                data: responseObject.txn.data,
                srcToken: responseObject.fromTokenAddress,
                refundAddress: responseObject.txn.from,
            },
                salt
            );
            // Save to MongoDB
            const collection = client.db(dbName).collection(collectionName);
            console.log(depositAddress.slice(0, 24).length);
            await collection.insertOne({
                depositMeta: { depositAddress, genericData, salt, sourceAmount: responseObject.source.tokenAmount },
                relayTxn: null, // Initial value for relayTxn
                createdAt: new Date(), // Current date and time
            });

            console.log("Saved depositMeta to MongoDB");
            // if (response && response.transaction) {
            res.json({
                ...responseObject, depositMeta: { depositAddress, genericData, salt }
            });
            // } else {
            //     // If no token metadata is available, return an appropriate response
            //     res.status(404).json({ success: false, message: "Token metadata not found." });
            // }
        } catch (error) {
            // Log the error using a logger instead of console.error
            logger.error('Error fetching data:', error);
            // Respond with an error status and a generic message
            res.status(500).json({ success: false, message: "An error occurred while fetching token data." });
        }
    });

    return transactionRouter;
};