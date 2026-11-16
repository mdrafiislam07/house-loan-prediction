import { NextResponse } from 'next/server';
import { assess, validate, type LoanInputs } from '../../../lib/loan';
import { generate, parseJson } from '../../../lib/gemini';

interface AiNotes {
  summary: string;
  strengths: string[];
  risks: string[];
  tips: string[];
}

const list = (v: unknown, max: number): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, max).map((x) => String(x).trim()) : [];

export async function POST(req: Request) {
  let body: { inputs?: unknown; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const error = validate(body.inputs);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const inputs = body.inputs as LoanInputs;
  const lang = body.lang === 'bn' ? 'Bangla (Bengali script)' : 'English';
  const result = assess(inputs); // all numbers are computed here, not by the AI

  let ai: AiNotes | null = null;
  try {
    const system =
      'You are HomeLoan AI, a careful assistant that explains a house-loan approval estimate for a borrower in Bangladesh. ' +
      'The numbers and the approval level were already calculated by code. Never change, recalculate or contradict them, ' +
      'and never invent numbers that are not given. Never promise approval. Be specific, practical and concise. Currency is BDT (taka).';

    const prompt = `Borrower and loan data (JSON):
${JSON.stringify({ inputs, result }, null, 2)}

Write your answer in ${lang}.
Return ONLY a JSON object with these keys:
- "summary": 2-3 sentences explaining the approval level (${result.level}) and the score (${result.score}/100).
- "strengths": up to 3 short strings (what helps the application).
- "risks": up to 3 short strings (what hurts it, use the numbers given).
- "tips": up to 4 short, concrete actions. You may use "targetEmi40" (max new EMI at 40% total debt) and "extraDownFor80" (extra down payment for 80% LTV) when relevant.`;

    const text = await generate({ system, contents: [{ role: 'user', parts: [{ text: prompt }] }], json: true });
    const parsed = parseJson<Partial<AiNotes>>(text);
    if (parsed && typeof parsed.summary === 'string') {
      ai = {
        summary: parsed.summary.trim(),
        strengths: list(parsed.strengths, 3),
        risks: list(parsed.risks, 3),
        tips: list(parsed.tips, 4)
      };
    }
  } catch (e) {
    console.error('Gemini explanation failed:', e);
  }

  // If the AI is unavailable the numeric result is still returned (ai = null).
  return NextResponse.json({ result, ai });
}