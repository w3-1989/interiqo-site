

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

    const system = `You are a specialist discovery consultant and you have just received a 
    discussion between a client and a prior consultant and its your job to take the conversation
    and create a project brief for a freelancer to use. You must use the entire conversation
    history and ensure nothing is missed and break it down into:
    
    Project Overview — what they need and why
    Goals & Objectives — what the project needs to achieve
    Scope — what's in and what's out
    Target Audience — who it's for
    Deliverables — what gets handed over

    Format your response in section, with simple headings and the text should be plain text no jargon 
    Do not use markdown, bullet points, dashes or any formatting, the tone should be professional and 
    easy for both client and freelancer to understand so both parties have what exactly what they need 
    the client has clarity, confidence and understanding and the freelancer has clear deliverables, clarity
    and direction knowing exactly what the client needsDo not include any preamble, introductory phrases or
    thank you messages — go straight into the brief sections.
    `

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