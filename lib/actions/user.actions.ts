"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const getUserByEmail = async (email: string) => {
    // get admin llevel access over db
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])]
    )

    return result.total > 0 ? result.documents[0] : null;
}
const handleError = (error: unknown, message: string) => {
    console.log(error, message);

    throw error;
}
export const sendEmailOTP = async ({email}: {email: string}) => {
    const { account } = await createAdminClient();

    try {
        // send an email to user with a secret key
        const session = await account.createEmailToken(ID.unique(), email);

        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP");
    }
}
export const createAccount = async ({fullName, email}: {fullName: string, email: string}) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({email});
    if (!accountId)
        throw new Error("Failed to send an OTP");

    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: "",
                accountId,
            }
        );

        return parseStringify({ accountId })
    }
}
// whenever we pass large payload through server action we stringify and then parse that value
export const verifySecret = async ({accountId, password}: {accountId: string, password: string}) => {
    try {
        // get access to appwrite account
        const { account } = await createAdminClient();

        const session = await account.createSession(accountId, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        })

        return parseStringify({sessionId: session.$id})
    } catch (error) {
        handleError(error, "Failed to verify OTP");
    }
}
export const getCurrentUser = async () => {
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const user = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("accountId", result.$id)]
    )

    return user.total > 0 ? parseStringify(user.documents[0]) : null;
}
export const signOutUser = async () => {
    // get the session
    const { account } = await createSessionClient();

    try {
        // delete the session
        await account.deleteSession("current");
        // clear the cookie
        (await cookies()).delete("appwrite-session");
    } catch (error) {
        handleError(error, "Failed to sign out user")
    } finally {
        redirect("/sign-in");
    }
}
export const signInUser = async ({ email }: {email: string}) => {
    try {
        const existingUser = await getUserByEmail(email);

        // Users exists, send OTP
        if (existingUser) {
            await sendEmailOTP({email});
            return parseStringify({ accountId: existingUser.account });
        }

        return parseStringify({accountId: null, error: "User not found"});
    } catch (error) {
        handleError(error, "Failed to sign-in user");
    }
}