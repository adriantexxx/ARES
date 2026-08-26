import type { Answer, Cause, Evidence, RiskLevel } from '../types'
export type BootLoopAnswers = Partial<Record<'afterUpdate'|'showsLogo'|'getsHot'|'recoveryMode'|'securityMessage', Answer>>
type Question = { id: keyof Required<BootLoopAnswers>; prompt: string; helper: string }
const questions: Question[] = [
  { id:'afterUpdate', prompt:'Did this restart loop begin during or right after a software update?', helper:'This separates update failures from likely power or hardware causes.' },
  { id:'showsLogo', prompt:'Does the Samsung logo appear before the phone restarts?', helper:'This indicates how far the device gets through startup.' },
  { id:'getsHot', prompt:'Does the device become unusually hot during the restart cycle?', helper:'Heat changes which recovery actions are safe.' },
  { id:'recoveryMode', prompt:'Can it enter Recovery Mode and stay there without restarting?', helper:'Connect USB, then use the Recovery Mode keys for the exact model. Do not select a wipe/reset option.' },
  { id:'securityMessage', prompt:'Do you see a Knox Guard, FRP, or “managed by organisation” message?', helper:'ARES will offer only legitimate support routes for account or management restrictions.' },
]
export const getNextQuestion = (a: BootLoopAnswers) => questions.find(q => a[q.id] === undefined)
const yes = (v: Answer | undefined) => v === true
const known = (v: Answer | undefined) => v !== undefined && v !== 'unknown'
export function diagnoseBootLoop(a: BootLoopAnswers) {
  let software=34, update=18, power=13, storage=8, hardware=7
  const evidence: Evidence[]=[]; const add=(id:string,statement:string,kind:Evidence['kind']='user_claim')=>evidence.push({id,statement,kind,source:kind==='inference'?'engine':'user'})
  if(yes(a.afterUpdate)){update+=24;software+=13;add('after-update','The restart loop began immediately after an update.')} else if(a.afterUpdate===false){power+=5;hardware+=4;add('not-after-update','The problem did not begin after an update.')}
  if(yes(a.showsLogo)){software+=10;update+=4;add('logo','Samsung logo appears before restart.','fact')} else if(a.showsLogo===false){power+=11;hardware+=8;add('no-logo','Samsung logo does not appear before restart.')}
  if(yes(a.getsHot)){power+=24;hardware+=14;software-=4;add('heat','The device becomes unusually hot during the restart cycle.')} else if(a.getsHot===false){software+=4;update+=3;add('no-heat','No unusual heat is reported.')}
  if(yes(a.recoveryMode)){software+=12;update+=7;power-=3;add('recovery-stable','Recovery Mode remains stable.','fact')} else if(a.recoveryMode===false){power+=9;hardware+=8;add('recovery-unstable','Recovery Mode cannot be reached or stay stable.')}
  if(yes(a.securityMessage)) add('security','A security or management message is present.')
  const raw=[['software','Software / system corruption',software],['update','Failed software update',update],['power','Battery or power issue',power],['storage','Storage failure',storage],['hardware','Other hardware issue',hardware]] as const
  const total=raw.reduce((s,x)=>s+Math.max(1,x[2]),0); const causes:Cause[]=raw.map(x=>({id:x[0],label:x[1],probability:Math.round(Math.max(1,x[2])/total*100)})).sort((x,y)=>y.probability-x.probability); causes[0].probability+=100-causes.reduce((s,x)=>s+x.probability,0)
  const answered=questions.filter(q=>known(a[q.id])).length; const confidence=Math.min(94,31+answered*12+(yes(a.afterUpdate)?8:0)+(yes(a.recoveryMode)?8:0)); const service=yes(a.getsHot)||a.recoveryMode===false; const security=yes(a.securityMessage); const risk:RiskLevel=service?'service_required':security?'medium':answered>=3?'low':'safe'
  const action=service ? { title:'Pause recovery attempts and arrange a hardware assessment', description:'Restarting with heat or unstable Recovery Mode can indicate battery, power or board-level trouble.', steps:['Disconnect charging accessories if the device is hot.','Let it cool on a non-flammable surface.','Do not flash firmware or factory-reset it yet.','Use an authorised Samsung service provider or qualified repair centre.'], warning:'Do not open the device or replace the battery unless qualified.' } : security ? { title:'Identify the managing party before recovery', description:'A security-management notice can restrict normal recovery tools.', steps:['Photograph the exact message and reference number.','Contact the carrier, retailer, finance provider or organisation named.','Use Samsung-supported service if no managing party is identified.','Do not use bypass tools or modified firmware.'], warning:'ARES never provides Knox Guard, FRP or MDM bypasses.' } : { title:'Inspect Recovery Mode without erasing data', description:'The evidence supports a software-first path. Start with observation before any reset.', steps:['Ensure the phone has charge and disconnect accessories.','Enter Recovery Mode with the correct model instructions.','Confirm it stays stable; do not choose Wipe data/factory reset.','Record any error text, then return for the next guided step.'], warning:'A factory reset or some firmware recovery methods can permanently erase data.' }
  return { causes, evidence, primary:causes[0], confidence, confidenceLabel:confidence>=75?'High':confidence>=55?'Medium':'Preliminary', progress:Math.round(answered/questions.length*100), risk, action }
}
