import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import createClientAcc from "../lib/api/createClientAcc"
import passwordValidation from "../utils/passwordValidation"
import { useNavigate } from "react-router-dom";

export default function Discovery(){

    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState<string>("")
    const [organisation, setOrganisation] = useState("")
    const [password, setPassword] = useState("")
    const [passwordCheck, setPasswordCheck] = useState({
        minLength: false,
        containsNum: false,
        containsUppercaseLetter: false,
        containsSpecialCharacter: false
    })

    const navigate = useNavigate()


    useEffect(() => {
        const fetchEmail= async () => {

            const {data, error} = await supabase
            .from('invite')
            .select('email, claimed')
            .eq("token", searchParams.get("token"))

            // 1. Check if token exists
            if(!data || data.length === 0 ){
                return navigate("/")
            }
    
            // 2. Check if token already claimed

            if(data![0].claimed === true){
                return navigate("/")
            }
            
            // 4. Set email state
            

            if (error){
                return console.log(error)
            } else{
                return setEmail(data[0].email)
            }
        }

        fetchEmail()
    },[])

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault()
            const {data, error} = await supabase
            .from('invite')
            .select('email')
            .eq("token", searchParams.get("token"))

             if(data![0].email !== email){
                return navigate("/")
            } if(error){
                return console.log(error)
            }

            const token = searchParams.get("token")!
            await createClientAcc(email, organisation, password, token)
            return navigate("/discussions")        
        }


  return (
    <>
    <section className="h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="flex flex-col w-120 h-120 rounded-2xl gap-6 bg-white drop-shadow-md  p-5">
                 <div className="flex flex-col text-center mt-6">
                    <h1 className="text-2xl font-avant">Send a Client Invite</h1>
                    <p className="font-DMSans text-gray-400 ">Send an invite link to your client to start a project</p>
                </div>
                <form                     
                onSubmit={handleSubmit} 
                className="flex flex-col gap-3">
                        <input 
                        value={email}
                        placeholder={email} 
                        className="flex-1 min-w-0 border border-gray-200 rounded-lg p-2 text-sm" 
                        disabled
                        type="text" />

                        <input 
                        value={organisation} 
                        onChange={e => setOrganisation(e.target.value)}
                        placeholder="Organisation name " 
                        className="flex-1 min-w-0 border border-gray-200 rounded-lg p-2 text-sm" 
                        type="text" />

                        <input 
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setPasswordCheck(passwordValidation(e.target.value))
                        }}
                        placeholder="Create password" 
                        className="w-full border border-gray-200 rounded-lg p-2 text-sm" 
                        type="password" />

                    <button 
                    className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium mt-1"
                    type="submit"
                    >
                        Begin Discovery
                    </button>
                </form>
            </div>
        </section>
    </>
  );
}
