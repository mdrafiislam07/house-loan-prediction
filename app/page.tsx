'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { assess, validate } from '../lib/loan';
import type { CreditBand, Employment, Level, LoanInputs, LoanResult } from '../lib/loan';

/* ------------------------------ text (EN / BN) ------------------------------ */
const EN = {
  appName: 'HomeLoan AI',
  tagline: 'Estimate your EMI and house loan approval chance in seconds.',
  formTitle: 'Your details',
  formSub: 'Change any value and the EMI updates instantly.',
  sectionPerson: 'About you',
  sectionLoan: 'House and loan',
  age: 'Age',
  employment: 'Employment type',
  salaried: 'Salaried job',
  business: 'Business owner',
  selfEmployed: 'Self-employed / freelancer',
  yearsInJob: 'Years in current job / business',
  income: 'Monthly income (net)',
  existingEmi: 'Existing monthly loan / card payments',
  housePrice: 'House price',
  downPayment: 'Down payment',
  ofPrice: 'of the house price',
  term: 'Loan term (years)',
  rate: 'Interest rate (% per year)',
  credit: 'Credit history',
  creditExcellent: 'Excellent: always paid on time',
  creditGood: 'Good: rare delays',
  creditFair: 'Fair: some late payments',
  creditPoor: 'Poor: defaults or many delays',
  creditNone: 'No history: never borrowed',
  emiPreview: 'Estimated monthly EMI',
  loanOf: 'Loan amount',
  submit: 'Check approval chance',
  checking: 'Checking...',
  emptyTitle: 'Your result will appear here',
  emptyText: 'Fill in your details and press "Check approval chance".',
  stale: 'You changed the details. Press "Check approval chance" to update this result.',
  approval: 'Approval chance',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  noteHigh: 'Your profile looks strong for this loan.',
  noteMedium: 'Possible, but the bank may ask for changes.',
  noteLow: 'Approval looks unlikely as entered.',
  score: 'Score',
  monthlyEmi: 'Monthly EMI',
  loanAmount: 'Loan amount',
  totalInterest: 'Total interest',
  totalPayable: 'Total payable',
  dtiBack: 'Total debt / income',
  ltv: 'Loan-to-value',
  downPct: 'Down payment',
  maturityAge: 'Age at loan end',
  breakdown: 'How the score is built',
  bdDti: 'Debt burden',
  bdLtv: 'Loan-to-value',
  bdCredit: 'Credit history',
  bdStability: 'Income stability',
  bdAge: 'Age at loan end',
  aiTitle: 'AI explanation',
  strengths: 'What helps',
  risks: 'What hurts',
  tips: 'How to improve',
  aiUnavailable: 'The AI explanation is not available right now. The numbers above are still correct.',
  dti_over_60: 'Total debt is above 60% of income. Banks usually decline above this.',
  dti_over_50: "Total debt is above 50% of income, which is above most banks' limit.",
  ltv_over_90: 'The loan is above 90% of the house price.',
  age_over_70: 'The loan would end after age 70.',
  age_over_65: 'The loan would end after age 65.',
  disclaimer:
    "This is an estimate for guidance only. It is not financial advice and not a bank decision. Real approval depends on each bank's policy and your documents.",
  askTitle: 'Ask a follow-up question',
  askPlaceholder: 'Ask about your result...',
  send: 'Send',
  thinking: 'Thinking...',
  q1: 'How can I improve my chances?',
  q2: 'Is my EMI too high?',
  q3: 'What documents do banks usually ask for?',
  network: 'Network error. Please try again.',
  years: 'years'
};

const BN: typeof EN = {
  appName: 'HomeLoan AI',
  tagline: 'কয়েক সেকেন্ডেই আপনার মাসিক কিস্তি (EMI) ও হোম লোন অনুমোদনের সম্ভাবনা জানুন।',
  formTitle: 'আপনার তথ্য',
  formSub: 'যেকোনো মান বদলালেই কিস্তি সঙ্গে সঙ্গে আপডেট হবে।',
  sectionPerson: 'আপনার সম্পর্কে',
  sectionLoan: 'বাড়ি ও লোন',
  age: 'বয়স',
  employment: 'পেশার ধরন',
  salaried: 'চাকরিজীবী',
  business: 'ব্যবসায়ী',
  selfEmployed: 'স্বনিযুক্ত / ফ্রিল্যান্সার',
  yearsInJob: 'বর্তমান চাকরি/ব্যবসায় কত বছর',
  income: 'মাসিক আয় (নিট)',
  existingEmi: 'বর্তমান মাসিক লোন/কার্ডের কিস্তি',
  housePrice: 'বাড়ির দাম',
  downPayment: 'ডাউন পেমেন্ট',
  ofPrice: 'বাড়ির দামের',
  term: 'লোনের মেয়াদ (বছর)',
  rate: 'সুদের হার (বার্ষিক %)',
  credit: 'ক্রেডিট ইতিহাস',
  creditExcellent: 'চমৎকার: সবসময় সময়মতো শোধ',
  creditGood: 'ভালো: খুব কম দেরি',
  creditFair: 'মোটামুটি: কিছু দেরিতে পরিশোধ',
  creditPoor: 'দুর্বল: খেলাপি বা অনেক দেরি',
  creditNone: 'ইতিহাস নেই: কখনো ঋণ নেননি',
  emiPreview: 'আনুমানিক মাসিক কিস্তি',
  loanOf: 'লোনের পরিমাণ',
  submit: 'অনুমোদনের সম্ভাবনা দেখুন',
  checking: 'যাচাই হচ্ছে...',
  emptyTitle: 'ফলাফল এখানে দেখা যাবে',
  emptyText: 'আপনার তথ্য দিয়ে "অনুমোদনের সম্ভাবনা দেখুন" চাপুন।',
  stale: 'আপনি তথ্য বদলেছেন। ফলাফল নতুন করতে "অনুমোদনের সম্ভাবনা দেখুন" চাপুন।',
  approval: 'অনুমোদনের সম্ভাবনা',
  high: 'বেশি',
  medium: 'মাঝারি',
  low: 'কম',
  noteHigh: 'এই লোনের জন্য আপনার প্রোফাইল শক্তিশালী মনে হচ্ছে।',
  noteMedium: 'সম্ভব, তবে ব্যাংক কিছু বদল চাইতে পারে।',
  noteLow: 'এই তথ্যে অনুমোদন পাওয়া কঠিন মনে হচ্ছে।',
  score: 'স্কোর',
  monthlyEmi: 'মাসিক কিস্তি',
  loanAmount: 'লোনের পরিমাণ',
  totalInterest: 'মোট সুদ',
  totalPayable: 'মোট পরিশোধ',
  dtiBack: 'মোট ঋণ / আয়',
  ltv: 'লোন-টু-ভ্যালু',
  downPct: 'ডাউন পেমেন্ট',
  maturityAge: 'লোন শেষে বয়স',
  breakdown: 'স্কোর কীভাবে তৈরি হয়েছে',
  bdDti: 'ঋণের বোঝা',
  bdLtv: 'লোন-টু-ভ্যালু',
  bdCredit: 'ক্রেডিট ইতিহাস',
  bdStability: 'আয়ের স্থিতিশীলতা',
  bdAge: 'লোন শেষে বয়স',
  aiTitle: 'এআই ব্যাখ্যা',
  strengths: 'যা সাহায্য করছে',
  risks: 'যা ক্ষতি করছে',
  tips: 'কীভাবে উন্নতি করবেন',
  aiUnavailable: 'এআই ব্যাখ্যা এখন পাওয়া যাচ্ছে না। উপরের হিসাব ঠিকই আছে।',
  dti_over_60: 'মোট ঋণ আয়ের ৬০% এর বেশি। এর বেশি হলে ব্যাংক সাধারণত লোন দেয় না।',
  dti_over_50: 'মোট ঋণ আয়ের ৫০% এর বেশি, যা বেশিরভাগ ব্যাংকের সীমার ওপরে।',
  ltv_over_90: 'লোন বাড়ির দামের ৯০% এর বেশি।',
  age_over_70: 'লোন শেষ হতে হতে বয়স ৭০ পেরিয়ে যাবে।',
  age_over_65: 'লোন শেষ হতে হতে বয়স ৬৫ পেরিয়ে যাবে।',
  disclaimer:
    'এটি শুধু ধারণার জন্য একটি অনুমান। এটি আর্থিক পরামর্শ নয় এবং ব্যাংকের সিদ্ধান্তও নয়। প্রকৃত অনুমোদন নির্ভর করে প্রতিটি ব্যাংকের নীতি ও আপনার কাগজপত্রের ওপর।',
  askTitle: 'আরও কিছু জানতে চান?',
  askPlaceholder: 'আপনার ফলাফল নিয়ে প্রশ্ন করুন...',
  send: 'পাঠান',
  thinking: 'ভাবছি...',
  q1: 'কীভাবে অনুমোদনের সম্ভাবনা বাড়াতে পারি?',
  q2: 'আমার কিস্তি কি বেশি?',
  q3: 'ব্যাংক সাধারণত কী কী কাগজ চায়?',
  network: 'নেটওয়ার্কে সমস্যা। আবার চেষ্টা করুন।',
  years: 'বছর'
};

type Lang = 'en' | 'bn';
const TEXT: Record<Lang, typeof EN> = { en: EN, bn: BN };

/* --------------------------------- helpers --------------------------------- */
interface Form {
  age: string; employment: Employment; yearsInJob: string; monthlyIncome: string; existingEmi: string;
  housePrice: string; downPayment: string; termYears: string; annualRate: string; creditBand: CreditBand;
}
const DEFAULTS: Form = {
  age: '30', employment: 'salaried', yearsInJob: '3', monthlyIncome: '100000', existingEmi: '0',
  housePrice: '6000000', downPayment: '1500000', termYears: '20', annualRate: '11', creditBand: 'good'
};
const toInputs = (f: Form): LoanInputs => ({
  age: Number(f.age), employment: f.employment, yearsInJob: Number(f.yearsInJob), monthlyIncome: Number(f.monthlyIncome),
  existingEmi: Number(f.existingEmi), housePrice: Number(f.housePrice), downPayment: Number(f.downPayment),
  termYears: Number(f.termYears), annualRate: Number(f.annualRate), creditBand: f.creditBand
});

const money = (n: number) => `৳${Math.round(n).toLocaleString('en-IN')}`;
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

interface AiNotes { summary: string; strengths: string[]; risks: string[]; tips: string[] }
interface Msg { role: 'user' | 'assistant'; content: string }

const LEVEL_STYLE: Record<Level, { stroke: string; chip: string; text: string }> = {
  high: { stroke: '#0d9488', chip: 'bg-teal-50 border-teal-200 text-teal-800', text: 'text-teal-700' },
  medium: { stroke: '#d97706', chip: 'bg-amber-50 border-amber-200 text-amber-800', text: 'text-amber-700' },
  low: { stroke: '#e11d48', chip: 'bg-rose-50 border-rose-200 text-rose-800', text: 'text-rose-700' }
};

const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15';

/* -------------------------------- components -------------------------------- */
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function NumInput({ value, onChange, prefix, suffix, step }: {
  value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; step?: string;
}) {
  return (
    <div className="relative">
      {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">{prefix}</span>}
      <input
        type="number" inputMode="decimal" min="0" step={step || 'any'} value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-14' : ''}`}
      />
      {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">{suffix}</span>}
    </div>
  );
}

function Gauge({ score, level }: { score: number; level: Level }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(score), 60);
    return () => clearTimeout(t);
  }, [score]);
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={R} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="64" cy="64" r={R} fill="none" stroke={LEVEL_STYLE[level].stroke} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - shown / 100)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums text-slate-900">{score}</span>
        <span className="text-xs font-medium text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function Notes({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'bad' | 'tip' }) {
  if (!items.length) return null;
  const dot = tone === 'good' ? 'bg-teal-500' : tone === 'bad' ? 'bg-rose-500' : 'bg-sky-500';
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-slate-800">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------- page ----------------------------------- */
export default function HomeLoanPage() {
  const [lang, setLang] = useState<Lang>('en');
  const T = TEXT[lang];

  const [form, setForm] = useState<Form>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<LoanResult | null>(null);
  const [ai, setAi] = useState<AiNotes | null>(null);
  const [assessed, setAssessed] = useState<LoanInputs | null>(null);

  const [chat, setChat] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(k: K) => (v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const inputs = useMemo(() => toInputs(form), [form]);
  const preview = useMemo(() => (validate(inputs) ? null : assess(inputs)), [inputs]);
  const stale = !!assessed && JSON.stringify(assessed) !== JSON.stringify(inputs);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chat, chatLoading]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate(inputs);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, lang })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || T.network); return; }
      setResult(data.result);
      setAi(data.ai);
      setAssessed(inputs);
      setChat([]);
    } catch {
      setError(T.network);
    } finally {
      setLoading(false);
    }
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || chatLoading || !assessed) return;
    const next: Msg[] = [...chat, { role: 'user', content: q }];
    setChat(next);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, inputs: assessed, lang })
      });
      const data = await res.json();
      setChat([...next, { role: 'assistant', content: res.ok ? data.reply : data.error || T.network }]);
    } catch {
      setChat([...next, { role: 'assistant', content: T.network }]);
    } finally {
      setChatLoading(false);
    }
  };

  const creditOptions: [CreditBand, string][] = [
    ['excellent', T.creditExcellent], ['good', T.creditGood], ['fair', T.creditFair], ['poor', T.creditPoor], ['none', T.creditNone]
  ];
  const levelLabel: Record<Level, string> = { high: T.high, medium: T.medium, low: T.low };
  const levelNote: Record<Level, string> = { high: T.noteHigh, medium: T.noteMedium, low: T.noteLow };
  const bdLabel: Record<string, string> = { dti: T.bdDti, ltv: T.bdLtv, credit: T.bdCredit, stability: T.bdStability, age: T.bdAge };

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      {/* top bar */}
      <header className="bg-gradient-to-r from-[#0b1f3a] to-[#12305a] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/20 ring-1 ring-teal-300/40">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-teal-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" />
              </svg>
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">{T.appName}</h1>
              <p className="hidden text-xs text-slate-300 sm:block">Agentic AI</p>
            </div>
          </div>
          <div className="flex rounded-full bg-white/10 p-1 text-xs font-semibold ring-1 ring-white/15" role="group" aria-label="Language">
            {(['en', 'bn'] as Lang[]).map((l) => (
              <button
                key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`min-h-[32px] rounded-full px-3.5 transition ${lang === l ? 'bg-white text-[#0b1f3a]' : 'text-slate-200 hover:text-white'}`}
              >
                {l === 'en' ? 'EN' : 'বাংলা'}
              </button>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-2 sm:px-6">
          <p className="max-w-2xl text-2xl font-semibold leading-snug sm:text-3xl">{T.tagline}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* ------------------------------- form ------------------------------- */}
        <form onSubmit={submit} className="fade-up h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">{T.formTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{T.formSub}</p>

          <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-teal-700">{T.sectionPerson}</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label={T.age}><NumInput value={form.age} onChange={set('age')} step="1" /></Field>
              <Field label={T.yearsInJob}><NumInput value={form.yearsInJob} onChange={set('yearsInJob')} suffix={T.years} /></Field>
            </div>
            <Field label={T.employment}>
              <select value={form.employment} onChange={(e) => set('employment')(e.target.value as Employment)} className={inputCls}>
                <option value="salaried">{T.salaried}</option>
                <option value="business">{T.business}</option>
                <option value="self_employed">{T.selfEmployed}</option>
              </select>
            </Field>
            <Field label={T.income}><NumInput value={form.monthlyIncome} onChange={set('monthlyIncome')} prefix="৳" /></Field>
            <Field label={T.existingEmi}><NumInput value={form.existingEmi} onChange={set('existingEmi')} prefix="৳" /></Field>
            <Field label={T.credit}>
              <select value={form.creditBand} onChange={(e) => set('creditBand')(e.target.value as CreditBand)} className={inputCls}>
                {creditOptions.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </Field>
          </div>

          <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-wider text-teal-700">{T.sectionLoan}</p>
          <div className="space-y-4">
            <Field label={T.housePrice}><NumInput value={form.housePrice} onChange={set('housePrice')} prefix="৳" /></Field>
            <Field
              label={T.downPayment}
              hint={Number(form.housePrice) > 0 ? `${pct(Number(form.downPayment) / Number(form.housePrice))} ${T.ofPrice}` : undefined}
            >
              <NumInput value={form.downPayment} onChange={set('downPayment')} prefix="৳" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={T.term}><NumInput value={form.termYears} onChange={set('termYears')} step="1" /></Field>
              <Field label={T.rate}><NumInput value={form.annualRate} onChange={set('annualRate')} suffix="%" step="0.1" /></Field>
            </div>
          </div>

          {/* live EMI preview */}
          <div className="mt-6 rounded-xl bg-[#0b1f3a] p-4 text-white">
            <p className="text-xs text-slate-300">{T.emiPreview}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{preview ? money(preview.emi) : '–'}</p>
            {preview && <p className="mt-1 text-xs text-slate-300">{T.loanOf}: {money(preview.loanAmount)}</p>}
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="mt-5 min-h-[48px] w-full rounded-xl bg-teal-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? T.checking : T.submit}
          </button>
        </form>

        {/* ------------------------------ results ----------------------------- */}
        <section className="min-w-0 space-y-5" aria-live="polite">
          {!result && (
            <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
              <div>
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-600">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">{T.emptyTitle}</h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">{T.emptyText}</p>
              </div>
            </div>
          )}

          {result && (
            <>
              {stale && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{T.stale}</p>
              )}

              {/* verdict */}
              <div className="fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
                  <Gauge score={result.score} level={result.level} />
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{T.approval}</p>
                    <span className={`mt-2 inline-block rounded-full border px-4 py-1 text-xl font-bold ${LEVEL_STYLE[result.level].chip}`}>
                      {levelLabel[result.level]}
                    </span>
                    <p className="mt-3 max-w-md text-sm text-slate-600">{levelNote[result.level]}</p>
                  </div>
                </div>
                {result.flags.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {result.flags.map((f) => (
                      <li key={f} className="flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
                        <span aria-hidden="true">!</span><span>{T[f]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* numbers */}
              <div className="fade-up grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: '.08s' }}>
                <Metric label={T.monthlyEmi} value={money(result.emi)} />
                <Metric label={T.loanAmount} value={money(result.loanAmount)} />
                <Metric label={T.totalInterest} value={money(result.totalInterest)} />
                <Metric label={T.totalPayable} value={money(result.totalPayable)} />
                <Metric label={T.dtiBack} value={pct(result.dtiBack)} />
                <Metric label={T.ltv} value={pct(result.ltv)} />
                <Metric label={T.downPct} value={pct(result.downPct)} />
                <Metric label={T.maturityAge} value={`${result.ageAtMaturity}`} />
              </div>

              {/* score breakdown */}
              <div className="fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '.14s' }}>
                <h3 className="text-base font-bold">{T.breakdown}</h3>
                <div className="mt-4 space-y-3.5">
                  {result.breakdown.map((b) => (
                    <div key={b.key}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{bdLabel[b.key]}</span>
                        <span className="tabular-nums text-slate-500">{b.points} / {b.max}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-[width] duration-1000"
                          style={{ width: `${(b.points / b.max) * 100}%`, background: LEVEL_STYLE[result.level].stroke }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI explanation */}
              <div className="fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '.2s' }}>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">AI</span>
                  <h3 className="text-base font-bold">{T.aiTitle}</h3>
                </div>
                {ai ? (
                  <div className="mt-4 space-y-5">
                    <p className="text-sm leading-relaxed text-slate-700">{ai.summary}</p>
                    <div className="grid gap-5 md:grid-cols-2">
                      <Notes title={T.strengths} items={ai.strengths} tone="good" />
                      <Notes title={T.risks} items={ai.risks} tone="bad" />
                    </div>
                    <Notes title={T.tips} items={ai.tips} tone="tip" />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">{T.aiUnavailable}</p>
                )}
              </div>

              {/* follow-up chat */}
              <div className="fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '.26s' }}>
                <h3 className="text-base font-bold">{T.askTitle}</h3>
                {chat.length === 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[T.q1, T.q2, T.q3].map((q) => (
                      <button
                        key={q} type="button" onClick={() => send(q)}
                        className="min-h-[40px] rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                {chat.length > 0 && (
                  <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                    {chat.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          m.role === 'user' ? 'rounded-br-sm bg-teal-600 text-white' : 'rounded-bl-sm bg-slate-100 text-slate-800'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <p className="pl-1 text-sm italic text-slate-500">{T.thinking}</p>}
                    <div ref={chatEnd} />
                  </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); send(chatInput); }} className="mt-4 flex gap-2">
                  <input
                    value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={T.askPlaceholder} maxLength={400}
                    className={inputCls}
                  />
                  <button
                    type="submit" disabled={chatLoading || !chatInput.trim()}
                    className="min-h-[44px] shrink-0 rounded-xl bg-[#0b1f3a] px-5 text-sm font-semibold text-white transition hover:bg-[#12305a] disabled:opacity-50"
                  >
                    {T.send}
                  </button>
                </form>
              </div>

              <p className="px-1 text-xs leading-relaxed text-slate-500">{T.disclaimer}</p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}