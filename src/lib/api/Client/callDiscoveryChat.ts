import type { Messages } from "../../../types/Messages";
import { supabase } from "../../supabaseClient"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

export default async function callDiscoveryChat(
  messages: Messages[], 
  onChunk: (chunk: string) => void
): Promise<string | undefined> {

  const { data: { session } } = await supabase.auth.getSession()

  
  const res = await fetch(`${supabaseUrl}/functions/v1/discovery-chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`
  },
  body: JSON.stringify({ messages })
})

if (!res.ok) {
  const error = await res.text()
  console.log("Edge function error:", error)
  throw new Error(error)
}

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
    
    for (const line of lines) {
      try {
        const json = JSON.parse(line.replace('data: ', ''))
        if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
          onChunk(json.delta.text)
          fullText += json.delta.text
        }
      } catch (_e) { 
        console.log("callDiscoveryChat - error streaming text", _e)
        }
  }}

  return fullText
}