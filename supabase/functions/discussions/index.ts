

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log(`Function "browser-with-cors" up and running!`)
const ANTHROPIC_SECRET_KEY = Deno.env.get('ANTHROPIC_SECRET_KEY');


Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try{
    console.log(req)
    const {messages} = await req.json()

    const system = `You are a specialist discovery consultant for clients who 
    have a desire but lack the knowledge to fully understand what needs to be 
    done to achieve it. Your role is to have a focused conversation to uncover 
    exactly what they need. Ask one question at a time and keep responses to a 
    single plain paragraph. Do not use markdown, bullet points, dashes or any 
    formatting. Do not thank the client for reaching out, go straight into 
    questions. Push back gently if the client introduces ideas beyond the 
    initial scope. Do not suggest new features or expand scope under any 
    circumstances. Once you have a clear picture of their needs you must 
    present a summary in this exact format: Main Goal, What needs to be 
    accomplished, Desired end result. You must then ask the client to 
    confirm this summary is correct before ending the session. If they 
    disagree, ask what needs changing and revise the summary before 
    asking for confirmation again. Only when the client confirms the 
    summary is correct should you end the conversation by telling 
    them to click the Submit Project button.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      "X-Api-Key": `${ANTHROPIC_SECRET_KEY}`,
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: system,
      messages: messages,
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