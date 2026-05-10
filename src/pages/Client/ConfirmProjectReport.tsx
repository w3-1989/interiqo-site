/*
Future fix - currently fetches the first conversation found for this client.
When multi-project support is added, the conversation_id should be passed
as a URL param from DiscoveryChat to ensure the correct conversation brief
is generated and stored.
*/

import callBrief from "../../lib/api/callBrief";
import { supabase } from "../../lib/supabaseClient"
import { useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'
import { useNavigate } from "react-router-dom";


export default function ConfirmProjectReport(){

    const [brief, setBrief ] = useState('')

    const navigate = useNavigate()


    useEffect(() => {
            async function getMessages() {
                const { data: { user }, error:errorGettingUser } = await supabase.auth.getUser()

                 if(!user){
                console.log("ConfirmProjectReport - error finding user data, data doesn't exist", errorGettingUser)
                throw errorGettingUser
                }

                if(errorGettingUser){
                    console.log("ConfirmProjectReport - error getting the user",errorGettingUser)
                    throw errorGettingUser
                }

                const { data: clientData, error:errorSelectingClientData } = await supabase
                .from('clients')
                .select()
                .eq("user_id", user!.id)

                    if(!clientData){
                    console.log("ConfirmProjectReport - error finding client data", errorSelectingClientData)
                    throw errorSelectingClientData
                }


                if(errorSelectingClientData){
                    console.log("ConfirmProjectReport - error selecting client data", errorSelectingClientData)
                    throw errorSelectingClientData
                }

                const { data: conversationId, error:errorSelectingConversationId } = await supabase
                .from('conversations')
                .select()
                .eq("client_id", clientData![0].id)

                if(errorSelectingConversationId){
                console.log("ConfirmProjectReport - error selecting conversation id", errorSelectingConversationId)
                throw errorSelectingConversationId
                }

                const { data:messages, error: errorFetchingMessages} = await supabase
                .from('messages')
                .select()
                .eq('conversation_id', conversationId![0].id)

                if(errorFetchingMessages){
                    console.log("ConfirmProjectReport - error fetching messages related to user",errorFetchingMessages)
                    throw errorFetchingMessages
                }
                
               const filteredMessages = messages!
                .map(({ role, content }) => ({ role: role as "user" | "assistant", content }))
                .filter((_, index, arr) => !(index === arr.length - 1 && arr[index].role === 'assistant'))

                const briefResults = await callBrief(filteredMessages)         
                setBrief(briefResults)
              

               const { data:existingBrief, error:errorCheckingExistingBrief} = await supabase
               .from('briefs')
               .select()
               .eq('conversation_id', conversationId![0].id)

               if(errorCheckingExistingBrief){
                console.log("ConfirmProjectReport - error checking existing briefs", errorCheckingExistingBrief)
                throw errorCheckingExistingBrief
               }
               
               if(existingBrief && existingBrief.length === 0){
                    const { error:errorUpdatingBrief} = await supabase
                    .from('briefs')
                    .insert({
                        summary: briefResults,
                        full_transcript: JSON.stringify(messages),
                        conversation_id: conversationId![0].id
                })

                if(errorUpdatingBrief){
                    console.log("ConfirmProjectReport - error updating brief data",errorUpdatingBrief)
                    throw errorUpdatingBrief
                }


               } else {
                return console.log('Item exists')
               }

            }
            getMessages()
        },[])

        function handleBrief(){
            navigate('/client-dashboard')
        }

    return(
        <>
        <ReactMarkdown>{brief}</ReactMarkdown>
        <button 
         className="rounded-md bg-slate-800 py-2 px-4 border
        border-transparent text-center text-sm text-white
        transition-all shadow-md hover:shadow-lg focus:bg-slate-700
        focus:shadow-none active:bg-slate-700 hover:bg-slate-700
        active:shadow-none disabled:pointer-events-none disabled:opacity-50
        disabled:shadow-none ml-2"
        onClick={handleBrief}
        >Confirm Brief</button>
        </>
    )
}