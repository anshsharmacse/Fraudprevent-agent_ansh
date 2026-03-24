import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Chat Assistant
 * Primary: OpenRouter LLM with detailed prompt
 * Fallback: Comprehensive keyword matching
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'liquid/lfm-2.5-1.2b-instruct:free';
const TIMEOUT_MS = 20000; // 20 seconds max

// Comprehensive keyword-based responses (fallback)
const QA_PAIRS: { keywords: string[]; response: string }[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon'],
    response: `👋 Hello! I'm your **Banking Fraud Detection Assistant** for Indian Banks.

I can help you with:
• 📊 Understanding risk scores and what they mean
• 🔍 How fraud detection works
• 🛡️ Fraud prevention tips and best practices
• ⚠️ Identifying suspicious transactions
• 📝 How to report fraud
• 🏦 Banking security advice

What would you like to know?`,
  },
  {
    keywords: ['risk', 'score', 'what is risk score', 'risk score meaning'],
    response: `📊 **Risk Score Guide (1-10 Scale):**

**🟢 1-3 (LOW RISK)**
- Safe transactions like salary, rent, bills
- Known beneficiaries (family, friends)
- Regular recurring payments (EMI, subscriptions)
- Action: Proceed normally

**🟡 4-5 (MEDIUM RISK)**
- Unusual but explainable transactions
- New beneficiaries, slightly larger amounts
- Action: Send confirmation to account holder

**🟠 6-7 (HIGH RISK)**
- Multiple red flags detected
- Late night timing, urgency language
- Action: Hold and verify with customer via call/OTP

**🔴 8-10 (CRITICAL RISK)**
- Strong fraud indicators
- Should be blocked immediately
- Action: Block transaction, alert fraud team, contact customer`,
  },
  {
    keywords: ['fraud', 'detect', 'how do you detect', 'detection method', 'how it works'],
    response: `🔍 **How Fraud Detection Works:**

**1. Timing Analysis**
- Late night transfers (12 AM - 5 AM) flagged
- Transactions during bank holidays scrutinized

**2. Amount Patterns**
- Sudden large transfers flagged
- Round numbers (₹50,000, ₹1,00,000) suspicious
- Multiple small transactions (structuring) detected

**3. Recipient Analysis**
- New/unknown beneficiaries = higher risk
- Crypto wallets flagged
- International transfers require extra verification

**4. Language Analysis**
- Urgency words: "immediately", "urgent", "ASAP"
- Threatening language in scams
- Too-good-to-be-be promises

**5. Behavioral Patterns**
- Deviation from normal transaction patterns
- First-time high-value transfers
- Geographic anomalies`,
  },
  {
    keywords: ['prevent', 'prevention', 'safety', 'secure', 'tips', 'protect', 'precaution'],
    response: `🛡️ **Fraud Prevention Tips:**

**🔐 Account Security:**
1. Enable Two-Factor Authentication (2FA)
2. Use strong, unique passwords
3. Never share OTP, PIN, or passwords
4. Regularly check account statements

**💳 Transaction Safety:**
1. Verify beneficiary details before transferring
2. Don't rush transactions under pressure
3. Double-check UPI IDs and account numbers
4. Avoid clicking links in SMS/emails

**📱 Device Security:**
1. Only use official banking apps
2. Keep apps and OS updated
3. Don't use public WiFi for banking
4. Install apps only from official stores

**⚠️ Stay Alert:**
1. Banks NEVER ask for OTP/PIN
2. Verify caller identity (call back official number)
3. Check URLs before entering credentials
4. Report suspicious activity immediately`,
  },
  {
    keywords: ['suspicious', 'warning', 'red flag', 'signs', 'indicators', 'suspicious signs'],
    response: `⚠️ **Suspicious Transaction Signs:**

**🚨 HIGH ALERT INDICATORS:**
• 🌙 Late night transfers (12 AM - 5 AM)
• 💰 Unexpected large amounts
• 🔗 Crypto wallet destinations
• 👤 Unknown/new beneficiaries
• ⚡ Urgent transfer requests
• 🌍 International transfers to high-risk countries
• 🔄 Multiple rapid small transactions
• 📱 Pressure to act immediately

**🎭 SCAM INDICATORS:**
• "You won a lottery" messages
• "Your account will be blocked" threats
• "Double your money" promises
• "Job offer - pay training fee"
• "KYC update required urgently"
• "Family emergency - send money now"

**📞 IMMEDIATE ACTION:**
If you notice these signs, call your bank's official number immediately!`,
  },
  {
    keywords: ['crypto', 'bitcoin', 'wallet', 'cryptocurrency', 'btc', 'ethereum'],
    response: `⚠️ **Cryptocurrency Transaction Risks:**

**🚨 Why Crypto Transactions Are High-Risk:**

1. **Irreversible** - Once confirmed, cannot be reversed
2. **Anonymous** - Hard to identify recipient
3. **Unregulated** - No bank or government protection
4. **Scam-Prone** - Often used in investment fraud
5. **No Chargebacks** - Unlike credit cards

**🔍 Common Crypto Scams:**
• "Send ₹10,000, get ₹20,000 in Bitcoin"
• Fake crypto exchanges
• Ponzi schemes disguised as crypto investments
• "Send crypto to verify your account"

**💡 Recommendation:**
- Extra verification required for ANY crypto-related transaction
- Verify the recipient thoroughly
- Be extremely cautious with investment offers
- Never share your wallet private keys`,
  },
  {
    keywords: ['otp', 'password', 'pin', 'share', 'cvv', 'card details', 'otp share'],
    response: `🚨 **NEVER SHARE THESE - EVER!**

**❌ What Banks NEVER Ask For:**
• OTP (One-Time Password)
• ATM PIN
• Net Banking Password
• CVV Number (back of card)
• Card Number + Expiry
• MPIN / UPI PIN

**📞 How Scammers Try to Get These:**
1. "Your account is blocked, share OTP to unblock"
2. "We're updating records, please confirm your PIN"
3. "You've won a prize, pay ₹1 with OTP verification"
4. "Your card will be cancelled, share details to prevent"

**🛡️ What To Do:**
1. HANG UP immediately
2. Call your bank's OFFICIAL number
3. DO NOT share any details
4. Report the number to cyber crime

**📝 Remember: Bank employees NEVER ask for OTP, PIN, or CVV!**`,
  },
  {
    keywords: ['scam', 'phishing', 'fake', 'fraud type', 'types of fraud', 'common fraud'],
    response: `🎭 **Common Scams in India:**

**1. 📧 Phishing Scams**
- Fake emails/SMS from banks
- Links to fake websites
- Steal your login credentials

**2. 📞 Customer Care Fraud**
- Fake helpline numbers on Google
- Ask for OTP/PIN to "help"
- Actually steal your money

**3. 🎁 Lottery/Prize Scam**
- "You won ₹10 Lakhs!"
- Pay "processing fee" or "tax"
- No actual prize exists

**4. 💰 Investment Fraud**
- "Double your money in 24 hours"
- Fake trading apps
- Ponzi schemes

**5. 💼 Job Scam**
- "Work from home, earn ₹50,000"
- Pay for "training" or "equipment"
- No real job exists

**6. ❤️ Romance Scam**
- Fake relationships online
- "I need money for flight ticket"
- "I'm stuck in customs"

**7. 📱 QR Code Scam**
- "Scan to receive money"
- Actually DEBITS your account
- Never scan unknown QR codes`,
  },
  {
    keywords: ['report', 'complaint', 'register', 'file', 'how to report', 'report fraud'],
    response: `📝 **How to Report Fraud in India:**

**🚨 IMMEDIATE STEPS:**
1. **Call your bank NOW** - Block cards/net banking
2. **Change passwords** - All banking accounts

**📞 Bank Helplines:**
• SBI: 1800-11-2211 / 1800-425-3800
• HDFC: 1800-258-3838
• ICICI: 1800-200-3344
• Axis: 1800-419-5959
• PNB: 1800-180-2222

**🏛️ Cyber Crime Reporting:**
• Website: cybercrime.gov.in
• Helpline: **1930** (Toll Free)
• File FIR at local police station

**📋 Keep Evidence:**
• Screenshots of messages/emails
• Transaction IDs and amounts
• Phone numbers used by fraudsters
• Bank statements

**⏰ Time Matters:**
Report within 24 hours for best chance of recovery!`,
  },
  {
    keywords: ['international', 'overseas', 'foreign', 'abroad', 'wire transfer', 'swift'],
    response: `🌍 **International Transfer Risks:**

**⚠️ High-Risk Countries for Fraud:**
• Nigeria, Ghana, Ivory Coast
• Some Southeast Asian countries
- Known for lottery/romance scams

**🔍 Extra Caution Required For:**
• Unknown foreign beneficiaries
• "Investment opportunities" abroad
• Lottery/prize winnings from overseas
• Online purchases from international sites
• Job offers from foreign companies

**✅ Safe Practices:**
1. Verify recipient identity thoroughly
2. Understand the purpose of transfer
3. Use only authorized banking channels
4. Keep documentation of purpose
5. Inform bank for large transfers

**🚨 Red Flags:**
• Request to send money to "receive" money
• Unknown person requesting transfer
• Pressure to transfer immediately
• Unusually complex transfer routes`,
  },
  {
    keywords: ['upi', 'gpay', 'phonepe', 'paytm', 'upi fraud', 'qr code'],
    response: `📱 **UPI & Digital Payment Safety:**

**🔐 UPI PIN Safety:**
• Never share your UPI PIN
• No one needs your PIN to SEND you money
• Cover screen when entering PIN

**⚠️ Common UPI Scams:**

1. **QR Code Scam**
   - "Scan this QR to receive ₹5000"
   - Actually DEBITS your account
   - QR codes are for PAYING, not receiving!

2. **Request Money Scam**
   - Fraudster sends "request money"
   - Screen shows "Enter PIN to receive"
   - Actually sends money to fraudster

3. **Fake Payment Screenshots**
   - Scammer shows fake "payment sent" screenshot
   - Asks you to refund/return item
   - No money was actually sent

**✅ Safe Practices:**
• Always verify by checking bank SMS/app
• Don't share screen during transactions
• Verify UPI ID before large transfers
• Disable "Request Money" feature if not needed`,
  },
  {
    keywords: ['help', 'assist', 'support', 'what can you', 'what do you'],
    response: `💬 **I Can Help You With:**

• 📊 **Risk Scores** - What they mean and how they're calculated
• 🔍 **Fraud Detection** - How we identify suspicious transactions
• 🛡️ **Prevention Tips** - Keep your accounts safe
• ⚠️ **Warning Signs** - Spot fraud before it happens
• 📝 **Reporting Fraud** - Steps to take if you're a victim
• 🏦 **Banking Security** - Best practices for safe banking
• 📱 **UPI Safety** - Avoid common digital payment scams
• 🎭 **Scam Types** - Learn about common fraud in India

**Just ask your question and I'll help!**

Examples:
- "What does risk score 7 mean?"
- "How do I report a fraud?"
- "Is this transaction safe?"`,
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'thx'],
    response: `🙏 You're welcome! 

Stay safe and remember:
• When in doubt, verify with your bank
• Never share OTP, PIN, or passwords
• Report suspicious activity immediately
• Use only official banking channels

Feel free to ask if you have more questions! 😊`,
  },
];

function getLocalResponse(message: string): string {
  const msg = message.toLowerCase();

  for (const qa of QA_PAIRS) {
    if (qa.keywords.some(keyword => msg.includes(keyword))) {
      return qa.response;
    }
  }

  // Check for specific patterns
  if (msg.includes('safe') || msg.includes('legit') || msg.includes('genuine')) {
    return `To determine if a transaction is safe, analyze these factors:

✅ **Safe Indicators:**
• Known recipient (family, friends, regular merchants)
• Expected amount (bills, salary, subscriptions)
• Normal timing (business hours)
• Official banking channels

🚨 **Risk Indicators:**
• Unknown recipient
• Unexpected large amount
• Urgency language ("do it now!")
• Late night timing
• Crypto/investment related

**Submit the transaction for analysis to get a risk score!**`;
  }

  return `I can help with fraud detection and banking security. 

**Try asking about:**
• "What is a risk score?"
• "How to prevent fraud?"
• "What are suspicious signs?"
• "How to report fraud?"
• "Common scams in India"
• "UPI safety tips"

Or submit a transaction description for risk analysis!`;
}

// LLM Chat with detailed prompt
async function llmChat(message: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log('No OpenRouter API key found');
    return null;
  }

  const systemPrompt = `You are an expert Banking Fraud Detection Assistant specialized in Indian banking systems. You help users understand:

1. Risk scores and fraud indicators
2. How to identify suspicious transactions
3. Fraud prevention best practices
4. How to report fraud in India
5. Common scam types (phishing, lottery, job scams, romance scams, UPI fraud, QR code scams)
6. Banking security advice

Guidelines:
- Be helpful, accurate, and concise
- Use emojis to make responses readable
- Provide actionable advice
- Mention relevant Indian bank helplines when appropriate
- Never ask users to share sensitive information
- If asked about a specific transaction, advise them to use the analysis feature

Keep responses under 300 words unless more detail is requested.`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.6,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('OpenRouter API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.log('No content from LLM');
      return null;
    }

    return content;

  } catch (error) {
    console.log('LLM chat failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, response: 'Please provide a message.' },
        { status: 400 }
      );
    }

    // Try LLM first with 20s timeout
    const llmResponse = await llmChat(message);

    if (llmResponse) {
      return NextResponse.json({
        success: true,
        response: llmResponse,
        method: 'llm',
      });
    }

    // Fallback to comprehensive keyword matching
    const response = getLocalResponse(message);
    return NextResponse.json({
      success: true,
      response,
      method: 'keyword',
    });

  } catch {
    // Even on error, return a valid response
    return NextResponse.json({
      success: true,
      response: `I can help with fraud detection and banking security. Try asking about:
      
• Risk scores and what they mean
• Fraud prevention tips
• How to report fraud
• Common scam types in India`,
      method: 'error-fallback',
    });
  }
}
