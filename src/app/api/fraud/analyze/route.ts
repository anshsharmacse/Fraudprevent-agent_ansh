import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Transaction Analysis
 * 
 * Primary: OpenRouter LLM (free model)
 * Fallback: Rule-based analysis
 * 
 * Always returns a valid response - never fails!
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'liquid/lfm-2.5-1.2b-instruct:free';

// Rule-based fallback analysis
function ruleBasedAnalysis(description: string, amount?: number) {
  const desc = description.toLowerCase();
  let riskScore = 3;
  const redFlags: string[] = [];
  
  // Check for cryptocurrency-related keywords
  if (/crypto|bitcoin|btc|wallet|ethereum|eth|usdt/i.test(desc)) {
    redFlags.push('Cryptocurrency-related transaction');
    riskScore += 2;
  }
  
  // Check for urgency language
  if (/urgent|immediately|asap|emergency|quick|fast|hurry/i.test(desc)) {
    redFlags.push('Urgency language detected');
    riskScore += 2;
  }
  
  // Check for unusual timing
  if (/\d+\s*(am|pm|midnight|night|2 am|3 am|4 am|1 am)/i.test(desc)) {
    redFlags.push('Unusual timing (late night)');
    riskScore += 1;
  }
  
  // Check for unknown/unverified recipients
  if (/unknown|unverified|new account|stranger|first.time/i.test(desc)) {
    redFlags.push('Unknown or unverified recipient');
    riskScore += 2;
  }
  
  // Check for international transfers
  if (/international|overseas|foreign|nigeria|abroad|cross.border/i.test(desc)) {
    redFlags.push('International transfer');
    riskScore += 1;
  }
  
  // Check amount-based risk
  if (amount) {
    if (amount > 100000) {
      redFlags.push(`Large amount (₹${(amount / 1000).toFixed(0)}K)`);
      riskScore += 2;
    }
    if (amount > 500000) {
      riskScore += 1;
    }
  }
  
  // Check for multiple rapid transactions
  if (/multiple|several|many|\d+\s*(times|x)/i.test(desc)) {
    redFlags.push('Multiple rapid transactions');
    riskScore += 1;
  }
  
  // Check for investment/scam keywords
  if (/investment|opportunity|double|profit|returns|guaranteed/i.test(desc)) {
    redFlags.push('Investment-related (potential scam)');
    riskScore += 2;
  }
  
  // Ensure score is within bounds
  riskScore = Math.min(10, Math.max(1, riskScore));
  
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
  
  const reasoning = `Analysis based on transaction patterns. ${redFlags.length > 0 ? 'Detected: ' + redFlags.join(', ') : 'No significant risk indicators found.'}`;
  
  return {
    risk_score: riskScore,
    is_suspicious: isSuspicious,
    risk_level: riskLevel,
    recommended_action: recommendedAction,
    reasoning,
    red_flags: redFlags,
    confidence: 0.85,
  };
}

// Try OpenRouter LLM for analysis
async function llmAnalysis(description: string, amount?: number): Promise<{
  risk_score: number;
  is_suspicious: boolean;
  risk_level: string;
  recommended_action: string;
  reasoning: string;
  red_flags: string[];
  confidence: number;
} | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.log('No OpenRouter API key found, using fallback');
    return null;
  }
  
  const prompt = `You are a financial fraud detection expert for Indian banks. Analyze this transaction and respond with ONLY a JSON object (no markdown, no explanation):

Transaction: "${description}"
${amount ? `Amount: ₹${amount}` : ''}

Respond with exactly this JSON format:
{
  "risk_score": <number 1-10>,
  "is_suspicious": <boolean>,
  "risk_level": "<Low|Medium|High|Critical>",
  "recommended_action": "<brief recommendation>",
  "reasoning": "<brief explanation>",
  "red_flags": ["<flag1>", "<flag2>"],
  "confidence": <number 0-1>
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
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
        temperature: 0.3,
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
    
    // Validate required fields
    if (typeof parsed.risk_score !== 'number') {
      parsed.risk_score = 5;
    }
    
    // Ensure risk_score is within bounds
    parsed.risk_score = Math.min(10, Math.max(1, parsed.risk_score));
    parsed.is_suspicious = parsed.risk_score >= 6;
    
    // Validate risk_level
    const validLevels = ['Low', 'Medium', 'High', 'Critical'];
    if (!validLevels.includes(parsed.risk_level)) {
      if (parsed.risk_score <= 3) parsed.risk_level = 'Low';
      else if (parsed.risk_score <= 5) parsed.risk_level = 'Medium';
      else if (parsed.risk_score <= 7) parsed.risk_level = 'High';
      else parsed.risk_level = 'Critical';
    }
    
    parsed.confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.8;
    parsed.red_flags = Array.isArray(parsed.red_flags) ? parsed.red_flags : [];
    
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
    
    // Try LLM first
    const llmResult = await llmAnalysis(description, amount);
    
    if (llmResult) {
      return NextResponse.json({
        success: true,
        data: llmResult,
        method: 'llm',
      });
    }
    
    // Fallback to rule-based analysis
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
        recommended_action: 'Review transaction manually.',
        reasoning: 'System error occurred during analysis. Please review.',
        red_flags: ['Analysis system error'],
        confidence: 0.5,
      },
      method: 'error-fallback',
    });
  }
}
