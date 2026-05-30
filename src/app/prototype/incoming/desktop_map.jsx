/* eslint-disable */
import * as React from 'react';
// app/desktop_map.jsx - Command Center operations map, backed by the shared store.
// Resident reports + live tasks on one DTLA map. Triage a report -> fund -> publish -> it goes live for workers.
const { useState: useStateMap } = React;

const TASK_ICON = { cleanup: 'trash', green: 'droplet', verify: 'shield-check', professional: 'wrench' };
const PAYOUT_PRESETS = [12, 16, 18, 22, 24, 30];
const BUDGET_PRESETS = [20, 30, 40, 60, 80];
const FUNDING_SOURCES = ['DTLA Cleanup Fund', 'City of LA', 'Friends of DTLA', 'Hollywood BID'];

function statusColor(status) { return (window.STATUS_CFG[status] || {}).color || '#22c55e'; }
function taskPinIcon(t) { return t.status === 'approved' ? 'check' : t.status === 'submitted' ? 'clock' : TASK_ICON[t.type] || 'map-pin'; }

// ─── Map canvas ─────────────────────────────────────────────────────────────
function MapCanvas({ tasks, reports, filter, sel, onPick }) {
  const D = window.DARK;
  const showTask = (t) => filter === 'all' ? true
    : filter === 'reports' ? false
    : filter === 'open' ? t.status === 'open'
    : filter === 'progress' ? (t.status === 'assigned' || t.status === 'in_progress')
    : filter === 'review' ? t.status === 'submitted'
    : filter === 'done' ? t.status === 'approved' : true;
  const showReports = filter === 'all' || filter === 'reports';

  return (
    <div className="relative rounded-2xl overflow-hidden h-full w-full" style={{ background: '#0e151b', border: `1px solid ${D.line}`, minHeight: 420 }}>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#0e151b" />
        {[12, 38, 64].map((y, r) => [10, 36, 62, 84].map((x, c) => (
          <rect key={`${r}-${c}`} x={x} y={y} width="18" height="18" rx="1.5" fill="rgba(255,255,255,0.022)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" />
        )))}
        {[8, 34, 60, 86].map(x => <line key={'v' + x} x1={x} y1="0" x2={x} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1.4" />)}
        {[10, 36, 62, 88].map(y => <line key={'h' + y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1.4" />)}
        <rect x="20" y="16" width="62" height="62" rx="4" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.3)" strokeWidth="0.5" strokeDasharray="2 1.5" />
      </svg>

      <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <Icon name="flag" size={11} style={{ color: D.green }} />
        <span className="text-[10px] font-bold" style={{ color: D.green }}>Broadway Block Reset - zone</span>
      </div>
      <div className="absolute" style={{ left: '46%', top: '50%', transform: 'translate(-50%,-50%)' }}>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: '#ea580c', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}><span className="text-[9px] font-black text-white">DEPOT</span></div>
      </div>

      {/* reports */}
      {showReports && reports.map(r => {
        const isSel = sel?.kind === 'report' && sel.id === r.id;
        const danger = r.safetyFlag;
        return (
          <button key={r.id} onClick={() => onPick({ kind: 'report', id: r.id })} className="absolute" style={{ left: `${r.x}%`, top: `${r.y}%`, transform: 'translate(-50%,-50%)', zIndex: isSel ? 40 : 25 }}>
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: danger ? 'rgba(248,113,113,0.4)' : 'rgba(251,191,36,0.35)', width: 34, height: 34, left: -17, top: -17 }} />
            <span className="relative flex items-center justify-center rounded-lg border-2 transition-all" style={{ width: isSel ? 34 : 28, height: isSel ? 34 : 28, background: danger ? '#f87171' : '#fbbf24', borderColor: isSel ? '#fff' : 'rgba(255,255,255,0.6)', transform: isSel ? 'scale(1.05)' : 'scale(1)', boxShadow: isSel ? '0 0 0 4px rgba(251,191,36,0.3)' : '0 2px 8px rgba(0,0,0,0.4)' }}>
              <Icon name={window.CivicStore.REPORT_KIND[r.kind]?.icon || 'alert-circle'} size={isSel ? 16 : 14} style={{ color: danger ? '#3a0a0a' : '#3a2c05' }} />
            </span>
          </button>
        );
      })}

      {/* tasks */}
      {tasks.filter(showTask).map(t => {
        const c = statusColor(t.status);
        const isSel = sel?.kind === 'task' && sel.id === t.id;
        return (
          <button key={t.id} onClick={() => onPick({ kind: 'task', id: t.id })} className="absolute" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%,-50%)', zIndex: isSel ? 40 : 30 }}>
            {t.isNew && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: `${c}55`, width: 36, height: 36, left: -18, top: -18 }} />}
            <span className="relative flex items-center justify-center rounded-full border-2 transition-all" style={{ width: isSel ? 34 : 28, height: isSel ? 34 : 28, background: c, borderColor: isSel ? '#fff' : 'rgba(255,255,255,0.7)', transform: isSel ? 'scale(1.12)' : 'scale(1)', boxShadow: isSel ? `0 0 0 4px ${c}40` : '0 2px 8px rgba(0,0,0,0.4)', opacity: t.status === 'approved' ? 0.85 : 1 }}>
              <Icon name={taskPinIcon(t)} size={isSel ? 15 : 13} style={{ color: '#06210f' }} />
            </span>
          </button>
        );
      })}

      <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(12,17,24,0.8)', border: `1px solid ${D.line}` }}>
        <div className="h-px w-8" style={{ background: D.muted }} /><span className="text-[9px] font-semibold" style={{ color: D.faint }}>0.1 mi</span>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="text-[10px] font-black uppercase tracking-widest block mb-1.5" style={{ color: window.DARK.faint }}>{label}</label>{children}</div>;
}

// ─── Create task from report (with funding gate) ────────────────────────────
function CreateTaskForm({ report, onCancel, onCreate }) {
  const D = window.DARK, kind = window.CivicStore.REPORT_KIND[report.kind];
  const suggestType = report.suggestedType === 'green' ? 'green' : report.suggestedType === 'professional' ? 'professional' : 'cleanup';
  const suggestTitle = report.kind === 'litter' ? `Clear loose trash - ${report.street}`
    : report.kind === 'graffiti' ? `Remove tags - ${report.street}`
    : report.kind === 'planter' ? `Water & refresh planters - ${report.street}`
    : `Clear & repair - ${report.street}`;
  const [title, setTitle] = useStateMap(suggestTitle);
  const [type, setType] = useStateMap(suggestType);
  const [payout, setPayout] = useStateMap(report.kind === 'planter' ? 24 : 18);
  const [budget, setBudget] = useStateMap(30);
  const [minutes, setMinutes] = useStateMap(25);
  const [tools, setTools] = useStateMap('Gloves + bags from Spring St Depot');
  const [safetyTier, setSafetyTier] = useStateMap('Beginner-safe');
  const [proof, setProof] = useStateMap(['Before photo', 'After photo', 'Bag count']);
  const [deadline, setDeadline] = useStateMap('Today, 6 PM');
  const [funding, setFunding] = useStateMap(FUNDING_SOURCES[0]);
  const PROOFS = ['Before photo', 'After photo', 'Bag count', 'Pickup photo'];
  const toggleProof = p => setProof(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <button onClick={onCancel} className="flex items-center gap-1.5 text-[11px] font-bold mb-3 hover:text-white" style={{ color: D.faint }}><Icon name="chevron-left" size={14} /> Back to report</button>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.green }}>Create task - from report</span>
        <h2 className="text-base font-black mt-1 leading-tight" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>Turn this report into paid work</h2>
        <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Icon name={kind.icon} size={13} style={{ color: D.amber }} /><span className="text-[11px]" style={{ color: '#fde68a' }}>{kind.label} - {report.street}</span>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <Field label="Task title"><input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.line}`, color: D.text }} /></Field>
        <Field label="Category">
          <div className="grid grid-cols-3 gap-2">
            {[['cleanup', 'Cleanup', 'trash'], ['green', 'Greening', 'droplet'], ['professional', 'Pro-only', 'wrench']].map(([v, l, ic]) => (
              <button key={v} onClick={() => setType(v)} className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all" style={{ background: type === v ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${type === v ? 'rgba(34,197,94,0.4)' : D.line}`, color: type === v ? D.green : D.muted }}><Icon name={ic} size={16} /><span className="text-[10px] font-bold">{l}</span></button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Worker payout">
            <div className="flex flex-wrap gap-1.5">{PAYOUT_PRESETS.map(p => (<button key={p} onClick={() => setPayout(p)} className="px-2.5 py-1.5 rounded-lg text-xs font-black" style={{ fontFamily: "'Outfit',sans-serif", background: payout === p ? D.green : 'rgba(255,255,255,0.04)', color: payout === p ? D.bg : D.muted, border: `1px solid ${payout === p ? D.green : D.line}` }}>${p}</button>))}</div>
          </Field>
          <Field label="Total budget">
            <div className="flex flex-wrap gap-1.5">{BUDGET_PRESETS.map(p => (<button key={p} onClick={() => setBudget(p)} className="px-2.5 py-1.5 rounded-lg text-xs font-black" style={{ fontFamily: "'Outfit',sans-serif", background: budget === p ? 'rgba(96,165,250,0.18)' : 'rgba(255,255,255,0.04)', color: budget === p ? D.blue : D.muted, border: `1px solid ${budget === p ? 'rgba(96,165,250,0.4)' : D.line}` }}>${p}</button>))}</div>
          </Field>
        </div>
        <Field label={`Estimated time - ${minutes} min`}><input type="range" min="5" max="90" step="5" value={minutes} onChange={e => setMinutes(+e.target.value)} className="w-full" style={{ accentColor: D.green }} /></Field>
        <Field label="Required tools"><input value={tools} onChange={e => setTools(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.line}`, color: D.text }} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Safety tier">
            <select value={safetyTier} onChange={e => setSafetyTier(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.line}`, color: D.text }}>
              {['Beginner-safe', 'Standard', 'Pro-only'].map(s => <option key={s} style={{ background: '#10181f' }}>{s}</option>)}
            </select>
          </Field>
          <Field label="Deadline"><input value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.line}`, color: D.text }} /></Field>
        </div>
        <Field label="Proof required">
          <div className="flex flex-wrap gap-2">{PROOFS.map(p => (<button key={p} onClick={() => toggleProof(p)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1" style={{ background: proof.includes(p) ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', color: proof.includes(p) ? D.green : D.muted, border: `1px solid ${proof.includes(p) ? 'rgba(34,197,94,0.35)' : D.line}` }}>{proof.includes(p) && <Icon name="check" size={11} />}{p}</button>))}</div>
        </Field>
        <Field label="Funding source - task can't go live unfunded">
          <div className="flex flex-col gap-1.5">
            {FUNDING_SOURCES.map(s => (<button key={s} onClick={() => setFunding(s)} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: funding === s ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', color: funding === s ? D.green : D.text, border: `1px solid ${funding === s ? 'rgba(34,197,94,0.35)' : D.line}` }}><span className="flex items-center gap-2"><Icon name="zap" size={12} />{s}</span>{funding === s && <Icon name="check" size={13} />}</button>))}
            <button onClick={() => setFunding(null)} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: funding === null ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.04)', color: funding === null ? D.red : D.muted, border: `1px solid ${funding === null ? 'rgba(248,113,113,0.35)' : D.line}` }}><span>Leave unfunded {'->'} Needs Funding</span>{funding === null && <Icon name="check" size={13} />}</button>
          </div>
        </Field>
      </div>
      <div className="p-5 pt-0 flex flex-col gap-2">
        <button onClick={() => onCreate({ title, type, payout, budget, minutes, tools, safetyTier, proof, deadline, fundingSource: funding })} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: funding ? D.green : '#f87171', color: D.bg }}>
          <Icon name={funding ? 'plus' : 'clock'} size={16} /> {funding ? 'Publish task to the map' : 'Save as Needs Funding'}
        </button>
        <p className="text-[10px] text-center leading-relaxed" style={{ color: D.faint }}>{funding ? `Drops an open pin at ${report.street}; nearby workers are notified.` : 'Held off the worker map until a sponsor funds it.'}</p>
      </div>
    </div>
  );
}

// ─── Report detail with admin decisions ─────────────────────────────────────
function ReportPanel({ report, onConvert, onClose, onDismiss }) {
  const D = window.DARK, kind = window.CivicStore.REPORT_KIND[report.kind];
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md" style={{ background: 'rgba(251,191,36,0.12)', color: D.amber }}>Report - awaiting triage</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5" style={{ color: D.faint }}><Icon name="x" size={16} /></button>
        </div>
        <h2 className="text-base font-black leading-tight" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>{report.what}</h2>
        <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: D.muted }}><Icon name={kind.icon} size={13} style={{ color: D.amber }} />{kind.label}</div>
      </div>

      {report.safetyFlag && (
        <div className="m-5 mb-0 rounded-xl p-3.5 flex items-start gap-2.5" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
          <Icon name="alert-triangle" size={15} style={{ color: D.red, marginTop: 1 }} />
          <div><div className="text-[12px] font-black" style={{ color: '#fca5a5' }}>Safety flag - not for general workers</div><p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: D.muted }}>Route to a professional crew or the city. Do not publish as a beginner task.</p></div>
        </div>
      )}

      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <div className="aspect-[4/3] rounded-xl flex items-center justify-center mb-3" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 8px, rgba(255,255,255,0.02) 8px 16px)', border: `1px solid ${D.line}` }}><span className="text-[10px] font-mono" style={{ color: D.faint }}>resident photo</span></div>
        <p className="text-xs leading-relaxed" style={{ color: D.text2 }}>{report.note}</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[['Location', report.street, 'map-pin'], ['Reported', report.when, 'clock'], ['Duplicate score', report.duplicate, 'layers'], ['Suggested', kind.label, 'sparkles']].map(([l, v, ic]) => (
            <div key={l} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${D.line}` }}>
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: D.faint }}><Icon name={ic} size={10} />{l}</div>
              <div className="text-xs font-semibold" style={{ color: D.text }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5">
        <window.SectionTitle>Admin decision</window.SectionTitle>
        <button onClick={onConvert} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 mb-2" style={{ background: D.green, color: D.bg }}><span>Approve as task</span><Icon name="arrow-right" size={16} /></button>
        <div className="grid grid-cols-2 gap-2">
          {[['Duplicate', 'layers'], ['Reject', 'x'], ['Needs permission', 'lock'], [report.safetyFlag ? 'Route to city' : 'Professional-only', 'wrench']].map(([l, ic]) => (
            <button key={l} onClick={() => onDismiss(l)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[11px] font-bold border transition-all hover:bg-white/5" style={{ borderColor: D.line, color: D.muted }}><Icon name={ic} size={12} />{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Task detail (live task on map) ─────────────────────────────────────────
function TaskPanel({ task, onClose, onApprove }) {
  const D = window.DARK, cfg = window.STATUS_CFG[task.status], c = cfg.color;
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md" style={{ background: `${c}22`, color: c }}>{cfg.label}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5" style={{ color: D.faint }}><Icon name="x" size={16} /></button>
        </div>
        <h2 className="text-base font-black leading-tight" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>{task.title}</h2>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: D.muted }}><Icon name="map-pin" size={12} />{task.street}</div>
        {task.fromReport && <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: 'rgba(251,191,36,0.1)', color: D.amber }}><Icon name="sparkles" size={10} /> Created from a resident report</div>}
      </div>
      <div className="p-5 border-b grid grid-cols-3 gap-3" style={{ borderColor: D.line }}>
        {[['Payout', `$${task.payout}`], ['Budget', `$${task.budget}`], ['Time', `${task.minutes}m`]].map(([l, v]) => (
          <div key={l} className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${D.line}` }}><div className="text-base font-black" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>{v}</div><div className="text-[9px] mt-0.5" style={{ color: D.faint }}>{l}</div></div>
        ))}
      </div>
      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <div className="flex flex-col gap-2.5 text-xs">
          {[['Funding source', task.fundingSource || 'Unfunded', 'zap'], ['Approved by', task.approver, 'shield-check'], ['Deadline', task.deadline, 'clock'], ['Safety tier', task.safetyTier, 'shield']].map(([l, v, ic]) => (
            <div key={l} className="flex items-center justify-between"><span className="flex items-center gap-2" style={{ color: D.faint }}><Icon name={ic} size={12} />{l}</span><span className="font-semibold" style={{ color: task.fundingSource || l !== 'Funding source' ? D.text : D.red }}>{v}</span></div>
          ))}
        </div>
      </div>
      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <window.SectionTitle>Assignment</window.SectionTitle>
        {task.worker ? (
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black" style={{ background: `${c}22`, color: c }}>{task.worker.split(' ').map(p => p[0]).join('')}</div><div><div className="text-sm font-bold" style={{ color: D.text }}>{task.worker}</div><div className="text-[11px]" style={{ color: D.faint }}>{cfg.label}</div></div></div>
        ) : <div className="flex items-center justify-between"><span className="text-xs" style={{ color: D.faint }}>Unclaimed - visible to nearby workers.</span><span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ background: `${c}22`, color: c }}>{cfg.label}</span></div>}
      </div>
      {task.status === 'submitted' && (
        <div className="p-5 border-b" style={{ borderColor: D.line }}>
          <window.SectionTitle>Proof submitted</window.SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">{['Before', 'After'].map(l => (<div key={l}><div className="aspect-[4/3] rounded-lg flex items-center justify-center" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 8px, rgba(255,255,255,0.02) 8px 16px)', border: `1px solid ${D.line}` }}><span className="text-[9px] font-mono" style={{ color: D.faint }}>{l.toLowerCase()}</span></div><div className="text-[9px] font-bold text-center uppercase mt-1" style={{ color: D.faint }}>{l}</div></div>))}</div>
          {task.bags != null && <p className="text-[11px] mb-1" style={{ color: D.muted }}><b style={{ color: D.text }}>{task.bags} bags</b> collected</p>}
          {task.notes && <p className="text-[11px] leading-relaxed" style={{ color: D.text2 }}>{task.notes}</p>}
          <button onClick={onApprove} className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: D.green, color: D.bg }}><Icon name="check" size={16} /> Approve & release ${task.payout}</button>
        </div>
      )}
      <div className="p-5"><button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border hover:bg-white/5" style={{ borderColor: D.line, color: D.muted }}>Close</button></div>
    </div>
  );
}

// ─── Browse list ────────────────────────────────────────────────────────────
function BrowseList({ tasks, reports, onPick }) {
  const D = window.DARK;
  const open = tasks.filter(t => t.status === 'open');
  const progress = tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress');
  const submitted = tasks.filter(t => t.status === 'submitted');
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
        <p className="text-xs font-bold mb-1" style={{ color: D.amber }}>{reports.length} resident reports awaiting triage</p>
        <p className="text-[11px] leading-relaxed" style={{ color: D.muted }}>Tap a pin to review a report, then approve, fund, and publish it as a paid task right where it was reported.</p>
      </div>
      {reports.length > 0 && <div className="mb-4"><window.SectionTitle>Reports to triage</window.SectionTitle>
        {reports.map(r => (<button key={r.id} onClick={() => onPick({ kind: 'report', id: r.id })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 text-left hover:bg-white/5" style={{ border: `1px solid ${r.safetyFlag ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.2)'}`, background: r.safetyFlag ? 'rgba(248,113,113,0.05)' : 'rgba(251,191,36,0.05)' }}><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: r.safetyFlag ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)', color: r.safetyFlag ? D.red : D.amber }}><Icon name={window.CivicStore.REPORT_KIND[r.kind].icon} size={14} /></div><div className="flex-1 min-w-0"><div className="text-xs font-bold truncate" style={{ color: D.text }}>{r.what}</div><div className="text-[10px]" style={{ color: D.faint }}>{r.street} - {r.when}</div></div><Icon name="chevron-right" size={14} style={{ color: r.safetyFlag ? D.red : D.amber }} /></button>))}
      </div>}
      {submitted.length > 0 && <div className="mb-4"><window.SectionTitle>Awaiting your review</window.SectionTitle>
        {submitted.map(t => (<button key={t.id} onClick={() => onPick({ kind: 'task', id: t.id })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 text-left hover:bg-white/5" style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.05)' }}><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(251,191,36,0.15)', color: D.amber }}><Icon name="clock" size={14} /></div><div className="flex-1 min-w-0"><div className="text-xs font-bold truncate" style={{ color: D.text }}>{t.title}</div><div className="text-[10px]" style={{ color: D.faint }}>{t.worker} - proof in</div></div><span className="text-xs font-black" style={{ color: D.amber, fontFamily: "'Outfit',sans-serif" }}>${t.payout}</span></button>))}
      </div>}
      <window.SectionTitle>Open tasks nearby</window.SectionTitle>
      {open.map(t => (<button key={t.id} onClick={() => onPick({ kind: 'task', id: t.id })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 text-left hover:bg-white/5" style={{ border: `1px solid ${D.line}`, background: 'rgba(255,255,255,0.03)' }}><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.12)', color: D.green }}><Icon name={TASK_ICON[t.type]} size={14} /></div><div className="flex-1 min-w-0"><div className="text-xs font-bold truncate" style={{ color: D.text }}>{t.title}</div><div className="text-[10px]" style={{ color: D.faint }}>{t.street} - {t.minutes}m</div></div><span className="text-xs font-black shrink-0" style={{ color: D.green, fontFamily: "'Outfit',sans-serif" }}>${t.payout}</span></button>))}
      {progress.length > 0 && <div className="mt-4"><window.SectionTitle>In progress</window.SectionTitle>
        {progress.map(t => (<button key={t.id} onClick={() => onPick({ kind: 'task', id: t.id })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 text-left hover:bg-white/5" style={{ border: `1px solid ${D.line}`, background: 'rgba(255,255,255,0.03)' }}><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${statusColor(t.status)}22`, color: statusColor(t.status) }}><Icon name={TASK_ICON[t.type]} size={14} /></div><div className="flex-1 min-w-0"><div className="text-xs font-bold truncate" style={{ color: D.text }}>{t.title}</div><div className="text-[10px]" style={{ color: D.faint }}>{t.worker} - {window.STATUS_CFG[t.status].label}</div></div><Icon name="chevron-right" size={14} style={{ color: D.faint }} /></button>))}
      </div>}
    </div>
  );
}

// ─── Ops map view ───────────────────────────────────────────────────────────
function MapOpsView() {
  const D = window.DARK;
  const store = window.useStore();
  const [sel, setSel] = useStateMap(null);
  const [mode, setMode] = useStateMap('browse');
  const [filter, setFilter] = useStateMap('all');
  const [toast, setToast] = useStateMap(null);

  const tasks = store.tasks, reports = store.reports;
  const selTask = sel?.kind === 'task' ? tasks.find(t => t.id === sel.id) : null;
  const selReport = sel?.kind === 'report' ? reports.find(r => r.id === sel.id) : null;
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  const pick = (s) => { setMode('browse'); setSel(s); };

  const createTask = (form) => {
    if (!selReport) return;
    const t = store.publishTaskFromReport(selReport.id, form);
    setMode('browse'); setSel(t ? { kind: 'task', id: t.id } : null);
    flash(form.fundingSource ? `Task published at ${t.street} - workers notified.` : `Saved as Needs Funding.`);
  };
  const dismiss = (label) => { if (selReport) { store.dismissReport(selReport.id); setSel(null); flash(`Report marked: ${label}.`); } };
  const approve = () => { if (selTask) { store.approveTask(selTask.id); flash(`Approved & paid $${selTask.payout}.`); } };

  const counts = {
    open: tasks.filter(t => t.status === 'open').length,
    progress: tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'submitted').length,
    done: tasks.filter(t => t.status === 'approved').length,
    reports: reports.length,
  };
  const FILTERS = [{ k: 'all', l: 'All' }, { k: 'reports', l: `Reports - ${counts.reports}` }, { k: 'open', l: `Open - ${counts.open}` }, { k: 'progress', l: `In progress - ${counts.progress}` }, { k: 'review', l: `Review - ${counts.review}` }, { k: 'done', l: `Done - ${counts.done}` }];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="flex items-start justify-between mb-3 shrink-0">
          <div>
            <h1 className="text-lg font-black tracking-tight" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>Downtown LA - Operations map</h1>
            <p className="text-xs mt-0.5" style={{ color: D.faint }}>{counts.open} open - {counts.progress} in progress - {counts.review} awaiting review - {counts.reports} reports to triage</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {[['#fbbf24', 'Report'], ['#22c55e', 'Open'], ['#a78bfa', 'Assigned'], ['#60a5fa', 'In progress'], ['#fbbf24', 'Submitted'], ['#34d399', 'Done']].map(([c, l], i) => (<div key={i} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} /><span className="text-[10px] font-medium" style={{ color: D.faint }}>{l}</span></div>))}
          </div>
        </div>
        <div className="flex gap-2 mb-3 shrink-0 flex-wrap">
          {FILTERS.map(f => (<button key={f.k} onClick={() => setFilter(f.k)} className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all" style={{ background: filter === f.k ? D.green : 'rgba(255,255,255,0.04)', color: filter === f.k ? D.bg : D.muted, border: `1px solid ${filter === f.k ? D.green : D.line}` }}>{f.l}</button>))}
        </div>
        <div className="flex-1 min-h-0"><MapCanvas tasks={tasks} reports={reports} filter={filter} sel={sel} onPick={pick} /></div>
      </main>
      <aside className="w-[360px] shrink-0 flex flex-col border-l overflow-hidden" style={{ borderColor: D.line, background: D.panel }}>
        {mode === 'create' && selReport ? <CreateTaskForm report={selReport} onCancel={() => setMode('browse')} onCreate={createTask} />
          : selReport ? <ReportPanel report={selReport} onConvert={() => setMode('create')} onClose={() => setSel(null)} onDismiss={dismiss} />
            : selTask ? <TaskPanel task={selTask} onClose={() => setSel(null)} onApprove={approve} />
              : <BrowseList tasks={tasks} reports={reports} onPick={pick} />}
      </aside>
      {toast && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-bold z-50 flex items-center gap-2" style={{ background: D.green, color: D.bg, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}><Icon name="check" size={16} /> {toast}</div>}
    </div>
  );
}

Object.assign(window, { MapOpsView, CreateTaskForm, ReportPanel, TaskPanel, statusColor, TASK_ICON });
