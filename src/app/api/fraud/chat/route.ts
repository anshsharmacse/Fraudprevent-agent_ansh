import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API Configuration - Use Environment Variable
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'liquid/lfm-2.5-1.2b-instruct:free';

const SYSTEM_PROMPT = `You are a helpful banking fraud assistant for Indian users. Answer questions about:
- Fraud prevention tips
- Risk scores and what they mean
- How to identify suspicious transactions
- Banking security advice
- How to report fraud

Keep responses short, helpful, and use emojis. Respond in the same language as the user (English, Hindi, or Malayalam).`;

// ============================================
// LLM CHAT (Primary)
// ============================================
async function chatWithLLM(message: string): Promise<string | null> {
  // Skip LLM if no API key
  if (!OPENROUTER_API_KEY) {
    console.log('No OpenRouter API key configured');
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vercel.app',
        'X-Title': 'Fraud Risk Agent',
      },
      body: JSON.stringify({
        model: FREE_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.log('OpenRouter chat failed:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    return content || null;

  } catch (error) {
    console.log('LLM chat error:', error);
    return null;
  }
}

// ============================================
// KEYWORD-BASED RESPONSES (Fallback)
// ============================================
const QA_PAIRS = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    response: `Hello! 👋 I'm your Banking Fraud Assistant.

I can help you with:
• 📊 Understanding risk scores
• 🔍 How fraud detection works
• 🛡️ Fraud prevention tips
• ⚠️ Identifying suspicious transactions
• 📝 Reporting fraud

What would you like to know?`,
  },
  {
    keywords: ['risk', 'score', 'what is risk'],
    response: `📊 **Risk Score Guide (1-10):**

• **1-3 (Low):** ✅ Safe transactions - salary, bills, known payees
• **4-6 (Medium):** ⚠️ Monitor closely - unusual but explainable
• **7-8 (High):** 🔶 Verify before processing - multiple red flags
• **9-10 (Critical):** 🚨 Block immediately - likely fraud

Higher scores = more suspicious activity detected.`,
  },
  {
    keywords: ['fraud', 'detect', 'how do you detect', 'how it works'],
    response: `🔍 **How Fraud Detection Works:**

1. **Timing Analysis** - Late night (12 AM - 5 AM) transfers flagged
2. **Amount Patterns** - Large unexpected amounts
3. **Destination Check** - Crypto wallets, new payees
4. **Language Analysis** - Urgent, emergency keywords
5. **Frequency** - Multiple rapid transactions
6. **Location** - International transfers to risky countries

We analyze all these factors to calculate risk score.`,
  },
  {
    keywords: ['prevent', 'prevention', 'safety', 'secure', 'tips'],
    response: `🛡️ **Fraud Prevention Tips:**

1. ✅ Enable two-factor authentication (2FA)
2. ✅ Never share OTP, PIN, or passwords
3. ✅ Verify beneficiary details before transferring
4. ✅ Avoid clicking suspicious links in SMS/emails
5. ✅ Monitor your account regularly
6. ✅ Report suspicious activity immediately
7. ✅ Use only official banking apps
8. ✅ Don't save card details on unknown websites`,
  },
  {
    keywords: ['suspicious', 'warning', 'red flag', 'signs'],
    response: `⚠️ **Suspicious Transaction Signs:**

• 🌙 Late night transfers (12 AM - 5 AM)
• 💰 Large unexpected amounts
• 🔗 Crypto wallet destinations
• 👤 New or unknown payees
• ⚡ Urgent transfer requests
• 🌍 International transfers to high-risk countries
• 🔄 Multiple rapid small transactions
• 📱 Pressure to act immediately`,
  },
  {
    keywords: ['crypto', 'bitcoin', 'wallet', 'cryptocurrency'],
    response: `⚠️ **Cryptocurrency Transactions:**

Crypto transfers are **high-risk** because:
• Irreversible once confirmed
• Often used in investment scams
• Hard to trace and recover funds
• Anonymous nature makes verification difficult

**Recommendation:** Extra verification required for any crypto-related transactions.`,
  },
  {
    keywords: ['otp', 'password', 'pin', 'share', 'cvv'],
    response: `🚨 **NEVER SHARE THESE:**

• ❌ OTP (One-Time Password)
• ❌ PIN or passwords
• ❌ CVV number
• ❌ Net banking credentials
• ❌ ATM card details

**Banks NEVER ask for these details!** If someone asks, it's a SCAM. Call your bank's official number immediately.`,
  },
  {
    keywords: ['scam', 'phishing', 'fake', 'fraud type', 'types of fraud'],
    response: `🎭 **Common Scams in India:**

1. **Phishing** - Fake bank emails/SMS with links
2. **Customer Care Fraud** - Fake helpline numbers
3. **Lottery Scam** - "You won ₹10 lakhs!"
4. **Investment Fraud** - "Double your money in 24 hours"
5. **Job Scam** - "Pay for training/background check"
6. **Romance Fraud** - Fake relationships asking for money
7. **QR Code Scam** - "Scan to receive money" (actually debits)`,
  },
  {
    keywords: ['report', 'complaint', 'register', 'file'],
    response: `📝 **How to Report Fraud:**

1. **Call your bank** - Block cards immediately
   • SBI: 1800-11-2211
   • HDFC: 1800-258-3838
   • ICICI: 1800-200-3344

2. **Cyber Crime Portal**
   • Website: cybercrime.gov.in
   • Helpline: 1930

3. **Keep Evidence**
   • Screenshots, messages, transaction IDs

4. **Change Passwords** - All banking accounts`,
  },
  {
    keywords: ['international', 'overseas', 'foreign', 'abroad'],
    response: `🌍 **International Transfers:**

Extra caution needed for:
• Nigeria, Ghana, Ivory Coast (high fraud)
• Unknown foreign beneficiaries
• "Investment opportunities" abroad
• Lottery/prize winnings from overseas

Always verify purpose and recipient identity before processing.`,
  },
  {
    keywords: ['help', 'assist', 'support', 'what can you'],
    response: `💬 **I Can Help With:**

• 📊 Understanding risk scores
• 🔍 How fraud detection works
• 🛡️ Fraud prevention tips
• ⚠️ Identifying suspicious transactions
• 📝 Reporting fraud
• 🔒 Banking security advice

Just ask your question!`,
  },
  {
    keywords: ['thank', 'thanks', 'thank you'],
    response: `You're welcome! 😊 

Stay safe and vigilant. Remember: When in doubt, verify with your bank before proceeding with any transaction.

Feel free to ask more questions!`,
  },
];

function getKeywordResponse(message: string): string {
  const msg = message.toLowerCase();
  
  for (const qa of QA_PAIRS) {
    if (qa.keywords.some(keyword => msg.includes(keyword))) {
      return qa.response;
    }
  }
  
  return `I can help you with fraud detection, risk scores, and banking security.

Try asking about:
• "What is a risk score?"
• "How to prevent fraud?"
• "What are suspicious signs?"
• "How to report fraud?"
• "Common scams in India"`;
}

// ============================================
// MAIN API HANDLER
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        response: 'Please enter a message.',
      }, { status: 400 });
    }

    // Try LLM first (if API key available)
    if (OPENROUTER_API_KEY) {
      console.log('Attempting LLM chat...');
      const llmResponse = await chatWithLLM(message.trim());
      
      if (llmResponse) {
        console.log('LLM chat successful');
        return NextResponse.json({
          success: true,
          response: llmResponse,
          method: 'llm',
        });
      }
    }

    // Fallback to keyword matching (always works!)
    console.log('Using keyword-based fallback');
    const response = getKeywordResponse(message.trim());

    return NextResponse.json({
      success: true,
      response,
      method: 'keyword',
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Even on error, return something useful
    return NextResponse.json({
      success: true,
      response: `I'm here to help with fraud detection and banking security!

Try asking about:
• Risk scores
• Fraud prevention tips
• Suspicious transaction signs
• How to report fraud`,
      method: 'fallback',
    });
  }
}
