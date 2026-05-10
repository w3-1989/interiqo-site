import { createClient, SupabaseClient} from "@supabase/supabase-js";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log(`Function "browser-with-cors" up and running!`)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');


const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase:SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  

  try {
    const { firstName, lastName, email } = await req.json()
    const token = crypto.randomUUID()

   const {error} = await supabase
      .from('invite')
      .insert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        token: token ,
        claimed: false,
      })
      console.log(error)

      if(error) throw error
    const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Interiqo <team@interiqo.com>',
      to: [email],
      subject: 'Urgent: You have been invited to start a project!',
      html: `
      <strong>${firstName} you have been invited to start a project</strong>
      <a href="http://localhost:5173/client-account-setup?token=${token}">Click here to start</a>
      `
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  } catch (error: unknown) {
     const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

