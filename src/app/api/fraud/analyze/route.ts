import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API Configuration - Use Environment Variable
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FREE_MODEL = 'liquid/lfm-2.5-1.2b-instruct:free';

const SYSTEM_PROMPT = `You are a financial fraud detection expert for Indian banks. Analyze the transaction and return ONLY a valid JSON object. No explanation, no markdown, just pure JSON:

{
  "risk_score": <number 1-10>,
  "is_suspicious": <boolean>,
  "risk_level": "<Low|Medium|High|Critical>",
  "recommended_action": "<string>",
  "reasoning": "<string>",
  "red_flags": [<array of strings>],
  "confidence": <number 0-1>
}`;

// ============================================
// LLM ANALYSIS (Primary)
// ============================================
async function analyzeWithLLM(description: string, amount?: number): Promise<{
  risk_score: number;
  is_suspicious: boolean;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  recommended_action: string;
  reasoning: string;
  red_flags: string[];
  confidence: number;
} | null> {
  // Skip LLM if no API key
  if (!OPENROUTER_API_KEY) {
    console.log('No OpenRouter API key configured');
    return null;
  }

  try {
    const userMessage = `Analyze this transaction:\nDescription: ${description}${amount ? `\nAmount: ₹${amount.toLocaleString('en-IN')}` : ''}`;

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
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      console.log('OpenRouter API failed:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.log('No content from LLM');
      return null;
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('No JSON found in LLM response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (typeof parsed.risk_score !== 'number' || parsed.risk_score < 1 || parsed.risk_score > 10) {
      console.log('Invalid risk_score from LLM');
      return null;
    }

    // Ensure all fields exist with defaults
    return {
      risk_score: Math.min(10, Math.max(1, parsed.risk_score)),
      is_suspicious: parsed.is_suspicious ?? parsed.risk_score >= 6,
      risk_level: parsed.risk_level || 'Medium',
      recommended_action: parsed.recommended_action || 'Review transaction carefully.',
      reasoning: parsed.reasoning || 'Analysis completed.',
      red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : [],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
    };

  } catch (error) {
    console.log('LLM analysis error:', error);
    return null;
  }
}

// ============================================
// RULE-BASED ANALYSIS (Fallback - Always Works!)
// ============================================
function ruleBasedAnalysis(description: string, amount?: number) {
  const desc = description.toLowerCase();
  let riskScore = 3;
  const redFlags: string[] = [];

  // Cryptocurrency
  if (/crypto|bitcoin|btc|wallet|ethereum|eth|usdt/i.test(desc)) {
    redFlags.push('Cryptocurrency-related transaction');
    riskScore += 2;
  }

  // Urgency language
  if (/urgent|immediately|asap|emergency|quick|fast|hurry/i.test(desc)) {
    redFlags.push('Urgency language detected');
    riskScore += 2;
  }

  // Late night transfers
  if (/\d+\s*(am|pm|midnight|night|2\s*am|3\s*am|4\s*am|1\s*am)/i.test(desc)) {
    redFlags.push('Unusual timing (late night)');
    riskScore += 1;
  }

  // Unknown recipient
  if (/unknown|unverified|new account|stranger|first.time/i.test(desc)) {
    redFlags.push('Unknown or unverified recipient');
    riskScore += 2;
  }

  // International transfers
  if (/international|overseas|foreign|nigeria|abroad|cross.border/i.test(desc)) {
    redFlags.push('International transfer');
    riskScore += 1;
  }

  // Large amounts
  if (amount) {
    if (amount > 100000) {
      redFlags.push(`Large amount (₹${(amount / 1000).toFixed(0)}K)`);
      riskScore += 2;
    }
    if (amount > 500000) {
      riskScore += 1;
    }
  }

  // Multiple rapid transactions
  if (/multiple|several|many|\d+\s*(times|x)/i.test(desc)) {
    redFlags.push('Multiple rapid transactions');
    riskScore += 1;
  }

  // Investment/scam keywords
  if (/investment|opportunity|double|profit|returns|guaranteed|lottery|prize/i.test(desc)) {
    redFlags.push('Investment-related (potential scam)');
    riskScore += 2;
  }

  // QR code scam
  if (/qr|scan|receive.*money/i.test(desc)) {
    redFlags.push('QR code related (potential scam)');
    riskScore += 1;
  }

  // Ensure bounds
  riskScore = Math.min(10, Math.max(1, riskScore));

  // Default if no flags
  if (redFlags.length === 0) {
    redFlags.push('No specific red flags detected');
  }

  // Determine risk level
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
    reasoning: `Analysis based on transaction patterns. ${redFlags.length > 0 ? 'Detected: ' + redFlags.join(', ') : 'No significant risk indicators found.'}`,
    red_flags: redFlags,
    confidence: 0.85,
  };
}

// ============================================
// MAIN API HANDLER
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount } = body;

    // Validate input
    if (!description || description.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Please provide a transaction description (at least 10 characters)',
      }, { status: 400 });
    }

    // Try LLM first (if API key available)
    if (OPENROUTER_API_KEY) {
      console.log('Attempting LLM analysis...');
      const llmResult = await analyzeWithLLM(description.trim(), amount);
      
      if (llmResult) {
        console.log('LLM analysis successful');
        return NextResponse.json({
          success: true,
          data: llmResult,
          method: 'llm',
        });
      }
    }

    // Fallback to rule-based (always works!)
    console.log('Using rule-based fallback');
    const analysis = ruleBasedAnalysis(description.trim(), amount);

    return NextResponse.json({
      success: true,
      data: analysis,
      method: 'rule-based',
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Even on error, try to return something useful
    return NextResponse.json({
      success: true,
      data: {
        risk_score: 5,
        is_suspicious: false,
        risk_level: 'Medium',
        recommended_action: 'Please review this transaction manually.',
        reasoning: 'Automated analysis unavailable. Manual review recommended.',
        red_flags: ['Analysis service temporarily unavailable'],
        confidence: 0.5,
      },
      method: 'fallback',
    });
  }
}
