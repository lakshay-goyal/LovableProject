import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    /** Using relative URL to automatically use the current domain and port */
    baseURL: ""
})