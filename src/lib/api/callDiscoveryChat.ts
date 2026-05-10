import { supabase } from "../supabaseClient";
import type { Messages } from "../../types/Messages";


export default async function callDiscoveryChat(messages: Messages[]){
    const {data, error:errorCallDiscoveryChat} = await supabase.functions.invoke("discovery-chat", {
        body:{messages}
    })

    if(errorCallDiscoveryChat){
    console.log("callDiscoveryChat - Error calling discovery chat", errorCallDiscoveryChat)
    throw errorCallDiscoveryChat
    }

    
    if((!data || !data.content || data.content.length === 0)){
        console.log("callDiscoveryChat - Couldn't find conversation data",errorCallDiscoveryChat)
        throw errorCallDiscoveryChat
    }

    
    console.log("Data received")
    console.log(data)
    return data.content[0].text

}