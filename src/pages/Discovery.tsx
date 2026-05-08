import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import createClientAcc from "../lib/api/createClientAcc"
import passwordValidation from "../utils/passwordValidation"
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

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

        const passwordValidationStyle = {
            default: "text-gray-400 text-sm",
            passed: "text-green-400 text-sm"
        }

        const submitBtnStyles ={
            default: "w-full bg-gray-400 text-white rounded-lg py-2.5 text-sm font-medium mt-1",
            active: "w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium mt-1 "
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
                        <div className="flex flex-col gap-2"> 
                            <p className={clsx(
                                passwordValidationStyle.default, 
                                passwordCheck.minLength && passwordValidationStyle.passed
                            )}>Minimum 8 characters</p>

                            <p className={clsx(
                                passwordValidationStyle.default, 
                                passwordCheck.containsNum && passwordValidationStyle.passed
                            )}>Must contain one number</p>
                            <p className={clsx(
                                passwordValidationStyle.default, 
                                passwordCheck.containsUppercaseLetter && passwordValidationStyle.passed
                            )}>Must contain one uppercase letter</p>
                            <p className={clsx(
                                passwordValidationStyle.default, 
                                passwordCheck.containsSpecialCharacter && passwordValidationStyle.passed
                            )}>Must contain one symbol</p>
                        </div>

                    <button 
                    className={clsx( Object.values(passwordCheck).every(value => value === true) 
                        && submitBtnStyles.active ? submitBtnStyles.active : submitBtnStyles.default)}
                    type="submit"
                    disabled={ !Object.values(passwordCheck).every(value => value === true)}
                    >
                        Begin Discovery
                    </button>
                </form>
            </div>
        </section>
    </>
  );
}
