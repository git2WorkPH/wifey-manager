import { z } from 'zod';
const cents = z.number().int().min(0).max(1_000_000_000);
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const base = { id: z.string().uuid(), revision: z.number().int().nonnegative() };
export const recordSchema = z.discriminatedUnion('kind', [
  z.object({ ...base, kind: z.literal('category'), name: z.string().trim().min(1).max(80), archived: z.boolean() }),
  z.object({ ...base, kind: z.literal('budget'), month: monthSchema, categoryId: z.string().uuid(), label: z.string().min(1).max(80), amount: cents }),
  z.object({ ...base, kind: z.literal('income'), month: monthSchema, date: z.iso.date(), amount: cents.positive(), note: z.string().max(200) }),
  z.object({ ...base, kind: z.literal('expense'), month: monthSchema, categoryId: z.string().uuid(), date: z.iso.date(), amount: cents.positive(), note: z.string().max(200), voided: z.boolean() })
]);
export type LedgerRecord = z.infer<typeof recordSchema>;
export const mutationSchema = z.object({ operationId: z.string().uuid(), record: recordSchema });
export type Mutation = z.infer<typeof mutationSchema>;
export function parseMoney(value: string): number {
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(value.trim())) throw new Error('Enter an amount with up to two decimal places.');
  const [whole, fraction = ''] = value.trim().split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (result > 1_000_000_000) throw new Error('Amount is too large.');
  return result;
}
export function totals(records: LedgerRecord[], month: string) {
  const current = records.filter(r => 'month' in r && r.month === month);
  const income = current.reduce((n, r) => n + (r.kind === 'income' ? r.amount : 0), 0);
  const allocated = current.reduce((n, r) => n + (r.kind === 'budget' ? r.amount : 0), 0);
  const spent = current.reduce((n, r) => n + (r.kind === 'expense' && !r.voided ? r.amount : 0), 0);
  return { income, allocated, spent, unallocated: income - allocated, remaining: allocated - spent };
}
export function monthOffset(month: string, offset: number) {
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 1 + offset, 1));
  return date.toISOString().slice(0, 7);
}
export function recentRecords(records: LedgerRecord[], current: string) {
  return records.filter(r => r.kind === 'category' || ('month' in r && r.month >= monthOffset(current, -2)));
}
