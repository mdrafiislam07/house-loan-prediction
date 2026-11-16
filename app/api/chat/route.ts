import { NextResponse } from 'next/server';
import { assess, validate, type LoanInputs } from '../../../lib/loan';
import { generate, type GeminiTurn } from '../../../lib/gemini';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  let body: { messages?: ChatMsg[]; inputs?: unknown; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const error = validate(body.inputs);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const inputs = body.inputs as LoanInputs;
  const result = assess(inputs); // recomputed on the server, the client result is never trusted
  const lang = body.lang === 'bn' ? 'Bangla (Bengali script)' : 'English';

  // keep the last 8 turns, each capped, and make sure the conversation starts with a user turn
  const turns: GeminiTurn[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-8)
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content.slice(0, 600) }] }));
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length) return NextResponse.json({ error: 'Ask a question first.' }, { status: 400 });

  const system =
    'You are HomeLoan AI, a friendly assistant that answers follow-up questions about a house-loan approval estimate in Bangladesh. ' +
    'Use only the figures below. Do not recalculate the score or invent numbers. ' +
    "If asked about a specific bank's current rate, fee or policy, say you cannot verify it and suggest checking with the bank. " +
    'This is an estimate, not financial advice and not a bank decision. Keep answers under 120 words. ' +
    `Reply in ${lang}.\n\nBorrower data:\n${JSON.stringify({ inputs, result }, null, 2)}`;

  try {
    const reply = await generate({ system, contents: turns, temperature: 0.5 });
    return NextResponse.json({ reply: reply || '...' });
  } catch (e) {
    console.error('Gemini chat failed:', e);
    return NextResponse.json({ error: 'The AI assistant is not available right now. Please try again.' }, { status: 502 });
  }
}