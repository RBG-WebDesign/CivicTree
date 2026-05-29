// src/app/worker/map/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WorkerNav from '@/components/WorkerNav';
import { MapPin, Search, ShieldAlert, Award, Plus, Menu, ArrowRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  payoutAmount: number;
  estimatedMinutes: number;
  requiredTools: string;
  safetyNotes: string;
  latitude: number;
  longitude: number;
  taskType: string;
  isFundingNeeded: boolean;
  isComingSoon: boolean;
}

export default function WorkerMap() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          // Filter to show tasks that are open or coming soon/funding needed on the map
          setTasks(data);
          // Set initial selection to the litter task
          const defaultTask = data.find((t: Task) => t.id === 'task-litter-oak');
          if (defaultTask) setSelectedTask(defaultTask);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    // Auto-select first matching task
    const filtered = applyFilters(tasks, filter);
    if (filtered.length > 0) {
      setSelectedTask(filtered[0]);
    } else {
      setSelectedTask(null);
    }
  };

  const applyFilters = (taskList: Task[], filter: string) => {
    return taskList.filter((t) => {
      // Only show open, coming soon, or funding needed tasks on map
      if (t.status !== 'open') return false;

      if (filter === 'quick') {
        return t.estimatedMinutes <= 20;
      }
      if (filter === 'highest_pay') {
        return t.payoutAmount >= 20;
      }
      if (filter === 'no_tools') {
        return t.requiredTools.toLowerCase().includes('none') || !t.requiredTools;
      }
      if (filter === 'verify') {
        return t.taskType === 'verify';
      }
      if (filter === 'coming_soon') {
        return t.isComingSoon;
      }
      if (filter === 'funding') {
        return t.isFundingNeeded;
      }
      return true;
    });
  };

  const visibleTasks = applyFilters(tasks, activeFilter);

  // Hardcode coordinates to SVG mapping
  // Map center is around 34.0445, -118.2505
  const getCoordinates = (lat: number, lng: number) => {
    const latMin = 34.0425;
    const latMax = 34.0465;
    const lngMin = -118.2530;
    const lngMax = -118.2475;

    // Calculate percent positions
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    // latitude is inverted on screen (y=0 is top)
    const y = (1 - (lat - latMin) / (latMax - latMin)) * 100;

    return { x: Math.min(Math.max(x, 10), 90), y: Math.min(Math.max(y, 10), 85) };
  };

  const filters = [
    { id: 'all', name: 'Nearby' },
    { id: 'quick', name: 'Quick (<20m)' },
    { id: 'highest_pay', name: 'Highest pay' },
    { id: 'no_tools', name: 'No tools' },
    { id: 'verify', name: 'Verify' },
    { id: 'coming_soon', name: 'Coming soon' },
    { id: 'funding', name: 'Needs funding' },
  ];

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-24 relative">
      {/* Map Header */}
      <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Menu size={16} className="text-[#666]" />
          <span className="text-xs font-extrabold text-foreground font-heading">Downtown LA Map</span>
          <span className="bg-[#e8f5e9] text-[#1b4332] text-[10px] px-2 py-0.5 rounded-full font-bold">
            {visibleTasks.length} tasks
          </span>
        </div>
        <Link href="/worker/report" className="text-muted hover:text-foreground">
          <Plus size={18} />
        </Link>
      </div>

      {/* Filter Chips Scrollbar */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5 bg-slate-50 border-b border-border scrollbar-none shrink-0">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFilterChange(f.id)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border cursor-pointer ${
              activeFilter === f.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white border-border text-muted hover:border-slate-300'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Area */}
      <div className="flex-1 bg-[#f4f3ed] relative overflow-hidden min-h-[300px]">
        {/* Streets Pattern Mockup */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.25]" xmlns="http://www.w3.org/2000/svg">
          {/* Main vertical streets */}
          <line x1="20%" y1="0%" x2="20%" y2="100%" stroke="#ffffff" strokeWidth="12" />
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#ffffff" strokeWidth="16" />
          <line x1="80%" y1="0%" x2="80%" y2="100%" stroke="#ffffff" strokeWidth="12" />
          {/* Main horizontal corridors */}
          <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="#ffffff" strokeWidth="16" />
          <line x1="0%" y1="65%" x2="100%" y2="65%" stroke="#ffffff" strokeWidth="12" />
          <line x1="0%" y1="85%" x2="100%" y2="85%" stroke="#ffffff" strokeWidth="10" />
        </svg>

        {/* Depots: Spring Street Depot (fixed coordinates) */}
        <div 
          className="absolute group cursor-pointer"
          style={{ left: '42%', top: '35%' }}
          onClick={() => alert('Spring Street Depot: Open until 5 PM. Pick up cleanup kits here.')}
        >
          <div className="w-6 h-6 rounded-lg bg-orange-600 border border-white text-white flex items-center justify-center font-bold text-[9px] shadow-md">
            D
          </div>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-50">
            Spring St Depot
          </span>
        </div>

        {/* Campaign Broadway boundary polygon mockup */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-emerald-500/10 border-2 border-emerald-500/30 m-8 rounded-[2rem]" />

        {/* User Location Dot (Downtown LA) */}
        <div className="absolute left-[45%] top-[55%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md z-10" />
          <div className="w-8 h-8 rounded-full bg-blue-400/30 absolute animate-ping pointer-events-none" />
        </div>

        {/* Task pins */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/60">
            <span className="text-xs font-bold text-foreground">No tasks right here.</span>
            <span className="text-[10px] text-muted mt-1">Try zooming out or check back later.</span>
            <Link 
              href="/worker/report"
              className="mt-4 bg-[#1b4332] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
            >
              Report a problem
            </Link>
          </div>
        ) : (
          visibleTasks.map((t) => {
            const { x, y } = getCoordinates(t.latitude, t.longitude);
            const isSelected = selectedTask?.id === t.id;
            
            // Choose color based on status/type
            let pinColor = 'bg-[#1b4332]';
            if (t.isComingSoon) pinColor = 'bg-blue-600';
            if (t.isFundingNeeded) pinColor = 'bg-amber-600';
            if (t.taskType === 'verify') pinColor = 'bg-emerald-600';

            return (
              <button
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 border-white shadow-md transition-all cursor-pointer ${pinColor} ${
                  isSelected ? 'w-8 h-8 scale-125 z-30 ring-2 ring-primary/40' : 'w-6 h-6 z-20 hover:scale-110'
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <MapPin size={isSelected ? 14 : 11} className="text-white" />
              </button>
            );
          })
        )}
      </div>

      {/* Floating Selected Task Preview Card */}
      {selectedTask && (
        <div className="absolute bottom-16 left-4 right-4 bg-white border border-border p-4 rounded-3xl shadow-xl z-40 flex items-center gap-4 transition-all animate-in slide-in-from-bottom-2">
          {/* Visual Category Icon */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center shrink-0 border border-emerald-100">
            <MapPin size={22} className="text-[#2d6a4f]" />
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-foreground truncate font-heading leading-none">
                {selectedTask.title}
              </h3>
            </div>
            
            <div className="flex gap-2 items-center text-[10px] text-muted mt-1.5">
              <span>0.2 mi away</span>
              <span>&bull;</span>
              <span>{selectedTask.estimatedMinutes} min</span>
              <span>&bull;</span>
              <span className="font-semibold text-emerald-800">
                {selectedTask.isComingSoon 
                  ? 'Coming Soon' 
                  : selectedTask.isFundingNeeded 
                    ? 'Needs Sponsor' 
                    : 'Beginner-safe'}
              </span>
            </div>
          </div>

          {/* Right Payout Tag & Link */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="text-sm font-black text-primary font-heading">
              ${selectedTask.payoutAmount.toFixed(2)}
            </span>
            <Link
              href={
                selectedTask.isComingSoon || selectedTask.isFundingNeeded
                  ? '#'
                  : `/worker/task/${selectedTask.id}`
              }
              className={`text-[9px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-0.5 ${
                selectedTask.isComingSoon || selectedTask.isFundingNeeded
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-hover'
              }`}
            >
              View
              <ArrowRight size={8} />
            </Link>
          </div>
        </div>
      )}

      <WorkerNav />
    </div>
  );
}
