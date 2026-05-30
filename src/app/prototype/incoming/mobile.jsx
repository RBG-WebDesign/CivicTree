/* eslint-disable */
import * as React from 'react';
// app/mobile.jsx - field-app router (tabs + stack) and primary tab screens
const { useState: useStateMo } = React;

// ─── TODAY ──────────────────────────────────────────────────────────────────
function TodayScreen({ push, go, hasActive, activeTask }) {
  const LT = window.LT, W = window.WORKER;
  const camp = window.ACTIVE_CAMPAIGNS.find(c => c.name === 'Broadway Block Reset');
  const paidTasks = window.WORKER_TASKS.filter(t => t.type !== 'verify');
  const topPayout = Math.max(...paidTasks.map(t => t.payout));

  const primary = hasActive ? {
    title: 'Finish your task', desc: `You still need an after photo for: ${activeTask.title}`, btn: 'Finish submission',
    style: { background: '#047857', color: '#fff' }, btnStyle: { background: '#fff', color: '#065f46' },
    onTap: () => push('submitProof', { task: activeTask }),
  } : {
    title: 'Earn nearby', desc: `${paidTasks.length} paid tasks within 1 mile. Top payout $${topPayout}.`, btn: 'View paid tasks',
    style: { background: LT.primary, color: '#fff' }, btnStyle: { background: '#fff', color: LT.primary },
    onTap: () => go('map'),
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24" style={{ background: LT.card }}>
      {/* status banner */}
      <div className="text-white px-6 pb-6 flex flex-col gap-4" style={{ background: LT.primary, borderRadius: '0 0 2rem 2rem', paddingTop: 54 }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Outfit',sans-serif" }}>Good morning, {W.name}.</h1>
            <p className="text-sm font-semibold mt-1" style={{ color: '#a7d8c0' }}>4 things need care near you.</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(167,216,192,0.6)' }}>Downtown Los Angeles Pilot</p>
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] flex items-center gap-1 font-bold" style={{ background: 'rgba(6,78,59,0.5)', border: '1px solid rgba(52,211,153,0.2)', color: '#a7d8c0' }}>
            <Icon name="award" size={10} style={{ color: '#6ee7b7' }} /> Level {W.level}: {W.levelLabel}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl" style={{ background: 'rgba(2,44,34,0.4)', border: '1px solid rgba(6,78,59,0.4)' }}>
          <div><span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: '#6ee7b7' }}>Available</span><div className="text-xl font-black mt-0.5" style={{ fontFamily: "'Outfit',sans-serif" }}>${W.available.toFixed(2)}</div></div>
          <div className="border-l pl-4" style={{ borderColor: 'rgba(6,78,59,0.4)' }}><span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: '#6ee7b7' }}>Pending Review</span><div className="text-xl font-black mt-0.5" style={{ fontFamily: "'Outfit',sans-serif", color: '#d1fae5' }}>${W.pending.toFixed(2)}</div></div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-6 flex-1">
        {/* primary action */}
        <div className="p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden" style={{ ...primary.style, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="flex flex-col gap-1 pr-10">
            <span className="text-[9px] uppercase font-black tracking-widest opacity-80">Next Step</span>
            <h2 className="text-lg font-black tracking-tight leading-snug" style={{ fontFamily: "'Outfit',sans-serif" }}>{primary.title}</h2>
            <p className="text-xs opacity-90 leading-relaxed mt-0.5">{primary.desc}</p>
          </div>
          <button onClick={primary.onTap} className="text-xs font-bold py-3 px-4 rounded-xl self-start transition-all active:scale-95" style={primary.btnStyle}>{primary.btn}</button>
        </div>

        {/* today near you */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: LT.muted, fontFamily: "'Outfit',sans-serif" }}><Icon name="flame" size={12} style={{ color: LT.success }} /> Today near you</h3>

          <button onClick={() => go('map')} className="text-left rounded-2xl p-4 flex items-center gap-3.5 transition-all active:scale-[0.99]" style={{ background: LT.bg, border: `1px solid ${LT.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: LT.em100 }}><Icon name="map-pin" size={18} style={{ color: LT.primary }} /></div>
            <div className="flex-1 min-w-0"><div className="text-sm font-bold" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>Paid tasks near you</div><p className="text-[11px] mt-0.5" style={{ color: LT.muted }}>{paidTasks.length} paid tasks nearby. Top payout ${topPayout}.</p></div>
            <Icon name="arrow-right" size={16} style={{ color: LT.muted2 }} />
          </button>

          <button onClick={() => go('report')} className="text-left rounded-2xl p-4 flex items-center gap-3.5 transition-all active:scale-[0.99]" style={{ background: LT.bg, border: `1px solid ${LT.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fef3c7' }}><Icon name="alert-circle" size={18} style={{ color: '#b45309' }} /></div>
            <div className="flex-1 min-w-0"><div className="text-sm font-bold" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>Report something</div><p className="text-[11px] mt-0.5" style={{ color: LT.muted }}>Report something dirty, broken, or unsafe.</p></div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: LT.success }}>Up to $3</span>
          </button>

          <button onClick={() => go('map')} className="text-left rounded-2xl p-4 flex items-center gap-3.5 transition-all active:scale-[0.99]" style={{ background: LT.bg, border: `1px solid ${LT.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#e0f2fe' }}><Icon name="help-circle" size={18} style={{ color: '#0369a1' }} /></div>
            <div className="flex-1 min-w-0"><div className="text-sm font-bold" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>Verify a nearby report</div><p className="text-[11px] mt-0.5" style={{ color: LT.muted }}>1 report needs a quick check.</p></div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: LT.success }}>$2-3</span>
          </button>

          <div className="flex items-center gap-2 px-1 text-[11px] font-semibold" style={{ color: LT.success }}>
            <Icon name="shield-check" size={14} /> Safety Basics complete. You're cleared for nearby tasks.
          </div>
        </div>

        {/* campaign */}
        <div className="p-5 rounded-3xl flex flex-col gap-3" style={{ border: `1px solid ${LT.border}` }}>
          <div className="flex justify-between items-start">
            <div><span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: LT.muted }}>Active Campaign</span><h4 className="text-sm font-bold mt-0.5" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>{camp.name}</h4></div>
            <span className="text-xs font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.primary }}>{camp.progress}%</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: LT.muted }}>Broadway Block Reset is {camp.progress}% complete. {camp.tasksLeft} tasks left to complete this block.</p>
          <window.LProgress value={camp.progress} color={LT.primary} height={8} />
          <button onClick={() => go('map')} className="text-[10px] font-bold flex items-center gap-0.5 mt-1" style={{ color: LT.primary }}>Help this campaign <Icon name="arrow-right" size={10} /></button>
        </div>

        {/* today in DTLA */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: LT.muted, fontFamily: "'Outfit',sans-serif" }}><Icon name="activity" size={12} style={{ color: LT.success }} /> Today in DTLA</h3>
          <div className="rounded-3xl p-4 flex justify-between gap-4 text-center mb-1" style={{ background: LT.bg, border: `1px solid ${LT.border}` }}>
            {[['Completed', '8 tasks'], ['Paid Out', '$214'], ['Improved', '3 blocks']].map(([l, v], i) => (
              <React.Fragment key={l}>
                {i > 0 && <div className="border-l" style={{ borderColor: LT.border }} />}
                <div><span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: LT.muted }}>{l}</span><div className="text-base font-black mt-0.5" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>{v}</div></div>
              </React.Fragment>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {['Someone cleaned litter near Oak St.', 'A planter route was completed on Broadway.', '$18 was paid for a sidewalk cleanup task.', 'A new problem report came in near 7th & Main St.'].map((t, i) => (
              <div key={i} className="text-[11px] leading-relaxed pl-3 border-l-2" style={{ color: LT.muted, borderColor: '#34d399' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAP ────────────────────────────────────────────────────────────────────
function MapScreen({ push }) {
  const LT = window.LT;
  const [filter, setFilter] = useStateMo('all');
  const [sel, setSel] = useStateMo(window.WORKER_TASKS[0]);
  const filters = [{ id: 'all', n: 'Nearby' }, { id: 'quick', n: 'Quick (<20m)' }, { id: 'high', n: 'Highest pay' }, { id: 'verify', n: 'Verify' }];
  const visible = window.WORKER_TASKS.filter(t => filter === 'all' ? true : filter === 'quick' ? t.minutes <= 20 : filter === 'high' ? t.payout >= 20 : t.type === 'verify');
  const pinColor = t => t.type === 'verify' ? '#059669' : LT.primary;

  return (
    <div className="flex flex-col h-full relative" style={{ background: LT.card }}>
      <div className="border-b pb-4 px-4 flex justify-between items-center shrink-0" style={{ borderColor: LT.border, paddingTop: 50 }}>
        <div className="flex items-center gap-2">
          <Icon name="menu" size={16} style={{ color: '#666' }} />
          <span className="text-xs font-extrabold" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>Downtown LA Map</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: LT.em100, color: LT.primary }}>{visible.length} tasks</span>
        </div>
        <button onClick={() => push('report', {})} style={{ color: LT.muted }}><Icon name="plus" size={18} /></button>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5 border-b shrink-0" style={{ background: '#f8f8f4', borderColor: LT.border }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => { setFilter(f.id); }} className="px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border" style={{
            background: filter === f.id ? LT.primary : '#fff', color: filter === f.id ? '#fff' : LT.muted, borderColor: filter === f.id ? LT.primary : LT.border,
          }}>{f.n}</button>
        ))}
      </div>

      <div className="flex-1 relative overflow-hidden" style={{ background: '#f4f3ed' }}>
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.25 }} xmlns="http://www.w3.org/2000/svg">
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#fff" strokeWidth="12" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#fff" strokeWidth="16" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#fff" strokeWidth="12" />
          <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#fff" strokeWidth="16" />
          <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#fff" strokeWidth="12" />
          <line x1="0" y1="85%" x2="100%" y2="85%" stroke="#fff" strokeWidth="10" />
        </svg>
        <div className="absolute pointer-events-none border-2 rounded-[2rem]" style={{ inset: '2rem', background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(45,106,79,0.3)' }} />
        {/* depot */}
        <div className="absolute" style={{ left: '42%', top: '32%' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[9px] shadow-md border border-white" style={{ background: '#ea580c', color: '#fff' }}>D</div>
        </div>
        {/* user dot */}
        <div className="absolute flex items-center justify-center" style={{ left: '45%', top: '55%', transform: 'translate(-50%,-50%)' }}>
          <div className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md z-10" style={{ background: '#3b82f6' }} />
          <div className="w-8 h-8 rounded-full absolute animate-ping pointer-events-none" style={{ background: 'rgba(59,130,246,0.3)' }} />
        </div>
        {/* task pins */}
        {visible.map(t => {
          const isSel = sel?.id === t.id;
          return (
            <button key={t.id} onClick={() => setSel(t)} className="absolute flex items-center justify-center rounded-full border-2 border-white shadow-md transition-all" style={{
              left: `${t.x}%`, top: `${t.y}%`, transform: `translate(-50%,-50%) scale(${isSel ? 1.25 : 1})`,
              width: isSel ? 32 : 26, height: isSel ? 32 : 26, background: pinColor(t), zIndex: isSel ? 30 : 20,
              boxShadow: isSel ? `0 0 0 4px ${pinColor(t)}33` : '0 2px 6px rgba(0,0,0,0.2)',
            }}>
              <Icon name="map-pin" size={isSel ? 14 : 11} style={{ color: '#fff' }} />
            </button>
          );
        })}
      </div>

      {/* selected card */}
      {sel && (
        <div className="absolute left-4 right-4 p-4 rounded-3xl shadow-xl z-40 flex items-center gap-4" style={{ bottom: 80, background: '#fff', border: `1px solid ${LT.border}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: LT.em50, border: `1px solid ${LT.em100}`, color: LT.success }}><Icon name="map-pin" size={22} /></div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold truncate leading-none" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>{sel.title}</h3>
            <div className="flex gap-2 items-center text-[10px] mt-1.5" style={{ color: LT.muted }}><span>{sel.distance} away</span><span>-</span><span>{sel.minutes} min</span><span>-</span><span className="font-semibold" style={{ color: LT.success }}>{sel.difficulty}</span></div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="text-sm font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.primary }}>${sel.payout.toFixed(2)}</span>
            <button onClick={() => push('taskDetail', { task: sel })} className="text-[9px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-0.5" style={{ background: LT.primary, color: '#fff' }}>View <Icon name="arrow-right" size={8} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EARN ───────────────────────────────────────────────────────────────────
function EarnScreen({ onImpact }) {
  const LT = window.LT, W = window.WORKER;
  const [cashing, setCashing] = useStateMo(false);
  const [done, setDone] = useStateMo(false);
  const payments = [
    { task: 'Sidewalk sweep - Vine St', amount: 20, status: 'available', when: 'Today' },
    { task: 'Clear litter on Oak St', amount: 18, status: 'pending', when: '6m ago' },
    { task: 'Water planters - Spring St', amount: 24, status: 'available', when: 'Yesterday' },
    { task: 'Remove stickers - signal box', amount: 12, status: 'paid', when: 'Tue' },
    { task: 'Verify report - 7th & Main', amount: 3, status: 'paid', when: 'Mon' },
  ];
  const cfg = { available: { l: 'Available', c: LT.success, bg: LT.em100 }, pending: { l: 'In review', c: '#b45309', bg: '#fef3c7' }, paid: { l: 'Paid out', c: LT.muted, bg: '#eef2f7' } };

  const cashout = () => { setCashing(true); setTimeout(() => { setCashing(false); setDone(true); setTimeout(() => setDone(false), 2600); }, 1200); };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24" style={{ background: LT.bg }}>
      <div className="text-white px-6 pb-6 flex flex-col gap-5" style={{ background: LT.primary, borderRadius: '0 0 2rem 2rem', paddingTop: 56 }}>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#a7d8c0' }}>Available to cash out</span>
          <div className="text-5xl font-black mt-1" style={{ fontFamily: "'Outfit',sans-serif" }}>${W.available.toFixed(2)}</div>
          <p className="text-xs mt-1" style={{ color: '#a7d8c0' }}>+ ${W.pending.toFixed(2)} pending review</p>
        </div>
        <button onClick={cashout} disabled={cashing || done} className="w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]" style={{ background: done ? '#065f46' : '#fff', color: done ? '#fff' : LT.primary }}>
          {cashing ? 'Processing...' : done ? <><Icon name="check" size={18} /> Sent to your bank</> : <><Icon name="banknote" size={18} /> Cash out ${W.available.toFixed(2)}</>}
        </button>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: LT.muted }}>Lifetime earned</span>
            <div className="text-2xl font-black mt-1" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>${W.lifetimeEarned.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: LT.muted }}>This week</span>
            <div className="text-2xl font-black mt-1" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>$77.00</div>
          </div>
        </div>

        <button onClick={onImpact} className="rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.99]" style={{ background: 'linear-gradient(135deg, #fff, #f5f8f5)', border: `1px solid ${LT.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: LT.em50, color: LT.primary }}><Icon name="trending-up" size={18} /></div>
          <div className="flex-1"><div className="text-[13px] font-bold" style={{ color: LT.fg }}>See your full impact</div><div className="text-[11px]" style={{ color: LT.muted }}>Badges, level progress, blocks improved</div></div>
          <Icon name="chevron-right" size={16} style={{ color: LT.muted2 }} />
        </button>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: LT.muted, fontFamily: "'Outfit',sans-serif" }}><Icon name="clock" size={12} style={{ color: LT.success }} /> Recent earnings</h3>
          <div className="flex flex-col gap-2.5">
            {payments.map((p, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: LT.em50, color: LT.primary }}><Icon name="check" size={16} /></div>
                <div className="flex-1 min-w-0"><div className="text-[13px] font-bold truncate" style={{ color: LT.fg }}>{p.task}</div><span className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: cfg[p.status].bg, color: cfg[p.status].c }}>{cfg[p.status].l} - {p.when}</span></div>
                <span className="text-sm font-black shrink-0" style={{ fontFamily: "'Outfit',sans-serif", color: p.status === 'paid' ? LT.muted : LT.primary }}>${p.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE ────────────────────────────────────────────────────────────────
function ProfileScreen({ onSignOut, onReplayOnboarding, onImpact }) {
  const LT = window.LT, W = window.WORKER;
  const rows = [
    { i: 'trending-up', l: 'Your impact', v: `Level ${W.level}`, onTap: onImpact },
    { i: 'shield-check', l: 'Safety training', v: 'Complete', onTap: onReplayOnboarding },
    { i: 'users', l: 'My crew', v: 'Spring Street Stewards' },
    { i: 'bell', l: 'Notifications', v: 'On' },
    { i: 'lock', l: 'Privacy', v: 'Location hidden' },
    { i: 'help-circle', l: 'Help & support', v: '' },
  ];
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24" style={{ background: LT.bg }}>
      <div className="px-6 pb-6 flex flex-col items-center text-center" style={{ background: LT.card, borderBottom: `1px solid ${LT.border}`, paddingTop: 54 }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black mb-3" style={{ background: LT.primary, color: '#fff', fontFamily: "'Outfit',sans-serif" }}>{W.name[0]}</div>
        <h1 className="text-xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>{W.name} V.</h1>
        <p className="text-[12px] mt-0.5" style={{ color: LT.muted }}>{W.neighborhood}</p>
        <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full" style={{ background: LT.em50 }}>
          <Icon name="award" size={13} style={{ color: LT.primary }} />
          <span className="text-[12px] font-bold" style={{ color: LT.primary }}>Level {W.level}: {W.levelLabel}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          {[['Tasks', W.tasksDone], ['Quality', `${W.quality}%`], ['Streak', `${W.streakDays}d`]].map(([l, v]) => (
            <div key={l} className="rounded-2xl p-3 text-center" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
              <div className="text-lg font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>{v}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: LT.muted2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
          {rows.map((r, i) => (
            <button key={r.l} onClick={r.onTap} className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50" style={{ borderTop: i > 0 ? `1px solid ${LT.border}` : 'none' }}>
              <Icon name={r.i} size={17} style={{ color: LT.muted }} />
              <span className="text-[13px] font-semibold flex-1" style={{ color: LT.fg }}>{r.l}</span>
              {r.v && <span className="text-[11px]" style={{ color: LT.muted2 }}>{r.v}</span>}
              <Icon name="chevron-right" size={15} style={{ color: '#cbd2cb' }} />
            </button>
          ))}
        </div>

        <button onClick={onSignOut} className="w-full py-3.5 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]" style={{ background: LT.card, border: `1px solid ${LT.border}`, color: LT.warning }}>
          <Icon name="log-out" size={15} /> Switch experience
        </button>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ─────────────────────────────────────────────────────────────
function BottomNav({ tab, go }) {
  const LT = window.LT;
  const items = [{ k: 'today', l: 'Today', i: 'shield' }, { k: 'map', l: 'Map', i: 'map' }, { k: 'report', l: 'Report', i: 'alert-circle' }, { k: 'earn', l: 'Earn', i: 'dollar-sign' }, { k: 'profile', l: 'Profile', i: 'user' }];
  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-around py-2.5 z-40 bg-white/95 backdrop-blur-md border-t" style={{ borderColor: LT.border, boxShadow: '0 -4px 16px rgba(0,0,0,0.04)' }}>
      {items.map(it => {
        const active = tab === it.k;
        return (
          <button key={it.k} onClick={() => go(it.k)} className="flex flex-col items-center gap-0.5 transition-all px-3" style={{ color: active ? LT.primary : '#9ca89e', opacity: active ? 1 : 0.7 }}>
            <Icon name={it.i} size={20} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[9px] font-black tracking-wider uppercase">{it.l}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── MOBILE APP (router) ────────────────────────────────────────────────────
function MobileApp({ onExit, startOnboarding }) {
  const LT = window.LT;
  const [tab, setTab] = useStateMo('today');
  const [stack, setStack] = useStateMo(startOnboarding ? [{ name: 'onboarding' }] : []);
  const [activeTask, setActiveTask] = useStateMo(null);
  const [toast, setToast] = useStateMo(null);

  const push = (name, params) => setStack(s => [...s, { name, params }]);
  const back = () => setStack(s => s.slice(0, -1));
  const go = (t) => { setStack([]); setTab(t); };
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const top = stack[stack.length - 1];

  // Adapt phone status-bar text color: white over the dark-green heroes (Today/Earn), else dark.
  React.useEffect(() => {
    const overDarkHero = stack.length === 0 && (tab === 'today' || tab === 'earn');
    document.documentElement.style.setProperty('--statusbar', overDarkHero ? '#ffffff' : '#1c281e');
    return () => document.documentElement.style.setProperty('--statusbar', '#1c281e');
  }, [tab, stack]);

  const renderTab = () => {
    switch (tab) {
      case 'today': return <TodayScreen push={push} go={go} hasActive={!!activeTask} activeTask={activeTask} />;
      case 'map': return <MapScreen push={push} />;
      case 'report': return <window.ReportScreen onBack={() => go('today')} onSubmitted={() => { go('today'); flash('Report submitted - thanks for the heads up.'); }} />;
      case 'earn': return <EarnScreen onImpact={() => push('impact')} />;
      case 'profile': return <ProfileScreen onSignOut={onExit} onReplayOnboarding={() => push('onboarding')} onImpact={() => push('impact')} />;
      default: return null;
    }
  };

  const renderStack = () => {
    if (!top) return null;
    switch (top.name) {
      case 'onboarding': return <window.Onboarding onDone={() => { back(); flash('Welcome to CivicTree. Let\'s find you a task.'); }} />;
      case 'taskDetail': return <window.TaskDetail task={top.params.task} onBack={back} onClaim={(t) => { setStack(s => [...s.slice(0, -1), { name: 'submitProof', params: { task: t } }]); }} />;
      case 'submitProof': return <window.SubmitProof task={top.params.task} onBack={back} onSubmitted={() => { setActiveTask(null); go('earn'); flash('Submitted! We\'ll review it shortly.'); }} />;
      case 'impact': return <window.ImpactScreen onBack={back} />;
      default: return null;
    }
  };

  const showNav = stack.length === 0 && tab !== 'report';

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: LT.card, fontFamily: "'Plus Jakarta Sans',sans-serif", color: LT.fg }}>
      <div className="absolute inset-0">{renderTab()}</div>
      {top && <div className="absolute inset-0 z-30" style={{ animation: 'screen-in .28s cubic-bezier(.2,.8,.2,1)' }}>{renderStack()}</div>}
      {showNav && <BottomNav tab={tab} go={go} />}
      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full text-[12px] font-bold z-50 flex items-center gap-2" style={{ bottom: showNav ? 84 : 28, background: LT.primary, color: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', maxWidth: '90%' }}>
          <Icon name="check" size={14} /> <span className="truncate">{toast}</span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MobileApp });
