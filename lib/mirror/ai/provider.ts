/**
 * provider.ts
 * Thin wrapper around the Anthropic SDK.
 * Swap AI_ENDPOINT or the underlying client here to change provider.
 * Never called from the browser — server-side only.
 */

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL     = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 700

type CallResult =
  | { ok: true;  text: string }
  | { ok: false; error: string }

export async function callModel(
  systemPrompt: string,
  userMessage:  string,
): Promise<CallResult> {
  try {
    const msg = await client.messages.create({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userMessage }],
    })
    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : ''
    return { ok: true, text }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    // Mask key details from callers
    const safe = message.includes('api_key') || message.includes('authentication')
      ? 'API authentication error'
      : message.slice(0, 120)
    return { ok: false, error: safe }
  }
}
