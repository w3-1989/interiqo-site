import { useState, useEffect, useContext } from "react"
import type { Messages } from "../../types/Messages"
import callDiscoveryChat from "../../lib/api/Client/callDiscoveryChat";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import TopBarSimple from "../../components/General/TopBarSimple";
import Background from "../../assets/backgrounds/GeometricBG.svg?react"
import DiamondLM from "../../assets/branding/Client/DiamondLM.svg?react"
import DiamondDM from "../../assets/branding/Client/DiamondDM.svg?react"
import { ThemeContext } from "../../context/ThemeContext";
import { FileUp, ArrowUp } from "lucide-react"

export default function DiscoveryChat (){

    const [chat, setChat] = useState<Messages[]>([])
    const [userInputValue, setUserInputValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [latestResponse, setLatestResponse] = useState('')
    const [conversationId, setConversationId] = useState(null)
    const [submitProject, setSubmitProject] = useState(true)
    const [clientName, setClientName] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [displayedText, setDisplayedText] = useState('')
    const [textQueue, setTextQueue] = useState('')


    const {isDarkMode} = useContext(ThemeContext)

    const navigate = useNavigate()

    useEffect(() => {
  if (textQueue.length === 0) return  
  const interval = setInterval(() => {
    setDisplayedText(prev => prev + textQueue[0])
    setTextQueue(prev => prev.slice(1))
  }, 5)
  return () => clearInterval(interval)
}, [textQueue])


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

            setClientName(clientData[0].first_name)


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
        setLatestResponse('')
        setTextQueue('')
        setDisplayedText('')

        const updatedMessage = [...chat, {role: "user" as const, content: currentInput}]
         setChat(updatedMessage)
        setLoading(true)
        setIsStreaming(true)
        const response = await callDiscoveryChat(updatedMessage, (chunk) => {
            setTextQueue(prev => prev + chunk.replace("SUBMIT_PROJECT", ""))
            })
        setChat([...updatedMessage, {role: "assistant" as const, content: response ?? ''}])
        setIsStreaming(false)
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
            content: (response ?? '').replace("SUBMIT_PROJECT", "").trim()
        })

        if(errorInsertAssistantResponse){
            console.log("DiscoveryChat - Error inserting assistant message into db",errorInsertAssistantResponse)
            throw errorInsertAssistantResponse
        }

        setLoading(false)

        if((response ?? '').includes("SUBMIT_PROJECT")){
            setSubmitProject(false)
        }
    }

    function handleProjectSubmit(){
        return navigate("/confirm-project-report")        
    }

    function greetingMsg(){
       const timeOfDay = new Date().getHours()
       if(timeOfDay >= 5 && timeOfDay <= 11){
        return "Rise and shine"
       } else if (timeOfDay >= 12 && timeOfDay <= 17){
        return "Afternoon"
       } else if (timeOfDay >= 18 || timeOfDay < 5){
        return "Evening"
       }

    }


if (!clientName) return (
  <div className="h-screen flex flex-col items-center justify-center dark:bg-interiqo-black-500">
    <Background className="absolute left-0 top-0 h-screen opacity-20"/>
    {isDarkMode ? <DiamondDM className="h-20 w-auto drop-shadow-lg animate-float"/> : <DiamondLM className="h-20 w-auto drop-shadow-lg animate-float"/>}
  </div>
)


return (
  <>
  <div className="h-screen flex flex-col dark:bg-interiqo-black-500">
    <Background className="absolute h-screen opacity-20"/>
    <TopBarSimple disableToggle={!!(displayedText || isStreaming || textQueue)}/>
    <section className="flex-1 flex flex-col justify-center items-center">
      <div className="flex flex-col items-center gap-8 -mt-16">
        
        {(displayedText || isStreaming) ? null : clientName && (
        <div className={`transition-opacity duration-700 ${clientName ? 'opacity-100' : 'opacity-0'} absolute top-1/2 left-1/2 -translate-x-1/2 top-[35%] flex flex-row items-center gap-6  ${(displayedText || isStreaming) ? 'invisible' : ''}`}>
          {isDarkMode ? <DiamondDM className="h-20 w-auto drop-shadow-lg animate-float"/> : <DiamondLM className="h-20 w-auto drop-shadow-lg animate-float"/>}
          <h1 className="text-[48px] font-avant dark:text-white capitalize">{greetingMsg()}, {clientName}</h1>
        </div>)}

        <div className="max-w-[648px] w-[648px] h-[364px] overflow-y-auto dark:text-white flex flex-col snap-y gap-3">
          {(displayedText || isStreaming) && (
            <div className="flex flex-row items-start gap-4">
              {isDarkMode ? <DiamondDM className="min-h-[40px] min-w-[40px] h-10 w-auto drop-shadow-lg animate-float"/> 
              : <DiamondLM className="min-h-[40px] min-w-[40px] h-10 w-auto drop-shadow-lg animate-float"/>}
              <p>{displayedText}</p>
            </div>
          )}
        </div>

        <div className="shadow-[0_4px_120px_30px_rgba(88,5,255,0.1)] dark:shadow-[0_4px_120px_30px_rgba(88,5,255,0.2)] p-4 bg-white dark:bg-black w-[648px] min-h-[150px] flex flex-col justify-between gap-4">
          <textarea
            className="outline-none border-none resize-none bg-transparent dark:text-white"
            value={userInputValue}
            placeholder={latestResponse ? "Write a response..." : "Describe your project..."}
            onChange={(e) => {
              setUserInputValue(e.target.value)
              setSubmitProject(true)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleResponseSubmit()
              }
            }}
          />
          <div className="flex flex-row justify-between">
            <button
              className=" z-2 flex items-center justify-center min-h-10 min-w-10 bg-white dark:bg-interiqo-black-400 border border-black/5 cursor-pointer"
              onClick={() => handleResponseSubmit()}>
              <FileUp color={isDarkMode ? "white" : "black"} className="w-4 h-4"/>
            </button>
            {submitProject
              ? <button
                  className="flex items-center justify-center min-h-10 min-w-10 bg-interiqo-purple-400 cursor-pointer"
                  disabled={loading}
                  onClick={() => handleResponseSubmit()}>
                  {loading
                    ? <span className="flex gap-1">
                        <span className="dot-1 w-1 h-1 bg-white rounded-full"/>
                        <span className="dot-2 w-1 h-1 bg-white rounded-full"/>
                        <span className="dot-3 w-1 h-1 bg-white rounded-full"/>
                      </span>
                    : <ArrowUp color="white" className="w-4 h-4"/>
                  }
                </button>
              : <button
                  className="flex items-center justify-center min-w-[170px] min-h-[38px] bg-interiqo-purple-400 text-xs text-white cursor-pointer"
                  disabled={submitProject}
                  onClick={() => handleProjectSubmit()}>
                  Generate Project Brief
                </button>
            }
          </div>
        </div>

      </div>
    </section>
  </div>
  </>
)}