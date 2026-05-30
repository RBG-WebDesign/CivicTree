/* eslint-disable */
import * as React from 'react';
// app/desktop_views.jsx - dark command-center helpers + full-page views
const { useState } = React;

// ─── Shared dark-theme helpers ──────────────────────────────────────────────
const DARK = {
  bg: '#0c1118', panel: '#10181f', panel2: 'rgba(255,255,255,0.03)',
  text: '#e6edf3', text2: '#c9d1d9', muted: '#7d8fa1', faint: '#4a6278',
  line: 'rgba(255,255,255,0.07)', green: '#22c55e', green2: '#34d399',
  amber: '#fbbf24', red: '#f87171', blue: '#60a5fa',
};

function DProgress({ value, color, height = 5, track = 'rgba(255,255,255,0.08)' }) {
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }} />
    </div>
  );
}

function RankMedal({ rank }) {
  const top = rank === 1;
  return (
    <div className="shrink-0 flex items-center justify-center" style={{
      width: 26, height: 26, borderRadius: 999, fontSize: 11, fontWeight: 900,
      fontFamily: "'Outfit',sans-serif",
      background: top ? DARK.amber : 'rgba(255,255,255,0.08)',
      color: top ? DARK.bg : DARK.muted,
    }}>{rank}</div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: DARK.faint }}>{children}</p>
      {right}
    </div>
  );
}

function PageHead({ kicker, title, sub }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1.5" style={{ color: DARK.green }}>{kicker}</p>
      <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Outfit',sans-serif", color: DARK.text }}>{title}</h1>
      {sub && <p className="text-sm mt-1" style={{ color: DARK.muted }}>{sub}</p>}
    </div>
  );
}

// ─── LEADERBOARDS PAGE ──────────────────────────────────────────────────────
function LeaderboardsView() {
  const board = [
    { key: 'workers', label: 'Top stewards this week' },
    { key: 'crews', label: 'Top crews' },
    { key: 'hoods', label: 'Top neighborhoods' },
    { key: 'improved', label: 'Most improved blocks' },
  ];
  const [tab, setTab] = useState('workers');

  return (
    <div className="p-8 max-w-[1100px]">
      <PageHead kicker="Recognition - This week" title="Leaderboards" sub="Civic progress, celebrated. Rankings reset every Monday - they lift people up, never shame them." />

      <div className="flex gap-2 mb-6 flex-wrap">
        {board.map(b => (
          <button key={b.key} onClick={() => setTab(b.key)}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all"
            style={{
              background: tab === b.key ? DARK.green : 'rgba(255,255,255,0.04)',
              color: tab === b.key ? DARK.bg : DARK.muted,
              border: `1px solid ${tab === b.key ? DARK.green : DARK.line}`,
            }}>{b.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main board */}
        <div className="col-span-2 rounded-2xl p-5" style={{ background: DARK.panel, border: `1px solid ${DARK.line}` }}>
          {tab === 'workers' && (
            <div className="flex flex-col gap-2">
              {window.LEADERBOARD_WORKERS.map(w => (
                <div key={w.rank} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{ background: w.rank === 1 ? 'rgba(251,191,36,0.08)' : DARK.panel2, border: `1px solid ${w.rank === 1 ? 'rgba(251,191,36,0.2)' : DARK.line}` }}>
                  <RankMedal rank={w.rank} />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: 'rgba(34,197,94,0.15)', color: DARK.green }}>
                    {w.name.split(' ').map(p => p[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold" style={{ color: DARK.text }}>{w.name}</div>
                    <div className="text-[11px]" style={{ color: DARK.faint }}>{w.neighborhood} - {w.tasks} tasks completed</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black" style={{ color: DARK.green, fontFamily: "'Outfit',sans-serif" }}>${w.earned.toLocaleString()}</div>
                    <div className="text-[10px]" style={{ color: DARK.faint }}>{w.quality}% quality</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'crews' && (
            <div className="flex flex-col gap-2">
              {window.LEADERBOARD_CREWS.map(c => (
                <div key={c.rank} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: c.rank === 1 ? 'rgba(251,191,36,0.08)' : DARK.panel2, border: `1px solid ${c.rank === 1 ? 'rgba(251,191,36,0.2)' : DARK.line}` }}>
                  <RankMedal rank={c.rank} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold" style={{ color: DARK.text }}>{c.name}</div>
                    <div className="text-[11px]" style={{ color: DARK.faint }}>{c.neighborhood} - {c.members} members</div>
                  </div>
                  <div className="text-sm font-black" style={{ color: DARK.green2, fontFamily: "'Outfit',sans-serif" }}>{c.tasks}<span className="text-[10px] font-bold" style={{ color: DARK.faint }}> tasks</span></div>
                </div>
              ))}
            </div>
          )}
          {tab === 'hoods' && (
            <div className="flex flex-col gap-2">
              {window.LEADERBOARD_NEIGHBORHOODS.map(n => (
                <div key={n.rank} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: n.rank === 1 ? 'rgba(251,191,36,0.08)' : DARK.panel2, border: `1px solid ${n.rank === 1 ? 'rgba(251,191,36,0.2)' : DARK.line}` }}>
                  <RankMedal rank={n.rank} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold" style={{ color: DARK.text }}>{n.name}</div>
                    <div className="text-[11px]" style={{ color: DARK.faint }}>Level {n.level} - ${n.paid.toLocaleString()} paid to workers</div>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: window.STATE_CONFIG[n.state].bg, color: window.STATE_CONFIG[n.state].text }}>
                    {window.STATE_CONFIG[n.state].label}
                  </span>
                  <div className="text-sm font-black w-14 text-right" style={{ color: DARK.text, fontFamily: "'Outfit',sans-serif" }}>{n.tasks}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 'improved' && (
            <div className="flex flex-col gap-2">
              {window.MOST_IMPROVED.map(m => (
                <div key={m.rank} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: m.rank === 1 ? 'rgba(52,211,153,0.08)' : DARK.panel2, border: `1px solid ${m.rank === 1 ? 'rgba(52,211,153,0.2)' : DARK.line}` }}>
                  <RankMedal rank={m.rank} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold" style={{ color: DARK.text }}>{m.name}</div>
                    <div className="text-[11px]" style={{ color: DARK.faint }}>{m.detail}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="trending-up" size={14} style={{ color: DARK.green2 }} />
                    <span className="text-sm font-black" style={{ color: DARK.green2, fontFamily: "'Outfit',sans-serif" }}>{m.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side honors */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(160deg, rgba(251,191,36,0.12), rgba(255,255,255,0.02))', border: '1px solid rgba(251,191,36,0.25)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="crown" size={16} style={{ color: DARK.amber }} />
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: DARK.amber }}>Steward of the week</span>
            </div>
            <div className="text-lg font-black" style={{ fontFamily: "'Outfit',sans-serif", color: DARK.text }}>Maria R.</div>
            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: DARK.muted }}>47 verified tasks across Venice at 99% quality. Leading the Boardwalk Brigade to Level 4.</p>
          </div>
          {[
            { icon: 'check-square', label: 'Most tasks completed', who: 'Maria R.', val: '47' },
            { icon: 'shield-check', label: 'Most reports verified', who: 'Carlos T.', val: '31' },
            { icon: 'dollar-sign', label: 'Most dollars earned', who: 'Maria R.', val: '$1,240' },
            { icon: 'star', label: 'Highest quality score', who: 'Maria R.', val: '99%' },
          ].map(h => (
            <div key={h.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: DARK.panel, border: `1px solid ${DARK.line}` }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.1)', color: DARK.green }}>
                <Icon name={h.icon} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: DARK.faint }}>{h.label}</div>
                <div className="text-xs font-bold" style={{ color: DARK.text }}>{h.who}</div>
              </div>
              <div className="text-sm font-black" style={{ color: DARK.green, fontFamily: "'Outfit',sans-serif" }}>{h.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CAMPAIGNS PAGE ─────────────────────────────────────────────────────────
function CampaignsView() {
  return (
    <div className="p-8 max-w-[1100px]">
      <PageHead kicker="Coordinated block resets" title="Campaign Dashboard" sub="Funded pushes to level up specific blocks. Sponsors back them; crews complete them." />
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: 'Active campaigns', value: '5', icon: 'flag', color: DARK.green },
          { label: 'Tasks remaining', value: '280', icon: 'target', color: DARK.amber },
          { label: 'Funding secured', value: '$13.2k', icon: 'zap', color: DARK.green2 },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: DARK.panel, border: `1px solid ${DARK.line}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: DARK.faint }}>{s.label}</span>
              <Icon name={s.icon} size={16} style={{ color: s.color }} />
            </div>
            <div className="text-3xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {window.ACTIVE_CAMPAIGNS.map(c => {
          const fundPct = Math.round((c.raised / c.goal) * 100);
          return (
            <div key={c.name} className="rounded-2xl p-6" style={{ background: DARK.panel, border: `1px solid ${DARK.line}` }}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.progress > 50 ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)' }}>
                    <Icon name="flag" size={18} style={{ color: c.progress > 50 ? DARK.green : DARK.amber }} />
                  </div>
                  <div>
                    <div className="text-base font-black" style={{ fontFamily: "'Outfit',sans-serif", color: DARK.text }}>{c.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: DARK.muted }}>{c.neighborhood} - {c.tasksDone} done - {c.tasksLeft} tasks left</div>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{
                  background: c.funded ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: c.funded ? DARK.green : DARK.red,
                }}>{c.funded ? `Funded by ${c.sponsor}` : 'Needs sponsor funding'}</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span style={{ color: DARK.muted }}>Task progress</span>
                    <span className="font-bold" style={{ color: c.progress > 50 ? DARK.green : DARK.amber }}>{c.progress}% complete</span>
                  </div>
                  <DProgress value={c.progress} color={c.progress > 50 ? DARK.green : DARK.amber} />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span style={{ color: DARK.muted }}>Funding</span>
                    <span className="font-bold" style={{ color: DARK.green2 }}>${c.raised.toLocaleString()} / ${c.goal.toLocaleString()}</span>
                  </div>
                  <DProgress value={fundPct} color={DARK.green2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SPONSOR VIEW ───────────────────────────────────────────────────────────
function SponsorView() {
  const needy = window.NEIGHBORHOODS.filter(n => !n.sponsor).sort((a, b) => (b.openTasks + b.reports) - (a.openTasks + a.reports));
  return (
    <div className="p-8 max-w-[1100px]">
      <PageHead kicker="For sponsors & cities" title="Sponsor a neighborhood" sub="Fund verified civic work where it's needed most. Every dollar goes to a resident completing a real task." />

      <div className="rounded-2xl p-7 mb-7" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(16,24,31,0.4))', border: '1px solid rgba(34,197,94,0.25)' }}>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Your sponsored zones', value: '3' },
            { label: 'Tasks funded YTD', value: '412' },
            { label: 'Paid to residents', value: '$10,280' },
            { label: 'Blocks improved', value: '38' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color: DARK.green }}>{s.value}</div>
              <div className="text-[11px] mt-1" style={{ color: DARK.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>Zones needing a sponsor</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {needy.map(n => (
          <div key={n.id} className="rounded-2xl p-5" style={{ background: DARK.panel, border: `1px solid ${DARK.line}` }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-black" style={{ fontFamily: "'Outfit',sans-serif", color: DARK.text }}>{n.name}</div>
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: window.STATE_CONFIG[n.state].text }}>Level {n.level} - {window.STATE_CONFIG[n.state].label}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: DARK.red }}>{n.reports} reports waiting</span>
            </div>
            <p className="text-[11px] leading-relaxed mb-4" style={{ color: DARK.muted }}>{n.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-[11px]" style={{ color: DARK.faint }}>
                <span><b style={{ color: DARK.amber }}>{n.openTasks}</b> open tasks</span>
                <span><b style={{ color: DARK.text }}>${n.dollarsPaid.toLocaleString()}</b> paid so far</span>
              </div>
              <button className="text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all hover:opacity-90" style={{ background: DARK.amber, color: DARK.bg }}>
                <Icon name="zap" size={13} /> Fund this zone
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN REVIEW VIEW ──────────────────────────────────────────────────────
function ReviewView() {
  const [queue, setQueue] = useState(window.REVIEW_QUEUE);
  const [sel, setSel] = useState(window.REVIEW_QUEUE[0]);
  const [toast, setToast] = useState(null);

  const act = (decision) => {
    if (!sel) return;
    setToast(`${decision === 'approve' ? 'Approved' : 'Sent back'}: ${sel.task} - ${sel.worker}`);
    const rest = queue.filter(q => q.id !== sel.id);
    setQueue(rest);
    setSel(rest[0] || null);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-8">
        <PageHead kicker={`${queue.length} awaiting review`} title="Review Queue" sub="Approve verified work to release payment, or send it back with a note. Most reviews take under a minute." />
        {queue.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: DARK.panel, border: `1px solid ${DARK.line}` }}>
            <Icon name="check" size={28} style={{ color: DARK.green, margin: '0 auto' }} />
            <p className="text-sm font-bold mt-3" style={{ color: DARK.text }}>Queue clear. Nice work.</p>
            <p className="text-xs mt-1" style={{ color: DARK.muted }}>New submissions will appear here as workers finish tasks.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-w-[640px]">
            {queue.map(q => (
              <button key={q.id} onClick={() => setSel(q)}
                className="text-left rounded-2xl p-4 flex items-center gap-4 transition-all"
                style={{ background: sel?.id === q.id ? 'rgba(34,197,94,0.07)' : DARK.panel, border: `1px solid ${sel?.id === q.id ? 'rgba(34,197,94,0.3)' : DARK.line}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: DARK.muted }}>
                  <Icon name="image" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: DARK.text }}>{q.task}</div>
                  <div className="text-[11px]" style={{ color: DARK.faint }}>{q.worker} - {q.neighborhood} - {q.submitted}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black" style={{ color: DARK.green, fontFamily: "'Outfit',sans-serif" }}>${q.payout}</div>
                  <div className="text-[10px]" style={{ color: DARK.faint }}>{q.quality}% quality</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      {sel && (
        <aside className="w-[380px] shrink-0 border-l overflow-y-auto" style={{ borderColor: DARK.line, background: DARK.panel }}>
          <div className="p-5 border-b" style={{ borderColor: DARK.line }}>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: DARK.green }}>Submission detail</span>
            <h3 className="text-base font-black mt-1" style={{ fontFamily: "'Outfit',sans-serif", color: DARK.text }}>{sel.task}</h3>
            <p className="text-xs mt-1" style={{ color: DARK.muted }}>{sel.worker} - {sel.neighborhood}</p>
          </div>
          {/* Before / after placeholders */}
          <div className="p-5 border-b" style={{ borderColor: DARK.line }}>
            <div className="grid grid-cols-2 gap-3">
              {['Before', 'After'].map(lbl => (
                <div key={lbl}>
                  <div className="aspect-[4/3] rounded-xl flex items-center justify-center mb-1.5" style={{
                    background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 8px, rgba(255,255,255,0.02) 8px 16px)',
                    border: `1px solid ${DARK.line}`,
                  }}>
                    <span className="text-[10px] font-mono" style={{ color: DARK.faint }}>{lbl.toLowerCase()} photo</span>
                  </div>
                  <div className="text-[10px] font-bold text-center uppercase tracking-wider" style={{ color: DARK.faint }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 border-b" style={{ borderColor: DARK.line }}>
            <SectionTitle>Worker notes</SectionTitle>
            <p className="text-xs leading-relaxed" style={{ color: DARK.text2 }}>{sel.notes}</p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[{ l: 'Payout', v: `$${sel.payout}` }, { l: 'Time', v: `${sel.minutes}m` }, { l: 'Quality', v: `${sel.quality}%` }].map(x => (
                <div key={x.l} className="rounded-lg p-2.5 text-center" style={{ background: DARK.panel2, border: `1px solid ${DARK.line}` }}>
                  <div className="text-sm font-black" style={{ fontFamily: "'Outfit',sans-serif", color: DARK.text }}>{x.v}</div>
                  <div className="text-[9px]" style={{ color: DARK.faint }}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 flex flex-col gap-2">
            <button onClick={() => act('approve')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: DARK.green, color: DARK.bg }}>
              <Icon name="check" size={16} /> Approve & release ${sel.payout}
            </button>
            <button onClick={() => act('reject')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all hover:bg-white/5" style={{ borderColor: DARK.line, color: DARK.muted }}>
              Send back with a note
            </button>
          </div>
        </aside>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-bold z-50 flex items-center gap-2" style={{ background: DARK.green, color: DARK.bg, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
          <Icon name="check" size={16} /> {toast}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DARK, DProgress, RankMedal, SectionTitle, PageHead, LeaderboardsView, CampaignsView, SponsorView, ReviewView });
