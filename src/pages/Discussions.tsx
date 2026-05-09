import { useState } from "react"
import type { Messages } from "../types/Messages"
import callDiscussions from "../lib/api/callDiscussions"
import ReactMarkdown from 'react-markdown'

export default function Discussions (){

    const [chat, setChat] = useState<Messages[]>([])
    const [userInputValue, setUserInputValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [latestResponse, setLatestResponse] = useState('')



    async function handleSubmit(){
        const updatedMessage = [...chat, {role: "user", content: userInputValue}]
         setChat(updatedMessage)
        setLoading(true)
        const response = await callDiscussions(updatedMessage)
        setLatestResponse(response)
        setChat([...updatedMessage, {role: "assistant", content: response}])
        setUserInputValue("")
        setLoading(false)
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
                          <div className="flex flex-col">
                             <textarea 
                             value={userInputValue}
                             placeholder={loading ? "please wait" : "Describe your project..."}
                             onChange={(e) => {
                                setUserInputValue(e.target.value)
                             }}
                             onKeyDown={(e => {
                                if(e.key === "Enter"){
                                    e.preventDefault()
                                    handleSubmit()
                                }
                             })}
                             />
                             <button 
                             disabled={loading}
                             onClick={() => handleSubmit()}>Submit</button>
                          </div>
                      </div>
                  </div>
              </section>
       </>
    )
}