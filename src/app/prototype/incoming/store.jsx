import * as React from 'react';
// app/store.jsx - shared reactive store for the full CivicTree loop.
// Both the admin (desktop) and worker (mobile) surfaces read/write this.
// Report -> review -> fund -> publish -> accept -> check in -> active -> proof -> approve -> paid -> map updates.

(function () {
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => fn());
  const now = () => 'just now';

  // ── Seed: tasks across the DTLA operations area ────────────────────────────
  // status: needs-funding | open | assigned | in_progress | submitted | approved
  const tasks = [
    { id: 't1', title: 'Clear loose trash on Oak St', type: 'cleanup', status: 'open', payout: 18, budget: 30, fundingSource: 'DTLA Cleanup Fund', minutes: 25, tools: 'Gloves + bags from Spring St Depot', safetyTier: 'Beginner-safe', proof: ['Before photo', 'After photo', 'Bag count'], deadline: 'Today, 6 PM', approver: 'Admin - Rosa', worker: null, x: 31, y: 34, street: '700 Oak St', neighborhood: 'Downtown', fromReport: false },
    { id: 't2', title: 'Water planters - Broadway route', type: 'green', status: 'in_progress', payout: 24, budget: 38, fundingSource: 'City of LA', minutes: 35, tools: 'Watering can at depot', safetyTier: 'Beginner-safe', proof: ['Before photo', 'After photo'], deadline: 'Today, 5 PM', approver: 'Admin - Rosa', worker: 'Maria R.', x: 58, y: 28, street: '5th & Broadway', neighborhood: 'Downtown', fromReport: false },
    { id: 't3', title: 'Remove stickers - signal box', type: 'cleanup', status: 'open', payout: 12, budget: 20, fundingSource: 'DTLA Cleanup Fund', minutes: 15, tools: 'Scraper at depot', safetyTier: 'Beginner-safe', proof: ['Before photo', 'After photo'], deadline: 'Tomorrow', approver: 'Admin - Rosa', worker: null, x: 44, y: 58, street: '6th & Main', neighborhood: 'Downtown', fromReport: true },
    { id: 't4', title: 'Sidewalk sweep - Spring St', type: 'cleanup', status: 'approved', payout: 20, budget: 32, fundingSource: 'City of LA', minutes: 28, tools: 'Broom + bags', safetyTier: 'Beginner-safe', proof: ['Before photo', 'After photo'], deadline: 'Done', approver: 'Admin - Rosa', worker: 'Carlos T.', x: 72, y: 62, street: '4th & Spring', neighborhood: 'Downtown', fromReport: false, bags: 2 },
    { id: 't5', title: 'Planter refresh - Hill St', type: 'green', status: 'assigned', payout: 22, budget: 34, fundingSource: 'Friends of DTLA', minutes: 30, tools: 'Soil + watering can', safetyTier: 'Beginner-safe', proof: ['Before photo', 'After photo'], deadline: 'Today, 7 PM', approver: 'Admin - Rosa', worker: 'Priya K.', x: 24, y: 72, street: '3rd & Hill', neighborhood: 'Downtown', fromReport: false },
    { id: 't6', title: 'Trash pickup - Pershing edge', type: 'cleanup', status: 'open', payout: 16, budget: 26, fundingSource: 'DTLA Cleanup Fund', minutes: 18, tools: 'Gloves + bags', safetyTier: 'Beginner-safe', proof: ['Before photo', 'After photo', 'Bag count'], deadline: 'Today, 8 PM', approver: 'Admin - Rosa', worker: null, x: 64, y: 46, street: '5th & Olive', neighborhood: 'Downtown', fromReport: false },
    { id: 't7', title: 'Alley clear - Werdin Pl', type: 'cleanup', status: 'submitted', payout: 26, budget: 40, fundingSource: 'DTLA Cleanup Fund', minutes: 40, tools: 'Gloves + bags', safetyTier: 'Standard', proof: ['Before photo', 'After photo', 'Bag count'], deadline: 'Today', approver: 'Admin - Rosa', worker: 'Dana W.', x: 50, y: 84, street: 'Werdin Pl', neighborhood: 'Downtown', fromReport: true, bags: 3, notes: 'Cleared the full alley, 3 bags staged at the pickup point.' },
  ];

  // ── Seed: resident reports awaiting triage ─────────────────────────────────
  // status: new | approved | rejected | needs-funding-report
  const reports = [
    { id: 'r1', kind: 'litter', what: 'Overflowing bin + scattered trash', reporter: 'Resident - Jordan', when: '12m ago', x: 40, y: 22, street: '7th & Main', neighborhood: 'Downtown', note: 'Bin by the bus stop is overflowing onto the sidewalk. Gets worse at rush hour.', safetyFlag: false, duplicate: 'Low', suggestedType: 'cleanup', status: 'new' },
    { id: 'r2', kind: 'graffiti', what: 'Tagging on utility box', reporter: 'Resident - Priya', when: '38m ago', x: 52, y: 70, street: '6th & Spring', neighborhood: 'Downtown', note: 'Fresh tags covering the whole signal cabinet on the SW corner.', safetyFlag: false, duplicate: 'None', suggestedType: 'cleanup', status: 'new' },
    { id: 'r3', kind: 'planter', what: 'Dry / dying street planters', reporter: 'Crew - Soto St', when: '1h ago', x: 78, y: 36, street: '4th & Grand', neighborhood: 'Downtown', note: 'Row of 6 planters looks parched. A couple already browning.', safetyFlag: false, duplicate: 'Low', suggestedType: 'green', status: 'new' },
    { id: 'r4', kind: 'broken', what: 'Broken trash can lid', reporter: 'Resident - Dana', when: '2h ago', x: 18, y: 48, street: '8th & Hill', neighborhood: 'Downtown', note: 'Lid is cracked off and trash blows out. Not hazardous, just messy.', safetyFlag: false, duplicate: 'None', suggestedType: 'cleanup', status: 'new' },
    { id: 'r5', kind: 'unsafe', what: 'Sharps near planter - do not touch', reporter: 'Resident - anon', when: '3h ago', x: 36, y: 64, street: '5th & Wall', neighborhood: 'Downtown', note: 'Looks like needles by the tree well. Flagging so a pro can handle it.', safetyFlag: true, duplicate: 'None', suggestedType: 'professional', status: 'new' },
  ];

  const worker = { name: 'Austin', last: 'V.', neighborhood: 'Downtown', available: 24, pending: 18, lifetimePaid: 1040, tasksDone: 38, quality: 98, blocksImproved: 8 };

  const activity = [
    { time: '2m ago', text: 'Litter cleared on Broadway & 7th', neighborhood: 'Downtown', amount: 18 },
    { time: '31m ago', text: 'Report verified on 7th & Main', neighborhood: 'Downtown', amount: 3 },
    { time: '45m ago', text: 'Trash cleared near Culver City Arts Center', neighborhood: 'Culver City', amount: 22 },
  ];

  const REPORT_KIND = {
    litter: { icon: 'trash', label: 'Trash' }, graffiti: { icon: 'image', label: 'Graffiti' },
    planter: { icon: 'droplet', label: 'Dead planter' }, broken: { icon: 'alert-triangle', label: 'Broken fixture' },
    sticker: { icon: 'image', label: 'Sticker removal' }, dirty: { icon: 'trash', label: 'Dirty alley' },
    unsafe: { icon: 'alert-circle', label: 'Unsafe item' }, other: { icon: 'help-circle', label: 'Other' },
  };

  const log = (text, neighborhood = 'Downtown', amount = null) => activity.unshift({ time: now(), text, neighborhood, amount });

  const store = {
    tasks, reports, worker, activity, REPORT_KIND,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    // worker submits a report (mobile Report flow)
    submitReport({ kind, note, street }) {
      const r = { id: 'r-' + Date.now(), kind, what: note || REPORT_KIND[kind]?.label || 'Reported issue', reporter: 'Resident - Austin', when: 'just now', x: 42 + Math.random() * 16, y: 30 + Math.random() * 30, street: street || 'Near you, DTLA', neighborhood: 'Downtown', note: note || '', safetyFlag: kind === 'unsafe', duplicate: 'None', suggestedType: kind === 'planter' ? 'green' : 'cleanup', status: 'new' };
      reports.unshift(r); log('New resident report received - awaiting triage'); emit(); return r;
    },

    // admin approves a report into a task (with funding decision)
    publishTaskFromReport(reportId, fields) {
      const r = reports.find(x => x.id === reportId); if (!r) return null;
      const funded = !!fields.fundingSource;
      const t = {
        id: 'nt-' + Date.now(), title: fields.title, type: fields.type, status: funded ? 'open' : 'needs-funding',
        payout: fields.payout, budget: fields.budget, fundingSource: fields.fundingSource || null,
        minutes: fields.minutes, tools: fields.tools, safetyTier: fields.safetyTier, proof: fields.proof,
        deadline: fields.deadline, approver: 'Admin - Rosa', worker: null,
        x: r.x, y: r.y, street: r.street, neighborhood: r.neighborhood, fromReport: true,
      };
      tasks.push(t);
      r.status = 'approved';
      const idx = reports.indexOf(r); if (idx > -1) reports.splice(idx, 1);
      log(funded ? `Task published at ${r.street}` : `Task queued (needs funding) at ${r.street}`);
      emit(); return t;
    },

    dismissReport(reportId) {
      const i = reports.findIndex(x => x.id === reportId); if (i > -1) { reports.splice(i, 1); emit(); }
    },

    fundTask(taskId, source) {
      const t = tasks.find(x => x.id === taskId); if (!t) return;
      t.fundingSource = source; t.status = 'open'; log(`Task funded by ${source} - now live`); emit();
    },

    acceptTask(taskId, who) {
      const t = tasks.find(x => x.id === taskId); if (!t || t.status !== 'open') return;
      t.worker = who; t.status = 'assigned'; t.startBy = 'within 30 min'; t.finishBy = 'within 90 min';
      log(`${who} accepted: ${t.title}`); emit();
    },

    checkIn(taskId) {
      const t = tasks.find(x => x.id === taskId); if (!t) return;
      t.status = 'in_progress'; t.beforePhoto = true; emit();
    },

    submitProof(taskId, { bags, notes }) {
      const t = tasks.find(x => x.id === taskId); if (!t) return;
      t.status = 'submitted'; t.bags = bags; t.notes = notes; t.afterPhoto = true;
      if (t.worker && t.worker.startsWith(worker.name)) worker.pending += t.payout;
      log(`Proof submitted: ${t.title}`); emit();
    },

    approveTask(taskId) {
      const t = tasks.find(x => x.id === taskId); if (!t) return;
      t.status = 'approved';
      if (t.worker && t.worker.startsWith(worker.name)) { worker.pending = Math.max(0, worker.pending - t.payout); worker.available += t.payout; worker.tasksDone += 1; }
      log(`Approved & paid $${t.payout}: ${t.title}`, t.neighborhood, t.payout); emit();
    },

    rejectTask(taskId) {
      const t = tasks.find(x => x.id === taskId); if (!t) return;
      if (t.worker && t.worker.startsWith(worker.name)) worker.pending = Math.max(0, worker.pending - t.payout);
      t.status = 'open'; t.worker = null; t.bags = null; t.afterPhoto = false;
      log(`Sent back for more proof: ${t.title}`); emit();
    },
  };

  window.CivicStore = store;

  // React hook
  window.useStore = function useStore() {
    const [, force] = React.useState(0);
    React.useEffect(() => store.subscribe(() => force(n => n + 1)), []);
    return store;
  };

  // status display config
  window.STATUS_CFG = {
    'needs-funding': { label: 'Needs Funding', color: '#f87171' },
    'open':          { label: 'Open',          color: '#22c55e' },
    'assigned':      { label: 'Assigned',       color: '#a78bfa' },
    'in_progress':   { label: 'In Progress',    color: '#60a5fa' },
    'submitted':     { label: 'Submitted',      color: '#fbbf24' },
    'approved':      { label: 'Approved - Paid', color: '#34d399' },
  };
})();
