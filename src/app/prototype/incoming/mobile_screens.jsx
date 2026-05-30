/* eslint-disable */
import * as React from 'react';
// app/mobile_screens.jsx - light-theme field-app helpers + stacked screens
const { useState: useStateM, useEffect: useEffectM } = React;

const LT = {
  bg: '#faf9f5', fg: '#1c281e', card: '#ffffff', border: '#e6e8e4',
  primary: '#1b4332', primaryHover: '#133024', accent: '#40916c',
  success: '#2d6a4f', warning: '#d94e1f', muted: '#5e6b5f', muted2: '#8a9a8c',
  em50: '#ecfdf5', em100: '#d1fae5',
};

function LProgress({ value, color = LT.accent, height = 6, track = '#e9ece8' }) {
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }} />
    </div>
  );
}

// Stacked-screen chrome: back header
function PushHeader({ title, onBack, right }) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 px-4 pb-3.5 bg-white/95 backdrop-blur-md border-b" style={{ borderColor: LT.border, paddingTop: 48 }}>
      <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100" style={{ color: LT.fg }}>
        <Icon name="chevron-left" size={20} />
      </button>
      <span className="text-sm font-extrabold flex-1" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>{title}</span>
      {right}
    </div>
  );
}

function PhotoSlot({ label, filled, onTap, accent = LT.accent }) {
  return (
    <button onClick={onTap} className="w-full rounded-2xl overflow-hidden transition-all active:scale-[0.98]" style={{ border: `1.5px ${filled ? 'solid' : 'dashed'} ${filled ? accent : LT.border}` }}>
      <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2" style={{
        background: filled ? `linear-gradient(135deg, ${LT.em50}, #fff)` : 'repeating-linear-gradient(135deg, #f4f3ed 0 9px, #faf9f5 9px 18px)',
      }}>
        {filled ? (
          <>
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: accent, color: '#fff' }}><Icon name="check" size={22} /></div>
            <span className="text-[11px] font-bold" style={{ color: LT.success }}>{label} captured</span>
          </>
        ) : (
          <>
            <Icon name="camera" size={26} style={{ color: LT.muted2 }} />
            <span className="text-[11px] font-bold" style={{ color: LT.muted }}>Tap to capture {label.toLowerCase()}</span>
            <span className="text-[9px] font-mono" style={{ color: LT.muted2 }}>{label.toLowerCase()} photo</span>
          </>
        )}
      </div>
    </button>
  );
}

// ─── ONBOARDING (entry safety intro) ────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useStateM(0);
  const steps = [
    { icon: 'leaf', tag: 'Welcome', title: 'Get paid to care for your block.', body: 'CivicTree pays you for small, useful tasks near you - clearing litter, watering planters, removing stickers. Real work, real cash, a better neighborhood.' },
    { icon: 'shield-check', tag: 'Safety first', title: 'Your safety comes before any task.', body: 'Never pick up sharps, needles, or hazardous waste - report them instead. Stay on the sidewalk, wear the gloves in your kit, and stop any task that feels unsafe.' },
    { icon: 'camera', tag: 'Proof of work', title: 'Snap a before and after photo.', body: 'Every paid task needs a before and after photo. A reviewer checks your work - most reviews take under an hour - then your payment is released.' },
    { icon: 'banknote', tag: 'Getting paid', title: 'Cash out whenever you like.', body: 'Earnings land in your CivicTree balance. Cash out to your bank or card anytime once a task is approved. No minimums, no waiting for payday.' },
  ];
  const s = steps[step];
  const last = step === steps.length - 1;
  return (
    <div className="flex flex-col h-full" style={{ background: LT.bg }}>
      <div className="flex-1 flex flex-col px-7 pt-16 pb-8">
        <div className="flex gap-1.5 mb-12">
          {steps.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= step ? LT.primary : '#e2e6e0' }} />
          ))}
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7" style={{ background: LT.primary, color: '#fff' }}>
          <Icon name={s.icon} size={30} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: LT.accent }}>{s.tag}</span>
        <h1 className="text-[26px] font-black leading-[1.15] mb-4" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg, letterSpacing: '-0.02em' }}>{s.title}</h1>
        <p className="text-[15px] leading-relaxed" style={{ color: LT.muted }}>{s.body}</p>
        {step === 1 && (
          <div className="mt-6 rounded-2xl p-4 flex gap-3" style={{ background: '#fef2ec', border: '1px solid #f6d5c6' }}>
            <Icon name="alert-triangle" size={18} style={{ color: LT.warning, flexShrink: 0, marginTop: 1 }} />
            <p className="text-[12px] leading-relaxed font-semibold" style={{ color: '#9a3412' }}>If you ever feel unsafe, leave. You will never be penalized for skipping a task.</p>
          </div>
        )}
      </div>
      <div className="px-7 pb-10 flex flex-col gap-3">
        <button onClick={() => last ? onDone() : setStep(step + 1)} className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98]" style={{ background: LT.primary, color: '#fff' }}>
          {last ? "I'm ready - show me tasks" : 'Continue'}
        </button>
        {!last && <button onClick={onDone} className="text-[13px] font-bold py-1" style={{ color: LT.muted }}>Skip intro</button>}
      </div>
    </div>
  );
}

// ─── TASK DETAIL ────────────────────────────────────────────────────────────
function TaskDetail({ task, onBack, onClaim }) {
  const typeIcon = { cleanup: 'trash', green: 'droplet', verify: 'shield-check' }[task.type] || 'map-pin';
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: LT.bg }}>
      <PushHeader title="Task detail" onBack={onBack} />
      {/* hero map strip */}
      <div className="relative h-36 shrink-0" style={{ background: '#e8eae3' }}>
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#fff" strokeWidth="10" />
          <line x1="68%" y1="0" x2="68%" y2="100%" stroke="#fff" strokeWidth="14" />
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#fff" strokeWidth="12" />
          <line x1="0" y1="78%" x2="100%" y2="78%" stroke="#fff" strokeWidth="9" />
        </svg>
        <div className="absolute" style={{ left: '64%', top: '36%' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-md" style={{ background: LT.primary, color: '#fff', transform: 'translate(-50%,-50%)' }}>
            <Icon name="map-pin" size={16} />
          </div>
        </div>
        <span className="absolute bottom-2 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-white/70" style={{ color: LT.muted }}>map preview</span>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5 flex-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: LT.em100, color: LT.success }}>{task.difficulty}</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#eef2f7', color: LT.muted }}>{task.distance} away</span>
          </div>
          <h1 className="text-xl font-black leading-tight" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>{task.title}</h1>
          <p className="text-[13px] leading-relaxed mt-2" style={{ color: LT.muted }}>{task.desc}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[{ l: 'Payout', v: `$${task.payout}`, c: LT.primary }, { l: 'Est. time', v: `${task.minutes}m`, c: LT.fg }, { l: 'Type', v: task.type, c: LT.fg }].map(x => (
            <div key={x.l} className="rounded-2xl p-3 text-center" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
              <div className="text-lg font-black capitalize" style={{ fontFamily: "'Outfit',sans-serif", color: x.c }}>{x.v}</div>
              <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: LT.muted2 }}>{x.l}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: LT.em50, color: LT.primary }}><Icon name="wrench" size={16} /></div>
          <div><div className="text-[13px] font-bold" style={{ color: LT.fg }}>What you'll need</div><p className="text-[12px] mt-0.5" style={{ color: LT.muted }}>{task.tools}</p></div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: '#fef2ec', border: '1px solid #f6d5c6' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Icon name="shield" size={15} style={{ color: LT.warning }} />
            <span className="text-[12px] font-black uppercase tracking-wider" style={{ color: '#9a3412' }}>Safety reminder</span>
          </div>
          <p className="text-[12px] leading-relaxed font-semibold" style={{ color: '#9a3412' }}>{task.safety}</p>
        </div>
      </div>

      <div className="sticky bottom-0 px-5 py-4 bg-white/95 backdrop-blur-md border-t" style={{ borderColor: LT.border }}>
        <button onClick={() => onClaim(task)} className="w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]" style={{ background: LT.primary, color: '#fff' }}>
          Claim this task - ${task.payout}<Icon name="arrow-right" size={17} />
        </button>
      </div>
    </div>
  );
}

// ─── SUBMIT PROOF (check in -> before -> after -> submit) ──────────────────────
function SubmitProof({ task, onBack, onSubmitted }) {
  const [phase, setPhase] = useStateM('checkin'); // checkin | before | after | review
  const [before, setBefore] = useStateM(false);
  const [after, setAfter] = useStateM(false);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: LT.bg }}>
      <PushHeader title="Submit proof" onBack={onBack} />

      {/* step rail */}
      <div className="flex items-center gap-1.5 px-5 py-3 bg-white border-b" style={{ borderColor: LT.border }}>
        {['Check in', 'Before', 'After', 'Submit'].map((lbl, i) => {
          const phases = ['checkin', 'before', 'after', 'review'];
          const cur = phases.indexOf(phase);
          const done = i < cur, active = i === cur;
          return (
            <div key={lbl} className="flex items-center gap-1.5 flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full h-1 rounded-full" style={{ background: done || active ? LT.primary : '#e2e6e0' }} />
                <span className="text-[9px] font-bold" style={{ color: active ? LT.primary : LT.muted2 }}>{lbl}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-6 flex-1 flex flex-col gap-5">
        {phase === 'checkin' && (
          <>
            <div className="flex flex-col items-center text-center py-4">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: LT.em50 }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: LT.primary, color: '#fff' }}><Icon name="navigation" size={22} /></div>
                </div>
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(64,145,108,0.25)' }} />
              </div>
              <h2 className="text-xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>Check in at the task</h2>
              <p className="text-[13px] mt-2 leading-relaxed px-2" style={{ color: LT.muted }}>You're <b style={{ color: LT.success }}>{task.distance}</b> away. Head to the spot, then confirm you've arrived to start your before photo.</p>
            </div>
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
              <Icon name="map-pin" size={18} style={{ color: LT.primary }} />
              <span className="text-[13px] font-semibold" style={{ color: LT.fg }}>{task.title}</span>
            </div>
            <button onClick={() => setPhase('before')} className="w-full py-4 rounded-2xl text-[15px] font-bold mt-auto transition-all active:scale-[0.98]" style={{ background: LT.primary, color: '#fff' }}>I'm here - check in</button>
          </>
        )}

        {phase === 'before' && (
          <>
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>Before photo</h2>
              <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: LT.muted }}>Show the spot as you found it. This proves the work was needed.</p>
            </div>
            <PhotoSlot label="Before" filled={before} onTap={() => setBefore(true)} />
            <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: '#fef2ec', border: '1px solid #f6d5c6' }}>
              <Icon name="shield" size={15} style={{ color: LT.warning, flexShrink: 0, marginTop: 1 }} />
              <p className="text-[12px] leading-relaxed font-semibold" style={{ color: '#9a3412' }}>{task.safety}</p>
            </div>
            <button onClick={() => setPhase('after')} disabled={!before} className="w-full py-4 rounded-2xl text-[15px] font-bold mt-auto transition-all active:scale-[0.98]" style={{ background: before ? LT.primary : '#cbd2cb', color: '#fff' }}>
              {before ? 'Next - do the work' : 'Capture a before photo first'}
            </button>
          </>
        )}

        {phase === 'after' && (
          <>
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>After photo</h2>
              <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: LT.muted }}>Nice work. Now capture the same spot, cleaned up.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><PhotoSlot label="Before" filled={true} onTap={() => {}} /></div>
              <div><PhotoSlot label="After" filled={after} onTap={() => setAfter(true)} /></div>
            </div>
            <button onClick={() => setPhase('review')} disabled={!after} className="w-full py-4 rounded-2xl text-[15px] font-bold mt-auto transition-all active:scale-[0.98]" style={{ background: after ? LT.primary : '#cbd2cb', color: '#fff' }}>
              {after ? 'Review & submit' : 'Capture an after photo first'}
            </button>
          </>
        )}

        {phase === 'review' && (
          <>
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>Looks good?</h2>
              <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: LT.muted }}>A reviewer will check your photos. Most reviews take under an hour, then ${task.payout} is released.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Before', 'After'].map(l => <PhotoSlot key={l} label={l} filled={true} onTap={() => {}} />)}
            </div>
            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: LT.em50, border: `1px solid ${LT.em100}` }}>
              <span className="text-[13px] font-bold" style={{ color: LT.success }}>Payment on approval</span>
              <span className="text-xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color: LT.primary }}>${task.payout.toFixed(2)}</span>
            </div>
            <button onClick={onSubmitted} className="w-full py-4 rounded-2xl text-[15px] font-bold mt-auto flex items-center justify-center gap-2 transition-all active:scale-[0.98]" style={{ background: LT.primary, color: '#fff' }}>
              <Icon name="check" size={18} /> Submit for review
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── REPORT SOMETHING ───────────────────────────────────────────────────────
function ReportScreen({ onBack, onSubmitted }) {
  const [type, setType] = useStateM(null);
  const [photo, setPhoto] = useStateM(false);
  const types = [
    { id: 'litter', label: 'Litter / trash', icon: 'trash' },
    { id: 'graffiti', label: 'Graffiti / stickers', icon: 'image' },
    { id: 'planter', label: 'Dry / dead planter', icon: 'droplet' },
    { id: 'broken', label: 'Broken / unsafe', icon: 'alert-triangle' },
  ];
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: LT.bg }}>
      <PushHeader title="Report something" onBack={onBack} />
      <div className="px-5 py-5 flex flex-col gap-5 flex-1">
        <div>
          <h1 className="text-xl font-black leading-tight" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>What needs care?</h1>
          <p className="text-[13px] mt-1.5" style={{ color: LT.muted }}>Reports help create paid tasks for your block. You earn up to $3 when yours is verified.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} className="rounded-2xl p-4 flex flex-col gap-2.5 text-left transition-all active:scale-[0.98]" style={{ background: type === t.id ? LT.primary : LT.card, border: `1.5px solid ${type === t.id ? LT.primary : LT.border}` }}>
              <Icon name={t.icon} size={20} style={{ color: type === t.id ? '#fff' : LT.primary }} />
              <span className="text-[13px] font-bold" style={{ color: type === t.id ? '#fff' : LT.fg }}>{t.label}</span>
            </button>
          ))}
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: LT.muted }}>Add a photo</span>
          <div className="mt-2"><PhotoSlot label="Photo" filled={photo} onTap={() => setPhoto(true)} /></div>
        </div>
        <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: '#eef2f7', border: '1px solid #dde4ec' }}>
          <Icon name="lock" size={15} style={{ color: LT.muted, flexShrink: 0, marginTop: 1 }} />
          <p className="text-[12px] leading-relaxed" style={{ color: LT.muted }}>Your exact location is never shared publicly. Reports show only an approximate block.</p>
        </div>
      </div>
      <div className="sticky bottom-0 px-5 py-4 bg-white/95 backdrop-blur-md border-t" style={{ borderColor: LT.border }}>
        <button onClick={onSubmitted} disabled={!type} className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98]" style={{ background: type ? LT.primary : '#cbd2cb', color: '#fff' }}>
          {type ? 'Submit report' : 'Pick what needs care'}
        </button>
      </div>
    </div>
  );
}

// ─── IMPACT ─────────────────────────────────────────────────────────────────
function ImpactScreen({ onBack }) {
  const W = window.WORKER;
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-10" style={{ background: LT.bg }}>
      <PushHeader title="Your impact" onBack={onBack} />
      <div className="px-5 pt-5 pb-2">
        <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: LT.accent }}>Your impact</span>
        <h1 className="text-2xl font-black mt-1.5 leading-tight" style={{ fontFamily: "'Outfit',sans-serif", color: LT.fg }}>You're helping {W.neighborhood.split(' / ')[0]} level up.</h1>
      </div>
      <div className="px-5 flex flex-col gap-4">
        <div className="rounded-3xl p-6 text-white relative overflow-hidden" style={{ background: LT.primary }}>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#a7d8c0' }}>Lifetime contribution</span>
          <div className="flex items-end gap-2 mt-1"><span className="text-4xl font-black" style={{ fontFamily: "'Outfit',sans-serif" }}>{W.tasksDone}</span><span className="text-sm font-bold mb-1" style={{ color: '#a7d8c0' }}>tasks completed</span></div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[{ l: 'Earned', v: `$${W.lifetimeEarned.toLocaleString()}` }, { l: 'Blocks', v: W.blocksImproved }, { l: 'Quality', v: `${W.quality}%` }].map(x => (
              <div key={x.l} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="text-lg font-black" style={{ fontFamily: "'Outfit',sans-serif" }}>{x.v}</div>
                <div className="text-[10px]" style={{ color: '#a7d8c0' }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl p-5" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] font-bold" style={{ color: LT.fg }}>Level {W.level}: {W.levelLabel}</span>
            <span className="text-[12px] font-black" style={{ color: LT.accent }}>{W.progressToNext}%</span>
          </div>
          <LProgress value={W.progressToNext} color={LT.accent} height={8} />
          <p className="text-[12px] mt-2" style={{ color: LT.muted }}>{100 - W.progressToNext} points to <b style={{ color: LT.fg }}>Grove</b>. Keep completing verified tasks to level up.</p>
        </div>

        <div className="rounded-3xl p-5" style={{ background: LT.card, border: `1px solid ${LT.border}` }}>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: LT.muted }}>Badges earned</span>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {[{ i: 'flame', l: '5-day streak', on: true }, { i: 'droplet', l: 'Green thumb', on: true }, { i: 'shield-check', l: 'Verified 25', on: true }, { i: 'crown', l: 'Top 10', on: false }].map(b => (
              <div key={b.l} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: b.on ? LT.em50 : '#f1f0ec', color: b.on ? LT.primary : '#c4c9c2' }}><Icon name={b.i} size={20} /></div>
                <span className="text-[9px] font-bold leading-tight" style={{ color: b.on ? LT.fg : LT.muted2 }}>{b.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, #fff, #f5f8f5)', border: `1px solid ${LT.border}` }}>
          <div className="flex items-center gap-2 mb-1"><Icon name="heart" size={15} style={{ color: LT.accent }} /><span className="text-[13px] font-bold" style={{ color: LT.fg }}>Because of you</span></div>
          <p className="text-[13px] leading-relaxed" style={{ color: LT.muted }}>Your {W.blocksImproved} improved blocks were seen by an estimated <b style={{ color: LT.fg }}>12,400 neighbors</b> this month. Small work, real difference.</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LT, LProgress, PushHeader, PhotoSlot, Onboarding, TaskDetail, SubmitProof, ReportScreen, ImpactScreen });
