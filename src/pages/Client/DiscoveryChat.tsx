import { useState, useEffect } from "react"
import type { Messages } from "../../types/Messages"
import callDiscoveryChat from "../../lib/api/callDiscoveryChat";
import ReactMarkdown from 'react-markdown'
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function DiscoveryChat (){

    const [chat, setChat] = useState<Messages[]>([])
    const [userInputValue, setUserInputValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [latestResponse, setLatestResponse] = useState('')
    const [conversationId, setConversationId] = useState(null)
    const [submitProject, setSubmitProject] = useState(true)

    const navigate = useNavigate()


        useEffect(() => {
        async function fetchConvoId() {
            const { data: { user }, error:errorGettingUser} = await supabase.auth.getUser()
            
             if(!user){
                console.log("DiscoveryChat - error finding user data, data doesn't exist", errorGettingUser)
                throw errorGettingUser
            }

              if(errorGettingUser){
                console.log("DiscoveryChat - error getting the user",errorGettingUser)
                throw errorGettingUser
            }
            
            const { data: clientData , error:errorSelectingClientData } = await supabase
            .from('clients')
            .select()
            .eq("user_id", user!.id)

            if(!clientData){
                console.log("DiscoveryChat - error finding client data", errorSelectingClientData)
                throw errorSelectingClientData
            }


            if(errorSelectingClientData){
                console.log("DiscoveryChat - error selecting client data", errorSelectingClientData)
                throw errorSelectingClientData
            }



            const { data:conversationData, error:errorSelectingConversationId } = await supabase
            .from('conversations')
            .select('id')
            .eq('client_id', clientData![0].id)

            if(errorSelectingConversationId){
                console.log("DiscoveryChat - error selecting conversation id", errorSelectingConversationId)
                throw errorSelectingConversationId

            } else{
                console.log("Conversation id assigned")
                setConversationId(conversationData![0].id)
            }
        }

        fetchConvoId()
    },[])


    async function handleResponseSubmit(){

        const currentInput = userInputValue
        setUserInputValue("")
        const updatedMessage = [...chat, {role: "user" as const, content: currentInput}]
         setChat(updatedMessage)
        setLoading(true)
        const response = await callDiscoveryChat(updatedMessage)
        setLatestResponse(response.replace("SUBMIT_PROJECT", "").trim())
        setChat([...updatedMessage, {role: "assistant" as const, content: response}])

         const { error:errorInsertUserMessage }  = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            role: 'user',
            content: currentInput
        })

        if(errorInsertUserMessage){
            console.log("DiscoveryChat - Error inserting user message into db",errorInsertUserMessage)
            throw errorInsertUserMessage
        }


         const { error:errorInsertAssistantResponse}  = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: response.replace("SUBMIT_PROJECT", "").trim()
        })

        if(errorInsertAssistantResponse){
            console.log("DiscoveryChat - Error inserting assistant message into db",errorInsertAssistantResponse)
            throw errorInsertAssistantResponse
        }

        setLoading(false)

        if(response.includes("SUBMIT_PROJECT")){
            setSubmitProject(false)
        }
    }

    function handleProjectSubmit(){
        return navigate("/confirm-project-report")        
    }



    return (
       <>
       <section className="h-screen flex flex-col justify-center items-center bg-gray-100">
                  <div className="flex flex-col w-120 h-120 rounded-2xl gap-6 bg-white drop-shadow-md  p-5">
                       <div className="flex flex-col text-center mt-6">
                          <h1 className="text-2xl font-avant">Discovery Session</h1>
                          <div className=" flex flex-col snap-y gap-3 bg-amber-100 mb-3">
                            <ReactMarkdown>{latestResponse}</ReactMarkdown>
                          </div>
                          <div className="flex flex-col gap-3">
                             <textarea 
                             value={userInputValue}
                             placeholder={loading ? "please wait" : "Describe your project..."}
                             onChange={(e) => {
                                setUserInputValue(e.target.value)
                                setSubmitProject(true)
                             }}
                             onKeyDown={(e => {
                                if(e.key === "Enter"){
                                    e.preventDefault()
                                    handleResponseSubmit()
                                }
                             })}
                             />
                             <button 
                             className="rounded-md bg-slate-800 py-2 px-4 border
                              border-transparent text-center text-sm text-white
                               transition-all shadow-md hover:shadow-lg focus:bg-slate-700
                                focus:shadow-none active:bg-slate-700 hover:bg-slate-700
                                 active:shadow-none disabled:pointer-events-none disabled:opacity-50
                                  disabled:shadow-none ml-2"
                             disabled={loading}
                             onClick={() => handleResponseSubmit()}>Send response</button>
                             <button 
                             className="rounded-md bg-green-800 py-2 px-4 border 
                             border-transparent text-center text-sm text-white 
                             transition-all shadow-md hover:shadow-lg focus:bg-slate-700 
                             focus:shadow-none active:bg-slate-700 hover:bg-slate-700 
                             active:shadow-none disabled:pointer-events-none disabled:opacity-50 
                             disabled:shadow-none ml-2"

                             disabled={submitProject}
                             onClick={() => handleProjectSubmit()}>Submit Project</button>
                          </div>
                      </div>
                  </div>
              </section>
       </>
    )
}