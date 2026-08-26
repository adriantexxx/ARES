export type ServicePlan = { id: 'diagnosis' | 'priority'; name: string; price: string; description: string; envKey: 'VITE_PAYMENT_LINK_DIAGNOSIS' | 'VITE_PAYMENT_LINK_PRIORITY' }
export const plans: ServicePlan[] = [
  { id: 'diagnosis', name: 'ARES Expert Diagnosis', price: 'Set your price', description: 'A technician reviews the evidence and provides an evidence-based recovery plan.', envKey: 'VITE_PAYMENT_LINK_DIAGNOSIS' },
  { id: 'priority', name: 'ARES Priority Recovery', price: 'Set your price', description: 'Priority remote guidance and an escalated service case where technically appropriate.', envKey: 'VITE_PAYMENT_LINK_PRIORITY' },
]
export function paymentUrl(plan: ServicePlan, reference: string): string | null {
  const raw = import.meta.env[plan.envKey]
  if (!raw) return null
  try { const url = new URL(raw); if (url.protocol !== 'https:') return null; url.searchParams.set('client_reference_id', reference); return url.toString() } catch { return null }
}
