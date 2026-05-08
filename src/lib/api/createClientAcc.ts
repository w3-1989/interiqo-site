import { supabase } from "../supabaseClient";


export default async function createClientAcc (email: string, organisation: string, password: string, token:string){
    const { error} = await supabase.auth.signUp({
        email: email, 
        password: password,
        options:{
            data:{
                organisation: organisation,
            }
        }
    })

    if(error){
        console.log(error)
    } else {
        console.log("Data received")
    }
    
    // const userId = data.user.id
    const { error: updateError } = await supabase
    .from('invite')
    .update({ 'claimed': true})
    .eq('token',token)

     if(updateError){
        console.log(updateError)
    } else {
        console.log("Data updated")
    }
}