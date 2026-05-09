import { supabase } from "../supabaseClient";
import type { Messages } from "../../types/Messages";


export default async function callDiscussions(messages: Messages[]){
    const {data, error} = await supabase.functions.invoke("discussions", {
        body:{messages}
    })

    if(error){
        console.log(error)
    } else {
        console.log("Data received")
        console.log(data)
        return data.content[0].text
    }
}