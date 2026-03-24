import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Transaction Analysis
 * Primary: OpenRouter LLM (fast timeout: 6s)
 * Fallback: Comprehensive rule-based analysis (instant)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'liquid/lfm-2.5-1.2b-instruct:free';
const TIMEOUT_MS = 6000; // 6 seconds max - fast fallback

// Comprehensive rule-based fallback analysis
function ruleBasedAnalysis(description: string, amount?: number) {
  const desc = description.toLowerCase();
  let riskScore = 3;
  const redFlags: string[] = [];

  // ========== HIGH RISK INDICATORS ==========

  // Cryptocurrency related (HIGH RISK)
  if (/crypto|bitcoin|btc|ethereum|eth|usdt|binance|coinbase|wallet address|blockchain/i.test(desc)) {
    redFlags.push('Cryptocurrency-related - HIGH FRAUD RISK');
    riskScore += 3;
  }

  // Urgency/Emergency language (HIGH RISK)
  if (/urgent|immediately|asap|emergency|right now|within hour|today itself|very urgent|fast|quick|hurry/i.test(desc)) {
    redFlags.push('Urgency language detected - typical scam tactic');
    riskScore += 2;
  }

  // Unknown/Unverified recipient (HIGH RISK)
  if (/unknown|unverified|new beneficiary|stranger|first time|never met|new account/i.test(desc)) {
    redFlags.push('Unknown or unverified recipient');
    riskScore += 2;
  }

  // Investment/Get-rich-quick schemes (HIGH RISK)
  if (/investment|double your|guaranteed return|profit|scheme|opportunity|trading|forex|high return/i.test(desc)) {
    redFlags.push('Investment-related - potential scam');
    riskScore += 3;
  }

  // Lottery/Prize scams (HIGH RISK)
  if (/lottery|winner|prize|lucky draw|won|jackpot|lucky winner|award|reward/i.test(desc)) {
    redFlags.push('Lottery/Prize scam indicators');
    riskScore += 4;
  }

  // Job/Work from home scams (HIGH RISK)
  if (/work from home|part time job|data entry|typing job|job offer|salary advance|recruitment|job fee|training fee/i.test(desc)) {
    redFlags.push('Job/Work-from-home scam indicators');
    riskScore += 3;
  }

  // Romance/Relationship scams (HIGH RISK)
  if (/boyfriend|girlfriend|fiance|marriage|dating|matrimony|relationship|stuck abroad/i.test(desc)) {
    redFlags.push('Potential romance scam indicators');
    riskScore += 3;
  }

  // Government/Authority impersonation (HIGH RISK)
  if (/income tax|gst|customs|police|court|legal|government|official|tax department|itr|penalty|fine/i.test(desc)) {
    redFlags.push('Government/Authority impersonation attempt');
    riskScore += 3;
  }

  // Bank impersonation (HIGH RISK)
  if (/bank.*verification|account.*suspend|kyc|pan card|aadhaar|update.*details|bank executive called/i.test(desc)) {
    redFlags.push('Bank/Financial institution impersonation');
    riskScore += 3;
  }

  // OTP/PIN related (HIGH RISK)
  if (/otp|pin|cvv|password|card number|expiry|share.*otp|received.*otp|someone asking/i.test(desc)) {
    redFlags.push('OTP/PIN/Card details sharing attempt');
    riskScore += 4;
  }

  // ========== MEDIUM RISK INDICATORS ==========

  // Late night timing
  if (/\d+\s*(am|pm)|midnight|night|1 am|2 am|3 am|4 am|5 am|late night/i.test(desc)) {
    const hourMatch = desc.match(/(\d{1,2})\s*(am|pm)/i);
    if (hourMatch) {
      const hour = parseInt(hourMatch[1]);
      const period = hourMatch[2].toLowerCase();
      const actualHour = period === 'pm' && hour !== 12 ? hour + 12 : hour;
      if (actualHour >= 0 && actualHour <= 5) {
        redFlags.push('Unusual timing (late night: 12 AM - 5 AM)');
        riskScore += 1;
      }
    } else {
      redFlags.push('Unusual timing mentioned');
      riskScore += 1;
    }
  }

  // International transfers
  if (/international|overseas|foreign|abroad|nigeria|ghana|africa|uk|usa|dubai|singapore|cross.?border|swift|wire transfer/i.test(desc)) {
    redFlags.push('International transfer detected');
    riskScore += 1;
  }

  // QR Code scanning
  if (/qr code|scan|upi.*scan|scan.*pay|gpay.*scan|phonepe.*scan/i.test(desc)) {
    redFlags.push('QR code payment mentioned - verify direction');
    riskScore += 2;
  }

  // Multiple transactions
  if (/multiple|several|many|\d+\s*times|repeated|again and again|daily|every day/i.test(desc)) {
    redFlags.push('Multiple/repeated transactions');
    riskScore += 1;
  }

  // Suspicious links
  if (/link|click|sms|whatsapp.*link|email.*link|phishing|fake website/i.test(desc)) {
    redFlags.push('Suspicious link/attachment mentioned');
    riskScore += 2;
  }

  // ========== AMOUNT-BASED RISK ==========

  if (amount) {
    if (amount >= 1000000) {
      redFlags.push(`Very large amount: ₹${(amount / 100000).toFixed(1)} Lakhs`);
      riskScore += 2;
    } else if (amount >= 200000) {
      redFlags.push(`Large amount: ₹${(amount / 100000).toFixed(1)} Lakhs`);
      riskScore += 1;
    } else if (amount >= 50000) {
      redFlags.push(`Significant amount: ₹${(amount / 1000).toFixed(0)}K`);
      riskScore += 0.5;
    }
  }

  // ========== SAFE INDICATORS (reduce risk) ==========

  if (/salary|rent|emi|electricity bill|mobile recharge|dth|insurance premium|mutual fund|sip|fixed deposit|ppf|nps/i.test(desc)) {
    riskScore = Math.max(1, riskScore - 2);
  }

  if (/family|relative|friend|parents|spouse|child|mother|father|brother|sister/i.test(desc)) {
    riskScore = Math.max(1, riskScore - 1);
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
    recommendedAction = 'Transaction appears safe. No additional verification needed.';
  } else if (riskScore <= 5) {
    riskLevel = 'Medium';
    recommendedAction = 'Monitor this transaction. Consider sending confirmation to account holder.';
  } else if (riskScore <= 7) {
    riskLevel = 'High';
    recommendedAction = 'Hold transaction. Require additional verification before processing.';
  } else {
    riskLevel = 'Critical';
    recommendedAction = 'BLOCK TRANSACTION IMMEDIATELY. Escalate to fraud investigation team.';
  }

  const reasoning = `Analysis based on pattern matching. Key indicators: ${redFlags.slice(0, 3).join(', ')}.`;

  return {
    risk_score: riskScore,
    is_suspicious: isSuspicious,
    risk_level: riskLevel,
    recommended_action: recommendedAction,
    reasoning,
    red_flags: redFlags,
    confidence: 0.88,
  };
}

// Fast LLM Analysis with short timeout
async function llmAnalysis(description: string, amount?: number) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  // Shorter prompt for faster response
  const prompt = `Analyze this transaction for fraud risk. Respond with ONLY JSON:

Transaction: "${description}"${amount ? `, Amount: ₹${amount}` : ''}

JSON format: {"risk_score":1-10,"is_suspicious":true/false,"risk_level":"Low/Medium/High/Critical","recommended_action":"brief","reasoning":"brief","red_flags":["flag1"],"confidence":0.85}`;

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
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate
    parsed.risk_score = Math.min(10, Math.max(1, Math.round(parsed.risk_score || 5)));
    parsed.is_suspicious = parsed.risk_score >= 6;

    const validLevels = ['Low', 'Medium', 'High', 'Critical'];
    if (!validLevels.includes(parsed.risk_level)) {
      if (parsed.risk_score <= 3) parsed.risk_level = 'Low';
      else if (parsed.risk_score <= 5) parsed.risk_level = 'Medium';
      else if (parsed.risk_score <= 7) parsed.risk_level = 'High';
      else parsed.risk_level = 'Critical';
    }

    parsed.confidence = Math.min(0.99, Math.max(0.7, parsed.confidence || 0.85));
    parsed.red_flags = Array.isArray(parsed.red_flags) && parsed.red_flags.length > 0 ? parsed.red_flags : ['Analysis completed'];

    return parsed;

  } catch {
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

    // Try LLM first with 6s timeout
    const llmResult = await llmAnalysis(description, amount);

    if (llmResult) {
      return NextResponse.json({
        success: true,
        data: llmResult,
        method: 'llm',
      });
    }

    // Instant fallback to rule-based analysis
    const analysis = ruleBasedAnalysis(description, amount);

    return NextResponse.json({
      success: true,
      data: analysis,
      method: 'rule-based',
    });

  } catch (error) {
    console.error('Analysis error:', error);

    return NextResponse.json({
      success: true,
      data: {
        risk_score: 5,
        is_suspicious: false,
        risk_level: 'Medium',
        recommended_action: 'Review transaction manually.',
        reasoning: 'System error occurred during analysis.',
        red_flags: ['System error - manual review required'],
        confidence: 0.5,
      },
      method: 'error-fallback',
    });
  }
}
