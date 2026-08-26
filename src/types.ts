export type RiskLevel = 'safe' | 'low' | 'medium' | 'service_required'
export type Answer = boolean | 'unknown'
export interface Evidence { id: string; statement: string; kind: 'fact' | 'user_claim' | 'inference'; source: 'user' | 'engine' | 'device' }
export interface DiagnosticSession { id: string; flowId: string; status: 'active' | 'completed'; device: { manufacturer: string; model: string }; answers: Record<string, Answer>; evidence: Evidence[]; createdAt: string; updatedAt: string }
export interface Cause { id: string; label: string; probability: number }
