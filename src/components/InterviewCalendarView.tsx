import React, { useState, useMemo } from 'react';
import { InterviewSession } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Video,
  Mic,
  FileText,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  BrainCircuit,
  TrendingUp,
} from 'lucide-react';

interface InterviewCalendarViewProps {
  sessions: InterviewSession[];
  onViewSession: (session: InterviewSession) => void;
  onStartNewInterview: () => void;
}

export const InterviewCalendarView: React.FC<InterviewCalendarViewProps> = ({
  sessions,
  onViewSession,
  onStartNewInterview,
}) => {
  // Determine initial month based on latest session date or current date
  const initialDate = useMemo(() => {
    if (sessions.length > 0) {
      const dates = sessions.map((s) => new Date(s.date).getTime()).filter((t) => !isNaN(t));
      if (dates.length > 0) {
        return new Date(Math.max(...dates));
      }
    }
    return new Date();
  }, [sessions]);

  const [currentDate, setCurrentDate] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  // Filter Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesMode = modeFilter === 'all' || s.mode === modeFilter;
      const matchesSearch =
        !searchQuery ||
        s.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.executiveSummary?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMode && matchesSearch;
    });
  }, [sessions, modeFilter, searchQuery]);

  // Map sessions by Date String YYYY-MM-DD
  const sessionsByDate = useMemo(() => {
    const map: Record<string, InterviewSession[]> = {};
    filteredSessions.forEach((s) => {
      const d = new Date(s.date);
      if (!isNaN(d.getTime())) {
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(s);
      }
    });
    return map;
  }, [filteredSessions]);

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0-6
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: {
      date: Date;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      sessions: InterviewSession[];
    }[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        dateKey,
        isCurrentMonth: false,
        isToday: false,
        sessions: sessionsByDate[dateKey] || [],
      });
    }

    // Current month days
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(today.getDate()).padStart(2, '0')}`;

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        dateKey,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        sessions: sessionsByDate[dateKey] || [],
      });
    }

    // Next month padding to fill complete grid rows (42 days total)
    const totalSoFar = days.length;
    const remainingDays = (7 - (totalSoFar % 7)) % 7;
    for (let day = 1; day <= remainingDays; day++) {
      const d = new Date(currentYear, currentMonth + 1, day);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        dateKey,
        isCurrentMonth: false,
        isToday: false,
        sessions: sessionsByDate[dateKey] || [],
      });
    }

    return days;
  }, [currentYear, currentMonth, sessionsByDate]);

  // Selected date sessions
  const selectedDateKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;

  const selectedDaySessions = selectedDateKey ? sessionsByDate[selectedDateKey] || [] : [];

  // Monthly stats
  const monthStats = useMemo(() => {
    const monthSessions = filteredSessions.filter((s) => {
      const d = new Date(s.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const total = monthSessions.length;
    const avgScore =
      total > 0
        ? Math.round(monthSessions.reduce((acc, curr) => acc + curr.overallScore, 0) / total)
        : 0;
    const topScore =
      total > 0 ? Math.max(...monthSessions.map((s) => s.overallScore)) : 0;

    return { total, avgScore, topScore };
  }, [filteredSessions, currentYear, currentMonth]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'video':
        return <Video className="w-3 h-3 text-indigo-400" />;
      case 'voice':
        return <Mic className="w-3 h-3 text-emerald-400" />;
      default:
        return <FileText className="w-3 h-3 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls & Monthly Summary Stats */}
      <div className="p-6 rounded-3xl bg-[#030816] border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>{monthNames[currentMonth]} {currentYear}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                  {filteredSessions.length} Total Sessions
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Schedule & historical interview timeline visualization.
              </p>
            </div>
          </div>

          {/* Month Navigation & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
            >
              Today
            </button>
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-mono font-bold text-slate-200">
                {monthNames[currentMonth].substring(0, 3)} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Modes</option>
                <option value="video">Live Video</option>
                <option value="voice">AI Voice</option>
                <option value="text">Technical Text</option>
              </select>
            </div>
          </div>
        </div>

        {/* Month Analytics Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Interviews This Month</span>
              <p className="text-xl font-mono font-bold text-white">{monthStats.total}</p>
            </div>
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Month Avg Score</span>
              <p className="text-xl font-mono font-bold text-indigo-400">{monthStats.avgScore}%</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Top Performance</span>
              <p className="text-xl font-mono font-bold text-emerald-400">{monthStats.topScore}%</p>
            </div>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Grid & Selected Day Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 Cols on large screens) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#030816] border border-slate-800 space-y-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {dayNames.map((day) => (
              <div
                key={day}
                className="py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800/50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              const isSelected =
                selectedDateKey &&
                cell.dateKey === selectedDateKey;
              const hasSessions = cell.sessions.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`min-h-[90px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                      : cell.isCurrentMonth
                      ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                      : 'bg-slate-950/20 border-slate-800/30 opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : cell.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>

                    {hasSessions && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </div>

                  {/* Sessions Pills in Day Cell */}
                  <div className="space-y-1 mt-1">
                    {cell.sessions.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(cell.date);
                          onViewSession(s);
                        }}
                        className="p-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/80 text-[10px] font-medium text-slate-200 truncate flex items-center justify-between gap-1 transition-all group"
                        title={`${s.jobTitle} - ${s.overallScore}%`}
                      >
                        <span className="truncate flex items-center space-x-1">
                          {getModeIcon(s.mode)}
                          <span className="truncate font-semibold">{s.jobTitle}</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-300 text-[9px] px-1 bg-indigo-900/90 rounded">
                          {s.overallScore}%
                        </span>
                      </div>
                    ))}
                    {cell.sessions.length > 2 && (
                      <p className="text-[9px] font-mono text-slate-400 text-right pr-1">
                        +{cell.sessions.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-[#030816] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Selected Date'}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                {selectedDaySessions.length} Session(s)
              </span>
            </div>

            {selectedDaySessions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <BrainCircuit className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">No interviews recorded on this date</p>
                <p className="text-[11px] text-slate-500">
                  Select another day with a blue indicator or practice a new interview session.
                </p>
                <button
                  onClick={onStartNewInterview}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs transition-all inline-flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Practice Session</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {selectedDaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getModeIcon(session.mode)}
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {session.jobTitle}
                        </span>
                      </div>
                      <span className="text-sm font-mono font-extrabold text-indigo-400">
                        {session.overallScore}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      <span>•</span>
                      <span className="uppercase text-emerald-400 font-bold">{session.mode} Mode</span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      {session.executiveSummary || 'Completed AI interview evaluation.'}
                    </p>

                    <button
                      onClick={() => onViewSession(session)}
                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20"
                    >
                      <span>View Full Evaluation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
