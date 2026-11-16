// Pure loan maths + a transparent, rule-based approval score (0-100).
// Used on the server (trusted result) and in the browser (live EMI preview).
// All numbers come from code, never from the AI model.

export type CreditBand = 'excellent' | 'good' | 'fair' | 'poor' | 'none';
export type Employment = 'salaried' | 'business' | 'self_employed';
export type Level = 'high' | 'medium' | 'low';

export interface LoanInputs {
  age: number;
  employment: Employment;
  yearsInJob: number;      // years in current job / business
  monthlyIncome: number;   // net monthly income
  existingEmi: number;     // total existing monthly loan / card payments
  housePrice: number;
  downPayment: number;
  termYears: number;
  annualRate: number;      // percent, e.g. 11
  creditBand: CreditBand;
}

export interface ScoreItem {
  key: 'dti' | 'ltv' | 'credit' | 'stability' | 'age';
  points: number;
  max: number;
}

export type Flag = 'dti_over_60' | 'dti_over_50' | 'ltv_over_90' | 'age_over_70' | 'age_over_65';

export interface LoanResult {
  loanAmount: number;
  emi: number;
  totalPayable: number;
  totalInterest: number;
  ltv: number;             // 0-1
  downPct: number;         // 0-1
  dtiFront: number;        // EMI / income
  dtiBack: number;         // (EMI + existing) / income
  ageAtMaturity: number;
  score: number;           // 0-100
  level: Level;
  breakdown: ScoreItem[];
  flags: Flag[];
  targetEmi40: number;     // max new EMI that keeps total debt at 40% of income
  extraDownFor80: number;  // extra down payment needed to reach 80% LTV
}

const CREDIT_POINTS: Record<CreditBand, number> = { excellent: 20, good: 16, fair: 9, poor: 2, none: 8 };
const TYPE_POINTS: Record<Employment, number> = { salaried: 3, business: 2, self_employed: 1 };

export function monthlyEmi(principal: number, annualRatePct: number, years: number): number {
  const n = Math.round(years * 12);
  if (!(principal > 0) || n <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Returns an error message, or null when the inputs are usable. */
export function validate(i: unknown): string | null {
  if (!i || typeof i !== 'object') return 'Inputs are missing.';
  const x = i as Record<string, unknown>;
  const numeric = ['age', 'yearsInJob', 'monthlyIncome', 'existingEmi', 'housePrice', 'downPayment', 'termYears', 'annualRate'];
  for (const f of numeric) if (!isNum(x[f])) return `Please enter a valid number for "${f}".`;
  if (!['salaried', 'business', 'self_employed'].includes(String(x.employment))) return 'Select an employment type.';
  if (!['excellent', 'good', 'fair', 'poor', 'none'].includes(String(x.creditBand))) return 'Select a credit history.';
  const n = x as unknown as LoanInputs;
  if (n.age < 18 || n.age > 80) return 'Age must be between 18 and 80.';
  if (n.yearsInJob < 0 || n.yearsInJob > 60) return 'Years in current job must be between 0 and 60.';
  if (n.monthlyIncome <= 0) return 'Monthly income must be greater than 0.';
  if (n.existingEmi < 0) return 'Existing monthly payments cannot be negative.';
  if (n.housePrice <= 0) return 'House price must be greater than 0.';
  if (n.downPayment < 0) return 'Down payment cannot be negative.';
  if (n.downPayment >= n.housePrice) return 'Down payment must be less than the house price.';
  if (n.termYears < 1 || n.termYears > 40) return 'Loan term must be between 1 and 40 years.';
  if (n.annualRate < 0 || n.annualRate > 40) return 'Interest rate must be between 0% and 40%.';
  return null;
}

export function assess(i: LoanInputs): LoanResult {
  const loanAmount = i.housePrice - i.downPayment;
  const emi = monthlyEmi(loanAmount, i.annualRate, i.termYears);
  const totalPayable = emi * i.termYears * 12;
  const totalInterest = Math.max(0, totalPayable - loanAmount);
  const ltv = loanAmount / i.housePrice;
  const downPct = i.downPayment / i.housePrice;
  const dtiFront = emi / i.monthlyIncome;
  const dtiBack = (emi + i.existingEmi) / i.monthlyIncome;
  const ageAtMaturity = i.age + i.termYears;

  // 1) Total debt burden (35 pts)
  const dti = dtiBack <= 0.3 ? 35 : dtiBack <= 0.4 ? 28 : dtiBack <= 0.5 ? 15 : dtiBack <= 0.6 ? 6 : 0;
  // 2) Loan-to-value (20 pts)
  const ltvPts = ltv <= 0.7 ? 20 : ltv <= 0.8 ? 16 : ltv <= 0.9 ? 8 : 2;
  // 3) Credit history (20 pts)
  const credit = CREDIT_POINTS[i.creditBand];
  // 4) Income stability: years (12) + employment type (3) = 15 pts
  const yearsPts = i.yearsInJob >= 5 ? 12 : i.yearsInJob >= 2 ? 9 : i.yearsInJob >= 1 ? 5 : 2;
  const stability = yearsPts + TYPE_POINTS[i.employment];
  // 5) Age at the end of the loan (10 pts)
  const agePts = ageAtMaturity <= 60 ? 10 : ageAtMaturity <= 65 ? 6 : ageAtMaturity <= 70 ? 2 : 0;

  const breakdown: ScoreItem[] = [
    { key: 'dti', points: dti, max: 35 },
    { key: 'ltv', points: ltvPts, max: 20 },
    { key: 'credit', points: credit, max: 20 },
    { key: 'stability', points: stability, max: 15 },
    { key: 'age', points: agePts, max: 10 }
  ];
  const score = Math.round(breakdown.reduce((s, b) => s + b.points, 0));

  const flags: Flag[] = [];
  if (dtiBack > 0.6) flags.push('dti_over_60');
  else if (dtiBack > 0.5) flags.push('dti_over_50');
  if (ltv > 0.9) flags.push('ltv_over_90');
  if (ageAtMaturity > 70) flags.push('age_over_70');
  else if (ageAtMaturity > 65) flags.push('age_over_65');

  let level: Level = score >= 75 ? 'high' : score >= 55 ? 'medium' : 'low';
  // hard caps: a very heavy debt burden or a loan running past 70 years of age is rarely approved
  if (dtiBack > 0.6 || ageAtMaturity > 70) level = 'low';
  else if ((dtiBack > 0.5 || ageAtMaturity > 65) && level === 'high') level = 'medium';

  return {
    loanAmount, emi, totalPayable, totalInterest, ltv, downPct, dtiFront, dtiBack, ageAtMaturity,
    score, level, breakdown, flags,
    targetEmi40: Math.max(0, 0.4 * i.monthlyIncome - i.existingEmi),
    extraDownFor80: Math.max(0, Math.ceil(i.housePrice * 0.2 - i.downPayment))
  };
}