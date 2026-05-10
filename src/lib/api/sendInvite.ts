import { supabase } from "../supabaseClient";


export default async function sendInvite (firstName: string, lastName: string, email: string){
    const {error} = await supabase.functions.invoke("send-invite", {
        body: {firstName, lastName, email}
    })

    if(error){
        console.log("sendInvite - failed to invoke send-invite Edge Function:", error)
        throw error
    } else {
        console.log("Data received")
    }
}

