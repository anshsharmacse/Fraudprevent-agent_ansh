import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Transaction Analysis
 * Primary: OpenRouter LLM (timeout: 10s)
 * Fallback: Rule-based analysis (instant)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'liquid/lfm-2.5-1.2b-instruct:free';
const TIMEOUT_MS = 10000; // 10 seconds max

// Rule-based fallback (instant)
function ruleBasedAnalysis(description: string, amount?: number) {
  const desc = description.toLowerCase();
  let riskScore = 3;
  const redFlags: string[] = [];
  
  if (/crypto|bitcoin|btc|wallet|ethereum|eth|usdt/i.test(desc)) {
    redFlags.push('Cryptocurrency-related transaction');
    riskScore += 2;
  }
  if (/urgent|immediately|asap|emergency|quick|fast|hurry/i.test(desc)) {
    redFlags.push('Urgency language detected');
    riskScore += 2;
  }
  if (/\d+\s*(am|pm|midnight|night|2 am|3 am|4 am|1 am)/i.test(desc)) {
    redFlags.push('Unusual timing (late night)');
    riskScore += 1;
  }
  if (/unknown|unverified|new account|stranger|first.time/i.test(desc)) {
    redFlags.push('Unknown or unverified recipient');
    riskScore += 2;
  }
  if (/international|overseas|foreign|nigeria|abroad|cross.border/i.test(desc)) {
    redFlags.push('International transfer');
    riskScore += 1;
  }
  if (amount) {
    if (amount > 100000) {
      redFlags.push(`Large amount (₹${(amount / 1000).toFixed(0)}K)`);
      riskScore += 2;
    }
    if (amount > 500000) riskScore += 1;
  }
  if (/multiple|several|many|\d+\s*(times|x)/i.test(desc)) {
    redFlags.push('Multiple rapid transactions');
    riskScore += 1;
  }
  if (/investment|opportunity|double|profit|returns|guaranteed/i.test(desc)) {
    redFlags.push('Investment-related (potential scam)');
    riskScore += 2;
  }
  
  riskScore = Math.min(10, Math.max(1, riskScore));
  if (redFlags.length === 0) redFlags.push('No specific red flags detected');
  
  const isSuspicious = riskScore >= 6;
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  let recommendedAction: string;
  
  if (riskScore <= 3) {
    riskLevel = 'Low';
    recommendedAction = 'Transaction approved. No additional verification needed.';
  } else if (riskScore <= 5) {
    riskLevel = 'Medium';
    recommendedAction = 'Monitor transaction. Consider sending confirmation to account holder.';
  } else if (riskScore <= 7) {
    riskLevel = 'High';
    recommendedAction = 'Hold transaction. Require additional verification before processing.';
  } else {
    riskLevel = 'Critical';
    recommendedAction = 'Block transaction immediately. Escalate to fraud investigation team.';
  }
  
  return {
    risk_score: riskScore,
    is_suspicious: isSuspicious,
    risk_level: riskLevel,
    recommended_action: recommendedAction,
    reasoning: `Analysis based on transaction patterns. Detected: ${redFlags.join(', ')}`,
    red_flags: redFlags,
    confidence: 0.85,
  };
}

async function llmAnalysis(description: string, amount?: number) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  
  const prompt = `Analyze this transaction for fraud risk (respond with ONLY JSON):
Transaction: "${description}"${amount ? `, Amount: ₹${amount}` : ''}
JSON: {"risk_score":1-10,"is_suspicious":true/false,"risk_level":"Low/Medium/High/Critical","recommended_action":"brief","reasoning":"brief","red_flags":["flag1"],"confidence":0.8}`;

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
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    parsed.risk_score = Math.min(10, Math.max(1, parsed.risk_score || 5));
    parsed.is_suspicious = parsed.risk_score >= 6;
    
    const validLevels = ['Low', 'Medium', 'High', 'Critical'];
    if (!validLevels.includes(parsed.risk_level)) {
      if (parsed.risk_score <= 3) parsed.risk_level = 'Low';
      else if (parsed.risk_score <= 5) parsed.risk_level = 'Medium';
      else if (parsed.risk_score <= 7) parsed.risk_level = 'High';
      else parsed.risk_level = 'Critical';
    }
    parsed.confidence = parsed.confidence || 0.8;
    parsed.red_flags = Array.isArray(parsed.red_flags) ? parsed.red_flags : [];
    
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { description, amount } = await request.json();
    
    if (!description || description.length < 10) {
      return NextResponse.json({ success: false, error: 'Description must be at least 10 characters' }, { status: 400 });
    }
    
    const llmResult = await llmAnalysis(description, amount);
    if (llmResult) return NextResponse.json({ success: true, data: llmResult, method: 'llm' });
    
    const analysis = ruleBasedAnalysis(description, amount);
    return NextResponse.json({ success: true, data: analysis, method: 'rule-based' });
  } catch {
    return NextResponse.json({
      success: true,
      data: { risk_score: 5, is_suspicious: false, risk_level: 'Medium', recommended_action: 'Review manually.', reasoning: 'System error.', red_flags: ['Error'], confidence: 0.5 },
    });
  }
}
