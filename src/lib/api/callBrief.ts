import { supabase } from "../supabaseClient";
import type { Messages } from "../../types/Messages";


export default async function callBrief( messages: Messages[]){
    const {data, error:errorCallBrief} = await supabase.functions.invoke("generate-brief", {
        body:{messages}
    })
    console.log("callBrief - full response:", data)
    if(errorCallBrief){
        console.log("callBrief - Could not call brief function", errorCallBrief)
        throw errorCallBrief
    }

    if(!data || !data.content || data.content.length === 0){
        console.log("callBrief - No data exists to generate brief", errorCallBrief)
        throw errorCallBrief
    }

    console.log("Data received")
    console.log(data)
    return data.content[0].text
    
    
}