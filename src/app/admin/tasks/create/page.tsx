// src/app/admin/tasks/create/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, CheckSquare, Users, DollarSign, ArrowRight, Save, X } from 'lucide-react';
import CivicTreeLogo from '@/components/CivicTreeLogo';
import { useDemoStore } from '@/lib/demo/store';
import { useToast } from '@/components/demo/Toast';

export default function AdminCreateTask() {
  const router = useRouter();
  const createTask = useDemoStore((s) => s.createTask);
  const { notify } = useToast();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('28.00');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');
  const [requiredTools, setRequiredTools] = useState('gloves, bags, grabber, vest');
  const [safetyNotes, setSafetyNotes] = useState('Team recommended. Do not touch needles, human waste, or confront anyone.');
  const [doList, setDoList] = useState('Pick up loose trash, Fill bags, Place bags at marked pickup spot');
  const [dontList, setDontList] = useState('Do not touch needles, Do not touch human waste, Do not enter private property');
  const [latitude, setLatitude] = useState('34.0456');
  const [longitude, setLongitude] = useState('-118.2505');

  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPayout = parseFloat(payoutAmount);
    const parsedMinutes = parseInt(estimatedMinutes, 10);

    if (!title.trim() || !description.trim() || isNaN(parsedPayout) || parsedPayout < 10 || isNaN(parsedMinutes)) {
      notify('Fill in title, description, payout of at least $10, and time.', 'error');
      return;
    }

    setSaving(true);

    createTask({
      title: title.trim(),
      description: description.trim(),
      payoutAmount: parsedPayout,
      estimatedMinutes: parsedMinutes,
      requiredTools: requiredTools.split(',').map((s) => s.trim()).filter(Boolean),
      safetyNotes: safetyNotes.trim(),
      doList: doList.split(',').map((s) => s.trim()).filter(Boolean),
      dontList: dontList.split(',').map((s) => s.trim()).filter(Boolean),
      location: {
        lat: parseFloat(latitude) || 34.0456,
        lng: parseFloat(longitude) || -118.2505,
      },
    });

    notify('Task created and added to the map.', 'success');
    router.push('/worker/map');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-primary text-white shrink-0 p-6 flex flex-col gap-8">
        <Link href="/dashboard" aria-label="CivicTree command center" className="inline-flex">
          <CivicTreeLogo size="sm" tone="dark" className="h-9 w-[119px]" />
        </Link>

        <nav className="flex flex-col gap-1.5 text-sm font-medium">
          <Link
            href="/admin/submissions"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/30 transition-all"
          >
            <CheckSquare size={16} />
            Submissions Review
          </Link>
          <Link
            href="/admin/tasks/create"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-950/40 text-emerald-100 transition-all"
          >
            <Plus size={16} />
            Create Task
          </Link>
          <Link
            href="/worker/today"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/30 transition-all border-t border-emerald-800/30 mt-4 pt-4"
          >
            <ArrowRight size={16} />
            Switch to Worker View
          </Link>
        </nav>

        <div className="mt-auto text-[10px] text-emerald-300/60 font-medium">
          Downtown LA Pilot Console &bull; v1.0
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-3xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-foreground font-heading">Create New Task</h1>
            <p className="text-xs text-muted mt-1">Add a new paid civic task to the worker map.</p>
          </div>
          <Link
            href="/admin/submissions"
            className="border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <X size={14} />
            Cancel
          </Link>
        </div>

        {/* Task Creation Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading pb-3 border-b border-slate-100">
            Task Configuration
          </h3>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Task Title (Required)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean loose trash on Harlem Place alley segment B"
              className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Task Description (Required)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a clear, brief description of what the work involves..."
              className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
              required
            />
          </div>

          {/* Payout & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="payout" className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Payout Amount ($ USD, $10 minimum)
              </label>
              <input
                type="number"
                step="0.01"
                id="payout"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="28.00"
                min="10"
                className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="minutes" className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Estimated Duration (Minutes) (Required)
              </label>
              <input
                type="number"
                id="minutes"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="30"
                className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
                required
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lat" className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Latitude Coordinate (Required)
              </label>
              <input
                type="text"
                id="lat"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="34.0456"
                className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lng" className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Longitude Coordinate (Required)
              </label>
              <input
                type="text"
                id="lng"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-118.2505"
                className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
                required
              />
            </div>
          </div>

          {/* Required Tools */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tools" className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Required Tools (Comma-separated)
            </label>
            <input
              type="text"
              id="tools"
              value={requiredTools}
              onChange={(e) => setRequiredTools(e.target.value)}
              placeholder="gloves, bags, grabber, vest"
              className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
            />
          </div>

          {/* Safety Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="safety" className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Safety Notes / Warning Guidelines
            </label>
            <textarea
              id="safety"
              rows={2}
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              placeholder="e.g. Do not touch needles. Report human waste."
              className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
            />
          </div>

          {/* Do List & Don't List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="do" className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Do List (Comma-separated checklist)
              </label>
              <textarea
                id="do"
                rows={3}
                value={doList}
                onChange={(e) => setDoList(e.target.value)}
                placeholder="Pick up loose trash, Fill bags, Place bags at marked pickup spot"
                className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dont" className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Do Not List (Comma-separated warnings)
              </label>
              <textarea
                id="dont"
                rows={3}
                value={dontList}
                onChange={(e) => setDontList(e.target.value)}
                placeholder="Do not touch needles, Do not touch human waste, Do not enter private property"
                className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/50"
              />
            </div>
          </div>

          {/* Save Action */}
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 text-xs font-heading"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Task...
              </>
            ) : (
              <>
                <Save size={14} />
                Publish Task
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
