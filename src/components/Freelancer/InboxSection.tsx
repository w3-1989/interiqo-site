import { supabase } from "../../lib/supabaseClient"
import type { Brief } from "../../types/Briefs"
import { useEffect, useState } from "react"


export default function InboxSection(){
    const [briefData, setBriefData] = useState<Brief[]>([])

    useEffect(()=> {
        async function getData (){
            const { data, error: errorGetBriefData } = await supabase
            .from('briefs')
            .select(`
                conversation_id, summary, created_at,
                conversations(
                    clients(
                    first_name,
                    last_name,
                    organisation
                    )
                )
            `)
            if(errorGetBriefData){
                console.log("InboxSection - error getting brief data",errorGetBriefData)
                throw errorGetBriefData
            } else {
                setBriefData(data)
            }
        }
        getData()
    },[])


    function displayData(){
       return briefData.map((data, index) => {
            return (
                <div key={index}>
                    <li>{data.conversations[0].clients[0].first_name}</li>
                    <li>{data.conversations[0].clients[0].last_name}</li>
                    <li>{data.conversations[0].clients[0].organisation}</li>
                    <li>{data.summary}</li>
                    <li>{new Date(data.created_at).toLocaleDateString()}</li>
                </div>
            )
        })
    }


    return (
        <>
        <h1>Inbox Section</h1>
        {displayData()}
        </>
    )
}