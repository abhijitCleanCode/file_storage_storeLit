"use server";

// All this services are running on server side
import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { appwriteConfig } from "./config";
import { cookies } from "next/headers";

// There are two possible ways to create a client, one is session client and other is admin client
export const createSessionClient = async () => {
    const client = new Client()
      .setEndpoint(appwriteConfig.endpointURL)
      .setProject(appwriteConfig.projectId);
  
    const session = (await cookies()).get("appwrite-session");
  
    if (!session || !session.value) throw new Error("No session");
  
    client.setSession(session.value);
  
    return {
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
    };
  };
  
// This client will be linked to specific user session. Letting user access their data and perform action they are allowed to such as logged in user can manage and update their data(files, images, ...)

// This is quite powerful as it creates client instance with admin level permission to manage our entire appwrite project.
// It will be used in the server when we need to do task such as create user, manage db, ... that need a higher level of access.
export const createAdminClient = async () => {
    //! Note: this should not be exposed to user directly
    const client = new Client()
        .setEndpoint(appwriteConfig.endpointURL)
        .setProject(appwriteConfig.projectId)
        .setKey(appwriteConfig.secretKey)

    return {
        get account() { return new Account(client) },
        get databases() { return new Databases(client) },
        get storage() { return new Storage(client) },
        get avatars() { return new Avatars(client) }
    }
}
