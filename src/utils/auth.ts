import { NextFunction, Request, Response } from "express";
import { verifyMessage } from "viem";
import { createSiweMessage } from "viem/siwe";

const auth = async (req: Request, walletAddress: `0x${string}`) => {
    try {
        const signature = req.headers['signature'] as `0x${string}`;
        const messageObjectStr = req.headers['message-object'] as string;

        const verified = await verifySignature(
            messageObjectStr, signature, walletAddress
        )
        return verified;
    } catch (error) {
        console.error('Error verifying the signature:', error);
        throw error;
    }
    // if(req.session && req.session.user){
    //     next();
    // }else{
    //     res.status(401).json({error: 'Unauthorized'});
    // }
}
export default auth;

export async function verifySignature(messageObjectStr: string, signature: `0x${string}`, address: `0x${string}`): Promise<boolean> {
    try {
        console.log(messageObjectStr);
        const messageObject = JSON.parse(messageObjectStr) as any;
        console.log(messageObject);

        const message = createSiweMessage({
            ...messageObject,
            issuedAt: new Date(messageObject.issuedAt) // Ensure 'issuedAt' is parsed as a Date object
        });

        console.log({ signature, message });

        // This function needs to be defined or imported to check the signature validity
        const verified = await verifyMessage({
            message,
            signature,
            address,  // Assume address is provided in messageObject
        });

        return verified;  // Returns true if signature is valid, false otherwise
    } catch (error) {
        console.error('Error verifying the signature:', error);
        return false;  // Return false if an error occurs
    }
}