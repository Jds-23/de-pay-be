import { createPublicClient, createWalletClient, defineChain, encodeFunctionData, http, parseAbi, PrivateKeyAccount, PublicClient, WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, mode, optimism, polygon } from 'viem/chains'
import "dotenv/config";
import { Collection, Document } from "mongodb";
import { Status } from "../../relayer/evm";

export const optimismPublic = defineChain({
    id: 8453,
    name: 'Base',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://optimism.blockpi.network/v1/rpc/883181e1db6ac6999c8a70612e5186aea743e7a9'],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://optimism.blockscout.com/api/' },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 4286263,
        },
    },
})
export const basePublic = defineChain({
    id: 8453,
    name: 'Base',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://base.blockpi.network/v1/rpc/13ececf1a450e566d5372a2db08d62782b88b52e'],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://base.blockscout.com/api/' },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 5022,
        },
    },
})


export default class DAProvider {
    private evmproviderz: { [key: string]: PublicClient } = {};
    private evmwallet: { [key: string]: WalletClient } = {};
    private account: PrivateKeyAccount;
    private addresses: { [key: string]: `0x${string}` } = {
        "10": "0xe40Ad0ba24f0861995dCFcBb5C2192Fc92dfF85C",
        "8453": "0x7d25814114274F2A22d8bE43F575964890F0c8a9",
        "34443": "0x5C96CD07f3034670f297d567CD1517665F31c58F",
        "137": "0x26054DeB0968d40F2488f6822d390317047cef18"
    }
    private chainIdToChain: { [key: string]: any } = {
        "10": optimismPublic,
        "8453": basePublic,
        "34443": mode,
        "137": polygon
    }
    // private CONTRACT_ADDRESS = '0x26054DeB0968d40F2488f6822d390317047cef18' as `0x${string}`;
    private PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
    constructor() {
        this.evmproviderz = {
            137: createPublicClient({
                chain: polygon,
                transport: http(),
            }),
            10: createPublicClient({
                chain: optimismPublic,
                transport: http(),
            }),
            8453: createPublicClient({
                chain: basePublic,
                transport: http(),

            }),
            34443: createPublicClient({
                chain: mode,
                transport: http(),
            }),
        }
        this.evmwallet = {
            137: createWalletClient({
                chain: polygon,
                transport: http(),
            }),
            10: createWalletClient({
                chain: optimismPublic,
                transport: http(),
            }),
            8453: createWalletClient({
                chain: basePublic,
                transport: http(),
            }),
            34443: createWalletClient({
                chain: mode,
                transport: http(),
            }),
        }
        this.account = privateKeyToAccount(this.PRIVATE_KEY)
    }

    async getNonce(chainId: number) {
        try {
            const client = this.evmproviderz[chainId];
            const nonce = await client.getTransactionCount({
                address: this.addresses[chainId],
                blockTag: 'latest',
            });
            return nonce;
        } catch (e) {
            console.log(e);
        }
    }

    async getDA(
        chainId: number,
        genericData: {
            callTo: `0x${string}`;
            approvalTo: `0x${string}`;
            data: `0x${string}`;
            srcToken: `0x${string}`;
            refundAddress: `0x${string}`;
        },
        salt: `0x${string}`
    ) {
        const client = this.evmproviderz[chainId];
        const abi = parseAbi([
            "function addressForTokenDeposit(bytes32 salt,GenericData calldata genericData) external view returns (address)",
            "struct GenericData {address callTo;address approvalTo;bytes data;address srcToken;address refundAddress;}"
        ]);
        // const data = await client.getDA('0x1396f41d89b96eaf29a7ef9ee01ad36e452235ae');

        const data = await client.readContract({
            address: this.addresses[chainId],
            abi: abi,
            functionName: 'addressForTokenDeposit',
            args: [
                salt,
                genericData
            ],
        });
        return data;
    }

    async getTokenBalance(chainId: number, tokenAddress: `0x${string}`, account: `0x${string}`) {
        if (tokenAddress.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            const client = this.evmproviderz[chainId];
            const data = await client.getBalance({
                address: account,
            });
            return data;
        }
        const client = this.evmproviderz[chainId];
        const abi = parseAbi([
            "function balanceOf(address account) external view returns (uint256)",
        ]);
        const data = await client.readContract({
            address: tokenAddress,
            abi: abi,
            functionName: 'balanceOf',
            args: [account],
        });
        return data;
    }

    // function sendTokenDeposit(
    //     bytes32 salt,
    //     ReceiverImplementation.GenericData calldata genericData
    // ) external

    async waitForTransactionReceipt(chainId: number, hash: `0x${string}`, confirmations: number, collection: Collection<Document>) {
        try {
            const client = this.evmproviderz[chainId];
            const receipt = await client.waitForTransactionReceipt({
                hash: hash,
                confirmations: confirmations,
            });
            if (receipt.status === "reverted") {
                await collection.updateOne({ relayTxn: hash }, { $set: { relayTxn: receipt.transactionHash, status: Status.FAILED } });
            } else {
                await collection.updateOne({ relayTxn: hash }, { $set: { relayTxn: receipt.transactionHash, status: Status.SUCCESS } });
            }
            return receipt;
        } catch (e) {
            console.log(e);
        }
    }

    async sendTokenDeposit(
        chainId: number,
        salt: `0x${string}`,
        genericData: {
            callTo: `0x${string}`;
            approvalTo: `0x${string}`;
            data: `0x${string}`;
            srcToken: `0x${string}`;
            refundAddress: `0x${string}`;
        },
        simulate: boolean = false
    ) {
        try {
            const client = this.evmwallet[chainId];
            const abi = parseAbi([
                "function sendTokenDeposit(bytes32 salt,GenericData calldata genericData) external",
                "struct GenericData {address callTo;address approvalTo;bytes data;address srcToken;address refundAddress;}"
            ]);

            const calldatadata = encodeFunctionData({
                // address: this.CONTRACT_ADDRESS,
                abi: abi,
                functionName: 'sendTokenDeposit',
                args: [
                    salt,
                    genericData
                ],
            });

            const provider = this.evmproviderz[chainId];
            const gas = await provider.estimateGas({
                account: this.account,
                to: this.addresses[chainId],
                data: calldatadata,
                // abi: abi,
                // functionName: 'sendTokenDeposit',
                // args: [
                //     salt,
                //     genericData
                // ],
            });

            console.log("estimated gas", gas)


            const txnHash = await client.sendTransaction({
                account: this.account,
                to: this.addresses[chainId],
                data: calldatadata,
                chain: this.chainIdToChain[chainId],
                gas: gas * BigInt(3000000) / BigInt(1000000)
            });

            // await this.evmproviderz[137].waitForTransactionReceipt({
            //     hash: txnHash,
            //     confirmations: 1,
            // });

            return txnHash;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}