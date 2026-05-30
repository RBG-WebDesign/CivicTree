/* eslint-disable */
import * as React from 'react';
// app/desktop_admin.jsx - Reports Queue, Task Pipeline, store-backed Review
const { useState: useStateAdm } = React;

// ─── NEW REPORTS QUEUE ──────────────────────────────────────────────────────
function ReportsQueueView() {
  const D = window.DARK;
  const store = window.useStore();
  const [sel, setSel] = useStateAdm(null);
  const [mode, setMode] = useStateAdm('detail'); // detail | create
  const [toast, setToast] = useStateAdm(null);
  const reports = store.reports;
  const selReport = reports.find(r => r.id === sel) || null;
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const create = (form) => { const t = store.publishTaskFromReport(selReport.id, form); setSel(null); setMode('detail'); flash(form.fundingSource ? 'Task published to the worker map.' : 'Saved as Needs Funding.'); };
  const dismiss = (label) => { store.dismissReport(selReport.id); setSel(null); flash(`Report marked: ${label}.`); };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">
        <window.PageHead kicker={`${reports.length} new - awaiting triage`} title="Reports Queue" sub="Residents and crews submit issues. Approve the real ones into funded tasks; the rest get dismissed cleanly." />
        {reports.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: D.panel, border: `1px solid ${D.line}` }}>
            <Icon name="check" size={28} style={{ color: D.green, margin: '0 auto' }} />
            <p className="text-sm font-bold mt-3" style={{ color: D.text }}>Queue clear. Every report has been triaged.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 760 }}>
            {reports.map(r => {
              const kind = store.REPORT_KIND[r.kind];
              return (
                <button key={r.id} onClick={() => { setSel(r.id); setMode('detail'); }} className="text-left rounded-2xl overflow-hidden transition-all" style={{ background: sel === r.id ? 'rgba(34,197,94,0.06)' : D.panel, border: `1px solid ${sel === r.id ? 'rgba(34,197,94,0.3)' : r.safetyFlag ? 'rgba(248,113,113,0.3)' : D.line}` }}>
                  <div className="aspect-[16/9] flex items-center justify-center relative" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 8px, rgba(255,255,255,0.02) 8px 16px)' }}>
                    <span className="text-[10px] font-mono" style={{ color: D.faint }}>resident photo</span>
                    {r.safetyFlag && <span className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-md" style={{ background: 'rgba(248,113,113,0.2)', color: '#fca5a5' }}><Icon name="alert-triangle" size={10} /> SAFETY</span>}
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center gap-2 mb-1.5"><div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)', color: D.amber }}><Icon name={kind.icon} size={12} /></div><span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: D.amber }}>{kind.label}</span></div>
                    <div className="text-sm font-bold leading-tight mb-1" style={{ color: D.text }}>{r.what}</div>
                    <div className="text-[11px] mb-2" style={{ color: D.faint }}>{r.street} - {r.when}</div>
                    <div className="flex items-center gap-3 text-[10px]" style={{ color: D.faint }}>
                      <span>Dup: <b style={{ color: D.text }}>{r.duplicate}</b></span>
                      <span>Suggest: <b style={{ color: D.text }}>{store.REPORT_KIND[r.suggestedType]?.label || (r.suggestedType === 'green' ? 'Greening' : r.suggestedType === 'professional' ? 'Pro-only' : 'Cleanup')}</b></span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {selReport && (
        <aside className="w-[360px] shrink-0 flex flex-col border-l overflow-hidden" style={{ borderColor: D.line, background: D.panel }}>
          {mode === 'create'
            ? <window.CreateTaskForm report={selReport} onCancel={() => setMode('detail')} onCreate={create} />
            : <window.ReportPanel report={selReport} onConvert={() => setMode('create')} onClose={() => setSel(null)} onDismiss={dismiss} />}
        </aside>
      )}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-bold z-50 flex items-center gap-2" style={{ background: D.green, color: D.bg, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}><Icon name="check" size={16} /> {toast}</div>}
    </div>
  );
}

// ─── TASK PIPELINE (kanban by status) ───────────────────────────────────────
function PipelineView() {
  const D = window.DARK;
  const store = window.useStore();
  const [toast, setToast] = useStateAdm(null);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const COLS = [
    { k: 'needs-funding', l: 'Needs Funding' }, { k: 'open', l: 'Open' }, { k: 'assigned', l: 'Assigned' },
    { k: 'in_progress', l: 'In Progress' }, { k: 'submitted', l: 'Submitted' }, { k: 'approved', l: 'Approved - Paid' },
  ];
  return (
    <div className="h-full flex flex-col overflow-hidden p-8">
      <window.PageHead kicker="Every task, every state" title="Task Pipeline" sub="Reported -> funded -> open -> assigned -> in progress -> submitted -> approved & paid. Drag-free, just the live state of the system." />
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full" style={{ minWidth: 1180 }}>
          {COLS.map(col => {
            const items = store.tasks.filter(t => t.status === col.k);
            const c = window.STATUS_CFG[col.k].color;
            return (
              <div key={col.k} className="flex flex-col rounded-2xl" style={{ width: 200, background: D.panel, border: `1px solid ${D.line}` }}>
                <div className="flex items-center justify-between px-3.5 py-3 border-b" style={{ borderColor: D.line }}>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: c }} /><span className="text-[11px] font-black uppercase tracking-wider" style={{ color: D.text }}>{col.l}</span></div>
                  <span className="text-[11px] font-bold" style={{ color: D.faint }}>{items.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
                  {items.length === 0 && <div className="text-[10px] text-center py-6" style={{ color: D.faint }}>-</div>}
                  {items.map(t => (
                    <div key={t.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${D.line}` }}>
                      <div className="text-[11px] font-bold leading-snug mb-1.5" style={{ color: D.text }}>{t.title}</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px]" style={{ color: D.faint }}>{t.street}</span>
                        <span className="text-[11px] font-black" style={{ color: c, fontFamily: "'Outfit',sans-serif" }}>${t.payout}</span>
                      </div>
                      {t.worker && <div className="text-[10px] mb-2" style={{ color: D.faint }}>👷 {t.worker}</div>}
                      {col.k === 'needs-funding' && <button onClick={() => { store.fundTask(t.id, 'DTLA Cleanup Fund'); flash('Funded - task is live.'); }} className="w-full py-1.5 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: D.green }}>Fund & publish</button>}
                      {col.k === 'submitted' && <button onClick={() => { store.approveTask(t.id); flash(`Approved & paid $${t.payout}.`); }} className="w-full py-1.5 rounded-lg text-[10px] font-bold" style={{ background: D.green, color: D.bg }}>Approve & pay</button>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-bold z-50 flex items-center gap-2" style={{ background: D.green, color: D.bg, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}><Icon name="check" size={16} /> {toast}</div>}
    </div>
  );
}

// ─── STORE-BACKED REVIEW (overrides the static one) ─────────────────────────
function ReviewView() {
  const D = window.DARK;
  const store = window.useStore();
  const queue = store.tasks.filter(t => t.status === 'submitted');
  const [selId, setSelId] = useStateAdm(null);
  const [toast, setToast] = useStateAdm(null);
  const sel = queue.find(t => t.id === selId) || queue[0] || null;
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-8">
        <window.PageHead kicker={`${queue.length} awaiting review`} title="Task Review" sub="Compare before & after, then approve to release payment or send it back for more proof." />
        {queue.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: D.panel, border: `1px solid ${D.line}` }}>
            <Icon name="check" size={28} style={{ color: D.green, margin: '0 auto' }} />
            <p className="text-sm font-bold mt-3" style={{ color: D.text }}>Queue clear. Nothing waiting on you.</p>
            <p className="text-xs mt-1" style={{ color: D.muted }}>New submissions appear here as workers finish tasks.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-w-[640px]">
            {queue.map(q => (
              <button key={q.id} onClick={() => setSelId(q.id)} className="text-left rounded-2xl p-4 flex items-center gap-4 transition-all" style={{ background: sel?.id === q.id ? 'rgba(34,197,94,0.07)' : D.panel, border: `1px solid ${sel?.id === q.id ? 'rgba(34,197,94,0.3)' : D.line}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: D.muted }}><Icon name="image" size={18} /></div>
                <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate" style={{ color: D.text }}>{q.title}</div><div className="text-[11px]" style={{ color: D.faint }}>{q.worker} - {q.neighborhood} - {q.bags != null ? `${q.bags} bags` : 'proof in'}</div></div>
                <div className="text-right shrink-0"><div className="text-sm font-black" style={{ color: D.green, fontFamily: "'Outfit',sans-serif" }}>${q.payout}</div><div className="text-[10px]" style={{ color: D.faint }}>{q.fromReport ? 'from report' : 'scheduled'}</div></div>
              </button>
            ))}
          </div>
        )}
      </div>
      {sel && (
        <aside className="w-[380px] shrink-0 border-l overflow-y-auto" style={{ borderColor: D.line, background: D.panel }}>
          <div className="p-5 border-b" style={{ borderColor: D.line }}>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.green }}>Submission detail</span>
            <h3 className="text-base font-black mt-1" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>{sel.title}</h3>
            <p className="text-xs mt-1" style={{ color: D.muted }}>{sel.worker} - {sel.street}</p>
          </div>
          <div className="p-5 border-b" style={{ borderColor: D.line }}>
            <div className="grid grid-cols-2 gap-3">{['Before', 'After'].map(lbl => (<div key={lbl}><div className="aspect-[4/3] rounded-xl flex items-center justify-center mb-1.5" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 8px, rgba(255,255,255,0.02) 8px 16px)', border: `1px solid ${D.line}` }}><span className="text-[10px] font-mono" style={{ color: D.faint }}>{lbl.toLowerCase()} photo</span></div><div className="text-[10px] font-bold text-center uppercase tracking-wider" style={{ color: D.faint }}>{lbl}</div></div>))}</div>
          </div>
          <div className="p-5 border-b" style={{ borderColor: D.line }}>
            <window.SectionTitle>Worker notes</window.SectionTitle>
            <p className="text-xs leading-relaxed" style={{ color: D.text2 }}>{sel.notes || 'No notes added.'}</p>
            <div className="grid grid-cols-3 gap-2 mt-4">{[['Payout', `$${sel.payout}`], ['Bags', sel.bags != null ? sel.bags : '-'], ['Time', `${sel.minutes}m`]].map(([l, v]) => (<div key={l} className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${D.line}` }}><div className="text-sm font-black" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>{v}</div><div className="text-[9px]" style={{ color: D.faint }}>{l}</div></div>))}</div>
          </div>
          <div className="p-5 flex flex-col gap-2">
            <button onClick={() => { store.approveTask(sel.id); setSelId(null); flash(`Approved - $${sel.payout} released to ${sel.worker}.`); }} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90" style={{ background: D.green, color: D.bg }}><Icon name="check" size={16} /> Approve & release ${sel.payout}</button>
            <button onClick={() => { store.rejectTask(sel.id); setSelId(null); flash('Sent back - task reopened for more proof.'); }} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border hover:bg-white/5" style={{ borderColor: D.line, color: D.muted }}>Request more proof</button>
          </div>
        </aside>
      )}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-bold z-50 flex items-center gap-2" style={{ background: D.green, color: D.bg, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}><Icon name="check" size={16} /> {toast}</div>}
    </div>
  );
}

Object.assign(window, { ReportsQueueView, PipelineView, ReviewView });
