"use server"

import { UploadFileProps } from "@/types"
import { createAdminClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message: string) => {
    console.log(error, message);

    throw error;
}

// pass the file through the props.
export const uploadFile = async ({ file, ownerId, accountId, path }: UploadFileProps) => {
    const {storage, databases} = await createAdminClient();

    try {
        // read it form the buffer through the blob and turn it into a input file.
        const inputFile = InputFile.fromBuffer(file, file.name);

        // store the file itself using appwrite storage functionality
        const bucketFile = await storage.createFile(appwriteConfig.bucketId, ID.unique(), inputFile);

        // metadata that we want attach to the file
        const fileDocument = {
            type: getFileType(bucketFile.name).type,
            name: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            users: [], // they are those who can access the file
            bucketFileId: bucketFile.$id, 
        }

        // store the metadata about file using appwrite database functionality
        const newFile = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filessCollectionId,
            ID.unique(),
            fileDocument,
        ).catch(async (error: unknown) => {
            // if something goes wrong while creating the db doc then we should not store file in storage
            await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
            handleError(error, "Failed to create the file document")
        })

        // if we are uploading from homepage then revalidat to home page, if uploading from document revalidate to document so that we can show the uploaded data
        revalidatePath(path);

        return parseStringify(newFile)
    } catch (error) {
        handleError(error, "Failed to upload file");
    }
}

const createQueries = (currentUser: Models.Document) => {
    // collection of appwrite queries
    const queries = [
        Query.or([
            Query.equal("owner", [currentUser.$id]),
            Query.contains("users", [currentUser.email]) // users attr is an array so not equal bcz 2 array can never be the same
        ])
    ]

    // TODO: Search, sort, limits, ...

    return queries;
}
// get the files based on some criteria
export const getFiles = async () => {
    // get access to appwrite db functionality
    const { databases } = await createAdminClient();

    // first, get the files the user has currently access to
    try {
        // get the user
        const currentUser = await getCurrentUser();

        if (!currentUser) throw new Error("User not found");

        // query are created to fetch files based on some critaria
        const queries = createQueries(currentUser);

        // make call to db
        const files = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filessCollectionId,
            queries,
        )

        return parseStringify(files);
    } catch (error) {
        handleError(error, "Failed to get files");
    }
}