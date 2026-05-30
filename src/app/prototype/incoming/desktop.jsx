/* eslint-disable */
import * as React from 'react';
// app/desktop.jsx - Command Center shell + LA map game board + neighborhood detail
const { useState: useStateD } = React;

const CELL_W = 132, CELL_H = 96, GAP = 9, COLS = 6, ROWS = 5;
const MAP_W = COLS * (CELL_W + GAP) - GAP;
const MAP_H = ROWS * (CELL_H + GAP) - GAP;

const NAV_LINKS = [
  { key: 'command',  label: 'Admin Home',    icon: 'home' },
  { key: 'map',      label: 'LA Map',         icon: 'map' },
  { key: 'reports',  label: 'Reports Queue',  icon: 'alert-circle' },
  { key: 'pipeline', label: 'Task Pipeline',  icon: 'layers' },
  { key: 'review',   label: 'Task Review',    icon: 'check-square' },
  { key: 'campaigns',label: 'Campaigns',      icon: 'flag' },
  { key: 'leaders',  label: 'Leaderboards',   icon: 'award' },
  { key: 'sponsor',  label: 'Sponsor View',   icon: 'zap' },
];

// ─── Neighborhood detail (right rail) ───────────────────────────────────────
function NeighborhoodDetail({ n, onClose }) {
  const D = window.DARK, cfg = window.STATE_CONFIG[n.state];
  const camp = window.ACTIVE_CAMPAIGNS.find(c => c.name === n.campaign);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: cfg.text }}>Level {n.level} - {cfg.label}</span>
            <h2 className="text-lg font-black leading-tight mt-0.5" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>{n.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-white/5" style={{ color: D.faint }}><Icon name="x" size={16} /></button>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: D.muted }}>{n.description}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: D.muted }}>Progress to Level {n.level + 1}</span>
            <span className="font-bold" style={{ color: cfg.accent }}>{n.progress}%</span>
          </div>
          <window.DProgress value={n.progress} color={cfg.accent} height={6} />
          <p className="text-[10px] mt-1.5" style={{ color: D.faint }}>Help this block level up - {100 - n.progress} points to go.</p>
        </div>
      </div>

      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <window.SectionTitle>All-time stats</window.SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tasks done', value: n.tasksCompleted },
            { label: 'Paid out', value: `$${n.dollarsPaid.toLocaleString()}` },
            { label: 'Blocks', value: n.blocksImproved },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: D.panel2, border: `1px solid ${D.line}` }}>
              <div className="text-base font-black" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>{s.value}</div>
              <div className="text-[9px] mt-0.5" style={{ color: D.faint }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-3">
          <div className="flex-1 rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div><div className="text-[9px] font-bold" style={{ color: D.amber }}>Open tasks</div><div className="text-lg font-black" style={{ fontFamily: "'Outfit',sans-serif", color: '#fde68a' }}>{n.openTasks}</div></div>
            <Icon name="target" size={18} style={{ color: D.amber, opacity: 0.6 }} />
          </div>
          <div className="flex-1 rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div><div className="text-[9px] font-bold" style={{ color: D.red }}>Reports</div><div className="text-lg font-black" style={{ fontFamily: "'Outfit',sans-serif", color: '#fca5a5' }}>{n.reports}</div></div>
            <Icon name="activity" size={18} style={{ color: D.red, opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {n.campaign && camp && (
        <div className="p-5 border-b" style={{ borderColor: D.line }}>
          <window.SectionTitle>Active campaign</window.SectionTitle>
          <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="flex items-start gap-2 mb-3">
              <Icon name="flag" size={14} style={{ color: D.amber, marginTop: 2 }} />
              <div>
                <div className="text-sm font-bold" style={{ color: '#fde68a' }}>{n.campaign}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#d97706' }}>{camp.tasksLeft} tasks left</div>
              </div>
            </div>
            <window.DProgress value={camp.progress} color={D.amber} />
            <div className="text-[10px] mt-1.5 font-bold" style={{ color: D.amber }}>{n.campaign} is {camp.progress}% complete.</div>
          </div>
        </div>
      )}

      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <div className="flex flex-col gap-3">
          <div>
            <window.SectionTitle>Top crew</window.SectionTitle>
            {n.topCrew ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)', color: D.green }}><Icon name="users" size={11} /></div>
                <span className="text-xs font-semibold" style={{ color: D.text }}>{n.topCrew}</span>
              </div>
            ) : <span className="text-xs" style={{ color: D.faint }}>No crew yet. Be the first.</span>}
          </div>
          <div>
            <window.SectionTitle>Sponsor</window.SectionTitle>
            {n.sponsor ? (
              <div className="flex items-center gap-2"><Icon name="zap" size={12} style={{ color: D.amber }} /><span className="text-xs font-semibold" style={{ color: D.text }}>{n.sponsor}</span></div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: D.faint }}>No sponsor. This zone needs one.</span>
                <button className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-80" style={{ background: 'rgba(251,191,36,0.15)', color: D.amber }}>Fund it</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* recent activity + before/after */}
      <div className="p-5 border-b" style={{ borderColor: D.line }}>
        <window.SectionTitle>Recent block proof</window.SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {['Before', 'After'].map(lbl => (
            <div key={lbl}>
              <div className="aspect-[4/3] rounded-xl flex items-center justify-center" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 8px, rgba(255,255,255,0.02) 8px 16px)', border: `1px solid ${D.line}` }}>
                <span className="text-[10px] font-mono" style={{ color: D.faint }}>{lbl.toLowerCase()} photo</span>
              </div>
              <div className="text-[9px] font-bold text-center uppercase tracking-wider mt-1" style={{ color: D.faint }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-2">
        <button className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: D.green, color: D.bg }}>
          <span>Steward this neighborhood</span><Icon name="arrow-right" size={16} />
        </button>
        <button className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold border transition-all hover:bg-white/5" style={{ borderColor: D.line, color: D.muted }}>
          <span>Create tasks here</span><Icon name="arrow-right" size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Right rail tabs (no selection) ─────────────────────────────────────────
function RightTabs({ onSelect }) {
  const D = window.DARK;
  const [tab, setTab] = useStateD('overview');
  const needsCare = window.NEIGHBORHOODS.filter(n => n.state === 'needs-care');
  const tabs = ['overview', 'leaderboards', 'campaigns', 'activity'];
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b shrink-0" style={{ borderColor: D.line }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-wider capitalize transition-colors"
            style={{ color: tab === t ? D.green : D.faint, borderBottom: `2px solid ${tab === t ? D.green : 'transparent'}` }}>{t}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'overview' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: D.green }}>DTLA Pilot - live</p>
              <p className="text-sm font-black leading-snug mb-2" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>Los Angeles is your game board.</p>
              <p className="text-[11px] leading-relaxed" style={{ color: D.muted }}>Click any neighborhood to see progress, tasks, campaigns, and crews. Help a block level up by completing verified tasks.</p>
            </div>
            <div>
              <window.SectionTitle>Zones needing care</window.SectionTitle>
              {needsCare.map(n => (
                <button key={n.id} onClick={() => onSelect(n)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1.5 text-left transition-all hover:bg-white/5" style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)' }}>
                  <div><div className="text-xs font-bold" style={{ color: '#fca5a5' }}>{n.name}</div><div className="text-[10px]" style={{ color: D.red }}>{n.openTasks} tasks open - {n.reports} reports</div></div>
                  <Icon name="chevron-right" size={14} style={{ color: D.red }} />
                </button>
              ))}
            </div>
            <div>
              <window.SectionTitle>Highest performing</window.SectionTitle>
              {[...window.NEIGHBORHOODS].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 3).map(n => (
                <button key={n.id} onClick={() => onSelect(n)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1.5 text-left transition-all hover:bg-white/5" style={{ border: `1px solid ${D.line}`, background: D.panel2 }}>
                  <div><div className="text-xs font-bold" style={{ color: D.text }}>{n.shortName}</div><div className="text-[10px]" style={{ color: D.faint }}>{n.tasksCompleted} tasks - ${n.dollarsPaid.toLocaleString()} paid</div></div>
                  <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: window.STATE_CONFIG[n.state].bg, color: window.STATE_CONFIG[n.state].text }}>Lv {n.level}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === 'leaderboards' && (
          <div className="flex flex-col gap-5">
            <div>
              <window.SectionTitle>Top stewards this week</window.SectionTitle>
              {window.LEADERBOARD_WORKERS.slice(0, 5).map(w => (
                <div key={w.rank} className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5" style={{ background: w.rank === 1 ? 'rgba(251,191,36,0.08)' : D.panel2, border: `1px solid ${w.rank === 1 ? 'rgba(251,191,36,0.2)' : D.line}` }}>
                  <window.RankMedal rank={w.rank} />
                  <div className="flex-1 min-w-0"><div className="text-xs font-bold" style={{ color: D.text }}>{w.name}</div><div className="text-[10px]" style={{ color: D.faint }}>{w.neighborhood} - {w.tasks} tasks</div></div>
                  <div className="text-right"><div className="text-xs font-bold" style={{ color: D.green }}>${w.earned}</div><div className="text-[9px]" style={{ color: D.faint }}>{w.quality}%</div></div>
                </div>
              ))}
            </div>
            <div>
              <window.SectionTitle>Top crews</window.SectionTitle>
              {window.LEADERBOARD_CREWS.map(c => (
                <div key={c.rank} className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5" style={{ background: D.panel2, border: `1px solid ${D.line}` }}>
                  <window.RankMedal rank={c.rank} />
                  <div className="flex-1 min-w-0"><div className="text-xs font-bold truncate" style={{ color: D.text }}>{c.name}</div><div className="text-[10px]" style={{ color: D.faint }}>{c.neighborhood} - {c.members} members</div></div>
                  <div className="text-xs font-bold" style={{ color: D.green2 }}>{c.tasks}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'campaigns' && (
          <div className="flex flex-col gap-3">
            <window.SectionTitle>Active campaigns</window.SectionTitle>
            {window.ACTIVE_CAMPAIGNS.map(c => (
              <div key={c.name} className="rounded-xl p-4" style={{ background: D.panel2, border: `1px solid ${D.line}` }}>
                <div className="flex items-start justify-between mb-2">
                  <div><div className="text-xs font-bold" style={{ color: D.text }}>{c.name}</div><div className="text-[10px]" style={{ color: D.faint }}>{c.neighborhood}</div></div>
                  <span className="text-[10px] font-black" style={{ color: c.progress > 50 ? D.green : D.amber }}>{c.progress}%</span>
                </div>
                <window.DProgress value={c.progress} color={c.progress > 50 ? D.green : D.amber} height={4} />
                <div className="flex justify-between text-[10px] mt-2">
                  <span style={{ color: D.faint }}>{c.tasksLeft} tasks left</span>
                  <span style={{ color: c.sponsor ? D.amber : D.red }}>{c.sponsor ? `Funded by ${c.sponsor}` : c.budget}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'activity' && (
          <div className="flex flex-col gap-1">
            <window.SectionTitle>Live from LA</window.SectionTitle>
            {window.ACTIVITY_FEED.map((item, i) => (
              <div key={i} className="flex gap-3 px-3 py-3 rounded-xl" style={{ background: D.panel2, border: `1px solid ${D.line}`, marginBottom: 4 }}>
                <div className="flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: item.amount ? D.green : D.amber }} />
                  {i < window.ACTIVITY_FEED.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: D.line }} />}
                </div>
                <div className="flex-1 pb-1">
                  <div className="text-xs leading-snug" style={{ color: D.text2 }}>{item.text}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]" style={{ color: D.faint }}>{item.neighborhood}</span><span style={{ color: D.faint }}>-</span><span className="text-[10px]" style={{ color: D.faint }}>{item.time}</span>
                    {item.amount !== null && <span className="text-[10px] font-bold" style={{ color: D.green }}>+${item.amount}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── The LA map board ───────────────────────────────────────────────────────
function LAMap({ selected, onSelect, big }) {
  const D = window.DARK;
  const needsCare = window.NEIGHBORHOODS.filter(n => n.state === 'needs-care');
  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black tracking-tight" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>Los Angeles</h1>
          <p className="text-xs mt-0.5" style={{ color: D.faint }}>Click any neighborhood to explore. {needsCare.length} zones need care.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {Object.entries(window.STATE_CONFIG).map(([state, cfg]) => (
            <div key={state} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm" style={{ background: cfg.accent }} />
              <span className="text-[10px] font-medium" style={{ color: D.faint }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: MAP_W, height: MAP_H }}>
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const col = i % COLS, row = Math.floor(i / COLS);
          return <div key={i} className="absolute rounded-xl" style={{ left: col * (CELL_W + GAP), top: row * (CELL_H + GAP), width: CELL_W, height: CELL_H, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }} />;
        })}
        {window.NEIGHBORHOODS.map(n => {
          const cfg = window.STATE_CONFIG[n.state];
          const isSel = selected?.id === n.id;
          const pulsing = n.state === 'needs-care';
          return (
            <div key={n.id} onClick={() => onSelect(n)} className={`absolute rounded-xl cursor-pointer transition-all duration-200 ${pulsing ? 'needs-care-pulse' : ''}`}
              style={{
                left: n.col * (CELL_W + GAP), top: n.row * (CELL_H + GAP), width: CELL_W, height: CELL_H,
                background: cfg.bg, border: `1.5px solid ${isSel ? D.blue : cfg.border}`,
                boxShadow: isSel ? `0 0 0 2px rgba(96,165,250,0.4), 0 0 24px rgba(96,165,250,0.2)` : pulsing ? `0 0 12px ${cfg.glow}` : 'none',
                transform: isSel ? 'scale(1.05)' : 'scale(1)', zIndex: isSel ? 10 : 1,
              }}>
              <div className="p-2.5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: cfg.text }}>Lv {n.level}</span>
                    {n.campaign && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: D.amber }}>Campaign</span>}
                  </div>
                  <div className="text-[11px] font-bold leading-tight mt-0.5" style={{ color: D.text }}>{n.shortName}</div>
                </div>
                <div>
                  <window.DProgress value={n.progress} color={cfg.accent} height={4} track="rgba(255,255,255,0.1)" />
                  <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{n.progress}%</div>
                </div>
                <div className="flex items-center gap-2 text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span className="flex items-center gap-0.5"><Icon name="target" size={8} />{n.openTasks}</span><span>-</span>
                  <span className="flex items-center gap-0.5"><Icon name="activity" size={8} />{n.reports}</span>
                  {n.sponsor && <><span>-</span><Icon name="zap" size={8} style={{ color: D.amber }} /></>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 mx-auto" style={{ width: MAP_W }}>
        <div className="h-px flex-1" style={{ background: 'rgba(96,165,250,0.15)' }} />
        <span className="text-[10px] font-semibold" style={{ color: 'rgba(96,165,250,0.4)' }}>{'<-'} Pacific Ocean</span>
      </div>
    </main>
  );
}

// ─── Desktop app shell ──────────────────────────────────────────────────────
function DesktopApp({ onExit }) {
  const D = window.DARK;
  const [view, setView] = useStateD('command');
  const [selected, setSelected] = useStateD(null);

  const needsCare = window.NEIGHBORHOODS.filter(n => n.state === 'needs-care');
  const totalOpen = window.NEIGHBORHOODS.reduce((s, n) => s + n.openTasks, 0);
  const totalReports = window.NEIGHBORHOODS.reduce((s, n) => s + n.reports, 0);

  const pick = (n) => setSelected(prev => prev?.id === n.id ? null : n);

  return (
    <div className="dashboard-root flex w-full h-full overflow-hidden" style={{ background: D.bg, color: D.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-[210px] shrink-0 flex flex-col border-r" style={{ background: D.panel, borderColor: D.line }}>
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: D.line }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: D.green, color: D.bg }}>CT</div>
            <span className="font-black text-sm tracking-tight" style={{ fontFamily: "'Outfit',sans-serif", color: D.text }}>CivicTree</span>
          </div>
          <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: D.faint }}>Command Center</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV_LINKS.map(({ key: navKey, label, icon }) => {
            const isActive = view === navKey;
            return (
              <button key={navKey} onClick={() => setView(navKey)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left"
                style={{ color: isActive ? D.green : D.muted, background: isActive ? 'rgba(34,197,94,0.1)' : 'transparent' }}>
                <Icon name={icon} size={14} />{label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: D.line }}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: D.faint }}>Los Angeles, Live</p>
          <div className="flex flex-col gap-2.5">
            {[['Neighborhoods', '15', D.text], ['Open tasks', totalOpen, D.amber], ['Pending reports', totalReports, D.red], ['Need care', `${needsCare.length} zones`, D.red]].map(([l, v, c]) => (
              <div key={l} className="flex justify-between text-xs"><span style={{ color: D.muted }}>{l}</span><span className="font-bold" style={{ color: c }}>{v}</span></div>
            ))}
          </div>
          <button onClick={onExit} className="w-full mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold border transition-all hover:bg-white/5" style={{ borderColor: D.line, color: D.muted }}>
            <Icon name="log-out" size={12} /> Switch experience
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="shrink-0 flex items-center gap-3 px-6 py-3 border-b overflow-x-auto" style={{ background: D.panel, borderColor: D.line }}>
          <div className="flex items-center gap-1.5 mr-1 shrink-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: D.green }} />
            <span className="text-[11px] font-bold" style={{ color: D.green }}>Live</span>
          </div>
          {[
            { label: 'Tasks today', value: '34', icon: 'check-square', color: D.green },
            { label: 'Paid out today', value: '$847', icon: 'dollar-sign', color: D.green2 },
            { label: 'Blocks improved', value: '7', icon: 'trending-up', color: D.blue },
            { label: 'Reports waiting', value: '23', icon: 'activity', color: D.red },
            { label: 'Reviews pending', value: window.REVIEW_QUEUE.length.toString(), icon: 'eye', color: D.amber },
            { label: 'Active workers', value: '18', icon: 'users', color: '#c4b5fd' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border shrink-0" style={{ borderColor: D.line, background: D.panel2 }}>
              <Icon name={s.icon} size={13} style={{ color: s.color }} />
              <div><div className="text-[10px] font-semibold" style={{ color: D.faint }}>{s.label}</div><div className="text-sm font-black leading-none" style={{ fontFamily: "'Outfit',sans-serif", color: s.color }}>{s.value}</div></div>
            </div>
          ))}
          <div className="ml-auto flex gap-2 shrink-0">
            <button onClick={() => setView('review')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: D.green, color: D.bg }}>
              <Icon name="check-square" size={12} /> Review Queue
            </button>
          </div>
        </header>

        {/* View router */}
        {(view === 'command' || view === 'map') && (
          <div className="flex flex-1 overflow-hidden">
            <LAMap selected={selected} onSelect={pick} big={view === 'map'} />
            <aside className="w-[340px] shrink-0 flex flex-col border-l overflow-hidden" style={{ borderColor: D.line, background: D.panel }}>
              {selected ? <NeighborhoodDetail n={selected} onClose={() => setSelected(null)} /> : <RightTabs onSelect={(n) => setSelected(n)} />}
            </aside>
          </div>
        )}
        {view === 'leaders' && <div className="flex-1 overflow-y-auto"><window.LeaderboardsView /></div>}
        {view === 'campaigns' && <div className="flex-1 overflow-y-auto"><window.CampaignsView /></div>}
        {view === 'sponsor' && <div className="flex-1 overflow-y-auto"><window.SponsorView /></div>}
        {view === 'reports' && <window.ReportsQueueView />}
        {view === 'pipeline' && <window.PipelineView />}
        {view === 'review' && <window.ReviewView />}
      </div>
    </div>
  );
}

Object.assign(window, { DesktopApp });
