/*
Future add - database transaction or a cleanup 
function that deletes the auth user if subsequent steps fail
*/
import { supabase } from "../supabaseClient";


export default async function createClientAcc (email: string, organisation: string, password: string, token:string){
    const { data, error:errorCreateUser} = await supabase.auth.signUp({
        email: email, 
        password: password,
        options:{
            data:{
                organisation: organisation,
            }
        }
    })

    if(errorCreateUser){
        console.log("createClientAcc - Couldn't create user",errorCreateUser)
        throw errorCreateUser
    } else {
        console.log("Data received")
    }

    const userId = data.user!.id
    
    if(!userId ){
        return console.log("user id cannot be found")
    } 

    const { data: fetchData, error:errorFetchInviteData } = await supabase
    .from('invite')
    .select()
    .eq('token', token)

    if(errorFetchInviteData){
        console.log("createClientAcc - Token does not match user's token",errorFetchInviteData)
        throw errorFetchInviteData
    } else {
        console.log("Data Fetched")
    }
    const firstName = fetchData![0].first_name
    const lastName = fetchData![0].last_name
   
   const { data: clientData, error:errorInsertClientData } = await supabase
    .from('clients')
    .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        organisation: organisation,
    })
    .select('id')

    if(errorInsertClientData){
        console.log("createClientAcc - Could not insert user data", errorInsertClientData)
        throw errorInsertClientData
    } else {
        console.log("User data inserted")
    }

    const { error: errorClaimInvite } = await supabase
    .from('invite')
    .update({ 'claimed': true})
    .eq('token',token)

     if(errorClaimInvite){
        console.log("createClientAcc - Couldn't update user details",errorClaimInvite)
        throw errorClaimInvite
    } else {
        console.log("Data updated")
    }
    

   const { error: errorCreateConvo } = await supabase
   .from('conversations')
   .insert({
    client_id: clientData![0].id,
    status: 'active'
   })


    if(errorCreateConvo){
        console.log("createClientAcc - Couldn't assign conversation to user",errorCreateConvo)
        throw errorCreateConvo
    } else {
        console.log("Data inserted")
    }

}