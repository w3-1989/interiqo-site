import { useSearchParams, useNavigate} from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import createClientAcc from "../../lib/api/createClientAcc"
import passwordValidation from "../../utils/passwordValidation"
import clsx from "clsx";

const passwordValidationStyle = {
    default: "text-gray-400 text-sm",
    passed: "text-green-400 text-sm"
}

const submitBtnStyles ={
    default: "w-full bg-gray-400 text-white rounded-lg py-2.5 text-sm font-medium mt-1",
    active: "w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium mt-1 "
}

export default function ClientAccountSetup(){

    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("")
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

            const {data, error:errorClaimedCheck} = await supabase
            .from('invite')
            .select('email, claimed')
            .eq("token", searchParams.get("token"))

               if (errorClaimedCheck){
                console.log("ClientAccountSetup - Error when checking to see if the email had been claimed",errorClaimedCheck)
                throw errorClaimedCheck
            } 

            if(!data || data.length === 0 ){
                return navigate("/")
            }
    
            if(data![0].claimed === true){
                return navigate("/")
            }
            
            return setEmail(data[0].email)
            
        }

        fetchEmail()
    },[])

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault()
            const {data, error:errorCrossCheckingEmail} = await supabase
            .from('invite')
            .select('email')
            .eq("token", searchParams.get("token"))

             if(errorCrossCheckingEmail){
                console.log("ClientAccountSetup - Error corss checking the users email",errorCrossCheckingEmail)
                throw errorCrossCheckingEmail
            }

             if(data![0].email !== email){
                return navigate("/")
            }

            const token = searchParams.get("token")!
            await createClientAcc(email, organisation, password, token)
            return navigate("/discovery-chat")        
        }




  return (
    <>
    <section className="h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="flex flex-col w-120 h-120 rounded-2xl gap-6 bg-white drop-shadow-md  p-5">
                 <div className="flex flex-col text-center mt-6">
                    <h1 className="text-2xl font-avant">Create your account</h1>
                    <p className="font-DMSans text-gray-400 ">Please enter your details below</p>
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
