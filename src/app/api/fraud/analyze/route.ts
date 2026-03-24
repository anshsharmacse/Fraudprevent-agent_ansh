import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Transaction Analysis
 * Primary: OpenRouter LLM with detailed prompt
 * Fallback: Comprehensive rule-based analysis
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'liquid/lfm-2.5-1.2b-instruct:free';
const TIMEOUT_MS = 20000; // 20 seconds max

// Comprehensive rule-based fallback analysis
function ruleBasedAnalysis(description: string, amount?: number) {
  const desc = description.toLowerCase();
  let riskScore = 3;
  const redFlags: string[] = [];
  const factors: { factor: string; impact: number }[] = [];

  // ========== HIGH RISK INDICATORS ==========

  // Cryptocurrency related (HIGH RISK)
  if (/crypto|bitcoin|btc|ethereum|eth|usdt|binance|coinbase|wallet address|blockchain/i.test(desc)) {
    redFlags.push('🚨 Cryptocurrency-related transaction - HIGH FRAUD RISK');
    factors.push({ factor: 'Cryptocurrency', impact: 3 });
    riskScore += 3;
  }

  // Urgency/Emergency language (HIGH RISK - common in scams)
  if (/urgent|immediately|asap|emergency|right now|within hour|today itself|very urgent|fast|quick|hurry|don.?t delay/i.test(desc)) {
    redFlags.push('🚨 Urgency language detected - typical scam tactic');
    factors.push({ factor: 'Urgency language', impact: 2 });
    riskScore += 2;
  }

  // Unknown/Unverified recipient (HIGH RISK)
  if (/unknown|unverified|new beneficiary|stranger|first time|never met|new account|someone i don.?t know/i.test(desc)) {
    redFlags.push('🚨 Unknown or unverified recipient');
    factors.push({ factor: 'Unknown recipient', impact: 2 });
    riskScore += 2;
  }

  // Investment/Get-rich-quick schemes (HIGH RISK)
  if (/investment|double your|guaranteed return|profit|scheme|opportunity|trading|forex|share market tip|multibagger|ipo allotment|high return/i.test(desc)) {
    redFlags.push('🚨 Investment-related - potential scam');
    factors.push({ factor: 'Investment scam indicators', impact: 3 });
    riskScore += 3;
  }

  // Lottery/Prize scams (HIGH RISK)
  if (/lottery|winner|prize|lucky draw|won|jackpot|lucky winner|award|reward/i.test(desc)) {
    redFlags.push('🚨 Lottery/Prize scam indicators');
    factors.push({ factor: 'Lottery scam', impact: 4 });
    riskScore += 4;
  }

  // Job/Work from home scams (HIGH RISK)
  if (/work from home|part time job|data entry|typing job|job offer|salary advance|recruitment|hiring|job fee|training fee/i.test(desc)) {
    redFlags.push('🚨 Job/Work-from-home scam indicators');
    factors.push({ factor: 'Job scam', impact: 3 });
    riskScore += 3;
  }

  // Romance/Relationship scams (HIGH RISK)
  if (/boyfriend|girlfriend|fiance|marriage|dating|matrimony|relationship|love|i need money for.*flight|stuck abroad/i.test(desc)) {
    redFlags.push('🚨 Potential romance scam indicators');
    factors.push({ factor: 'Romance scam', impact: 3 });
    riskScore += 3;
  }

  // Government/Authority impersonation (HIGH RISK)
  if (/income tax|gst|customs|police|court|legal|government|official|tax department|itr|penalty|fine/i.test(desc)) {
    redFlags.push('🚨 Government/Authority impersonation attempt');
    factors.push({ factor: 'Authority impersonation', impact: 3 });
    riskScore += 3;
  }

  // Bank impersonation (HIGH RISK)
  if (/bank.*verification|account.*suspend|kyc|pan card|aadhaar|update.*details|link.*account|bank executive called/i.test(desc)) {
    redFlags.push('🚨 Bank/Financial institution impersonation');
    factors.push({ factor: 'Bank impersonation', impact: 3 });
    riskScore += 3;
  }

  // ========== MEDIUM RISK INDICATORS ==========

  // Late night/Unusual timing (MEDIUM RISK)
  if (/\d+\s*(am|pm)|midnight|night|1 am|2 am|3 am|4 am|5 am|late night|early morning/i.test(desc)) {
    const hourMatch = desc.match(/(\d{1,2})\s*(am|pm)/i);
    if (hourMatch) {
      const hour = parseInt(hourMatch[1]);
      const period = hourMatch[2].toLowerCase();
      const actualHour = period === 'pm' && hour !== 12 ? hour + 12 : hour;
      if (actualHour >= 0 && actualHour <= 5) {
        redFlags.push('⚠️ Unusual timing (late night: 12 AM - 5 AM)');
        factors.push({ factor: 'Late night timing', impact: 1 });
        riskScore += 1;
      }
    } else {
      redFlags.push('⚠️ Unusual timing mentioned');
      factors.push({ factor: 'Unusual timing', impact: 1 });
      riskScore += 1;
    }
  }

  // International transfers (MEDIUM RISK)
  if (/international|overseas|foreign|abroad|nigeria|ghana|africa|uk|usa|dubai|singapore|cross.?border|swift|wire transfer/i.test(desc)) {
    redFlags.push('⚠️ International transfer detected');
    factors.push({ factor: 'International transfer', impact: 1 });
    riskScore += 1;
  }

  // QR Code scanning (MEDIUM-HIGH RISK)
  if (/qr code|scan|upi.*scan|scan.*pay|gpay.*scan|phonepe.*scan/i.test(desc)) {
    redFlags.push('⚠️ QR code payment mentioned - verify direction of payment');
    factors.push({ factor: 'QR code', impact: 2 });
    riskScore += 2;
  }

  // Multiple transactions (MEDIUM RISK)
  if (/multiple|several|many|\d+\s*times|repeated|again and again|daily|every day/i.test(desc)) {
    redFlags.push('⚠️ Multiple/repeated transactions');
    factors.push({ factor: 'Multiple transactions', impact: 1 });
    riskScore += 1;
  }

  // Link sharing/Clicking (MEDIUM RISK)
  if (/link|click|sms|whatsapp.*link|email.*link|phishing|fake website/i.test(desc)) {
    redFlags.push('⚠️ Suspicious link/attachment mentioned');
    factors.push({ factor: 'Suspicious link', impact: 2 });
    riskScore += 2;
  }

  // OTP/PIN related (HIGH RISK if sharing)
  if (/otp|pin|cvv|password|card number|expiry|share.*otp|received.*otp|someone asking/i.test(desc)) {
    redFlags.push('🚨 OTP/PIN/Card details sharing attempt');
    factors.push({ factor: 'Sensitive information', impact: 4 });
    riskScore += 4;
  }

  // ========== AMOUNT-BASED RISK ==========

  if (amount) {
    if (amount >= 1000000) { // >= 10 Lakhs
      redFlags.push(`💰 Very large amount: ₹${(amount / 100000).toFixed(1)} Lakhs`);
      factors.push({ factor: 'Very large amount', impact: 2 });
      riskScore += 2;
    } else if (amount >= 200000) { // >= 2 Lakhs
      redFlags.push(`💰 Large amount: ₹${(amount / 100000).toFixed(1)} Lakhs`);
      factors.push({ factor: 'Large amount', impact: 1 });
      riskScore += 1;
    } else if (amount >= 50000) {
      redFlags.push(`💰 Significant amount: ₹${(amount / 1000).toFixed(0)}K`);
      factors.push({ factor: 'Significant amount', impact: 0.5 });
      riskScore += 0.5;
    }
    
    // Round amount (often used in scams)
    if (amount % 10000 === 0 && amount >= 50000) {
      redFlags.push('⚠️ Round amount - often used in fraud');
      riskScore += 0.5;
    }
  }

  // ========== LOW RISK / SAFE INDICATORS ==========

  // Safe transaction indicators (reduce risk)
  if (/salary|rent|emi|electricity bill|mobile recharge|dth|insurance premium|mutual fund|sip|fixed deposit|ppf|nps/i.test(desc)) {
    riskScore = Math.max(1, riskScore - 2);
    factors.push({ factor: 'Regular/legitimate payment type', impact: -2 });
  }

  if (/family|relative|friend|parents|spouse|child|mother|father|brother|sister/i.test(desc)) {
    riskScore = Math.max(1, riskScore - 1);
    factors.push({ factor: 'Known recipient (family/friend)', impact: -1 });
  }

  // Ensure score is within bounds
  riskScore = Math.min(10, Math.max(1, Math.round(riskScore)));

  // Default if no red flags
  if (redFlags.length === 0) {
    redFlags.push('No specific red flags detected');
  }

  // Determine risk level and action
  const isSuspicious = riskScore >= 6;

  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  let recommendedAction: string;

  if (riskScore <= 3) {
    riskLevel = 'Low';
    recommendedAction = '✅ Transaction appears safe. No additional verification needed. Proceed with normal banking process.';
  } else if (riskScore <= 5) {
    riskLevel = 'Medium';
    recommendedAction = '⚠️ Monitor this transaction. Consider sending confirmation SMS/email to account holder. Verify if amount is expected.';
  } else if (riskScore <= 7) {
    riskLevel = 'High';
    recommendedAction = '🚨 Hold transaction. Require additional verification (phone call to registered mobile, OTP confirmation). Do NOT process without customer confirmation.';
  } else {
    riskLevel = 'Critical';
    recommendedAction = '🛑 BLOCK TRANSACTION IMMEDIATELY. Escalate to fraud investigation team. Contact customer via registered mobile number. Do NOT proceed under any circumstances.';
  }

  const reasoning = `Analysis based on ${factors.length} risk factors. Key indicators: ${redFlags.slice(0, 3).join(', ')}. Score calculated from pattern matching against known fraud indicators in Indian banking context.`;

  return {
    risk_score: riskScore,
    is_suspicious: isSuspicious,
    risk_level: riskLevel,
    recommended_action: recommendedAction,
    reasoning,
    red_flags: redFlags,
    confidence: 0.88,
    factors_analyzed: factors.length,
  };
}

// LLM Analysis with detailed prompt
async function llmAnalysis(description: string, amount?: number) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log('No OpenRouter API key found');
    return null;
  }

  const systemPrompt = `You are an expert Financial Fraud Detection AI for Indian Banks. Your job is to analyze transactions and detect potential fraud.

Analyze transactions considering:
1. Timing patterns (late night transfers = higher risk)
2. Amount patterns (large unexpected amounts = higher risk)
3. Recipient indicators (unknown/new beneficiaries = higher risk)
4. Language patterns (urgency words like "immediately", "urgent" = scam indicators)
5. Transaction type (crypto, investment schemes = high risk)
6. Common Indian fraud patterns (lottery scams, job scams, romance scams, KYC fraud, QR code scams)
7. Safe indicators (salary, rent, known family transfers = lower risk)

Risk Score Guidelines:
- 1-3: LOW RISK - Normal transactions
- 4-5: MEDIUM RISK - Needs monitoring
- 6-7: HIGH RISK - Needs verification before processing
- 8-10: CRITICAL RISK - Should be blocked

Always respond with valid JSON.`;

  const userPrompt = `Analyze this transaction for fraud risk and respond with ONLY valid JSON (no markdown, no explanation):

Transaction Description: "${description}"
${amount ? `Amount: ₹${amount.toLocaleString('en-IN')}` : 'Amount: Not specified'}

Respond with this exact JSON structure:
{
  "risk_score": <number 1-10>,
  "is_suspicious": <true/false>,
  "risk_level": "<Low/Medium/High/Critical>",
  "recommended_action": "<specific action recommendation>",
  "reasoning": "<detailed explanation of why this score was given>",
  "red_flags": ["<list of specific red flags detected>"],
  "confidence": <number between 0.7-0.99>
}`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
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

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('No JSON found in LLM response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and normalize
    if (typeof parsed.risk_score !== 'number' || parsed.risk_score < 1 || parsed.risk_score > 10) {
      parsed.risk_score = 5;
    }
    parsed.risk_score = Math.round(parsed.risk_score);

    parsed.is_suspicious = parsed.risk_score >= 6;

    const validLevels = ['Low', 'Medium', 'High', 'Critical'];
    if (!validLevels.includes(parsed.risk_level)) {
      if (parsed.risk_score <= 3) parsed.risk_level = 'Low';
      else if (parsed.risk_score <= 5) parsed.risk_level = 'Medium';
      else if (parsed.risk_score <= 7) parsed.risk_level = 'High';
      else parsed.risk_level = 'Critical';
    }

    parsed.confidence = typeof parsed.confidence === 'number' ? 
      Math.min(0.99, Math.max(0.7, parsed.confidence)) : 0.85;
    
    parsed.red_flags = Array.isArray(parsed.red_flags) && parsed.red_flags.length > 0 ? 
      parsed.red_flags : ['Analysis completed'];

    if (!parsed.recommended_action || typeof parsed.recommended_action !== 'string') {
      parsed.recommended_action = 'Review transaction carefully.';
    }
    if (!parsed.reasoning || typeof parsed.reasoning !== 'string') {
      parsed.reasoning = 'AI-based fraud analysis completed.';
    }

    return parsed;

  } catch (error) {
    console.log('LLM analysis failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount } = body;

    if (!description || description.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Try LLM first with 20s timeout
    const llmResult = await llmAnalysis(description, amount);

    if (llmResult) {
      return NextResponse.json({
        success: true,
        data: llmResult,
        method: 'llm',
      });
    }

    // Fallback to comprehensive rule-based analysis
    const analysis = ruleBasedAnalysis(description, amount);

    return NextResponse.json({
      success: true,
      data: analysis,
      method: 'rule-based',
    });

  } catch (error) {
    console.error('Analysis error:', error);

    // Even on error, return a valid response
    return NextResponse.json({
      success: true,
      data: {
        risk_score: 5,
        is_suspicious: false,
        risk_level: 'Medium',
        recommended_action: 'Review transaction manually due to system error.',
        reasoning: 'Automated analysis unavailable. Please review manually.',
        red_flags: ['System error - manual review required'],
        confidence: 0.5,
      },
      method: 'error-fallback',
    });
  }
}
