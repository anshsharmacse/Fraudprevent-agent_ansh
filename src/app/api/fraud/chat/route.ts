import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Chat
 * Primary: OpenRouter LLM (timeout: 10s)
 * Fallback: Keyword matching (instant)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'liquid/lfm-2.5-1.2b-instruct:free';
const TIMEOUT_MS = 10000;

// Keyword fallback (instant)
const QA_PAIRS = [
  { keywords: ['hello', 'hi', 'hey'], response: 'Hello! 👋 I\'m your Banking Fraud Assistant. Ask me about risk scores, fraud prevention, or suspicious transactions!' },
  { keywords: ['risk', 'score'], response: '📊 **Risk Score Guide (1-10):**\n• 1-3: Safe transactions\n• 4-6: Monitor closely\n• 7-8: Verify before processing\n• 9-10: Block immediately' },
  { keywords: ['fraud', 'detect'], response: '🔍 **Fraud Detection:** Timing (late night), Amount patterns, Destination (crypto/new payees), Urgency language, International transfers' },
  { keywords: ['prevent', 'safety', 'tips'], response: '🛡️ **Prevention Tips:** Enable 2FA, Never share OTP/PIN, Verify beneficiaries, Avoid suspicious links, Monitor accounts regularly' },
  { keywords: ['suspicious', 'signs'], response: '⚠️ **Suspicious Signs:** Late night transfers, Large unexpected amounts, Crypto wallets, Unknown payees, Urgent requests, International transfers' },
  { keywords: ['crypto', 'bitcoin'], response: '⚠️ **Crypto Transactions:** High-risk! Irreversible, often used in scams, hard to trace. Extra verification required.' },
  { keywords: ['otp', 'pin', 'password'], response: '🚨 **NEVER SHARE:** OTP, PIN, Password, CVV, Net banking credentials. Banks NEVER ask for these!' },
  { keywords: ['scam', 'phishing'], response: '🎭 **Common Scams:** Phishing emails, Fake customer care, Lottery scams, Investment fraud, QR code scams' },
  { keywords: ['report'], response: '📝 **Report Fraud:** Call bank immediately (SBI: 1800-11-2211, HDFC: 1800-258-3838), Cyber Crime helpline: 1930, Keep evidence' },
];

function getLocalResponse(message: string): string {
  const msg = message.toLowerCase();
  for (const qa of QA_PAIRS) {
    if (qa.keywords.some(k => msg.includes(k))) return qa.response;
  }
  return 'I can help with fraud detection, risk scores, and banking security. Try asking about fraud prevention or how to report scams.';
}

async function llmChat(message: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://fraud-risk-agent.vercel.app',
        'X-Title': 'Fraud Risk Agent',
      },
      body: JSON.stringify({
        model: FREE_MODEL,
        messages: [
          { role: 'system', content: 'You are a Banking Fraud Assistant for Indian banks. Be concise (under 150 words), helpful, use emojis.' },
          { role: 'user', content: message },
        ],
        temperature: 0.5,
        max_tokens: 250,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ success: false, response: 'Please provide a message.' }, { status: 400 });
    
    const llmResponse = await llmChat(message);
    if (llmResponse) return NextResponse.json({ success: true, response: llmResponse, method: 'llm' });
    
    return NextResponse.json({ success: true, response: getLocalResponse(message), method: 'keyword' });
  } catch {
    return NextResponse.json({ success: true, response: 'I can help with fraud detection and banking security.' });
  }
}
