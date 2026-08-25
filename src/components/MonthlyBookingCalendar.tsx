import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Sparkles,
  Check,
  Plane,
  Sun,
  Sunset,
  Moon,
  Info,
} from 'lucide-react';

interface MonthlyBookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:mm
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

interface TimeSlot {
  time: string;
  label?: string;
  period: 'morning' | 'afternoon' | 'evening';
  available: boolean;
  statusText?: string;
}

export const MonthlyBookingCalendar: React.FC<MonthlyBookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}) => {
  // Parse initial selected date or fallback to tomorrow/today
  const initialDate = useMemo(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number);
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, [selectedDate]);

  // Calendar view month & year state
  const [viewDate, setViewDate] = useState<Date>(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [customTimeInput, setCustomTimeInput] = useState<string>('');
  const [showCustomTime, setShowCustomTime] = useState<boolean>(false);
  const [activePeriodFilter, setActivePeriodFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const d = new Date();
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    const formatted = d.toISOString().split('T')[0];
    onDateChange(formatted);
  };

  // Build grid of days for the view month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month overflow days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days = [];

    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: false,
        isPast: d < today,
        dateString: d.toISOString().split('T')[0],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: true,
        isPast: d < today,
        dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      });
    }

    // Next month overflow days to complete 35 or 42 grid slots
    const remainingSlots = 42 - days.length > 7 ? 35 - days.length : 42 - days.length;
    const targetLength = days.length <= 35 ? 35 : 42;
    const needed = targetLength - days.length;

    for (let day = 1; day <= needed; day++) {
      const d = new Date(year, month + 1, day);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d,
        isCurrentMonth: false,
        isPast: d < today,
        dateString: d.toISOString().split('T')[0],
      });
    }

    return days;
  }, [viewDate, today]);

  // Master available departure slots for the Chevrolet Spin
  const availableSlots: TimeSlot[] = useMemo(() => {
    return [
      // Morning
      { time: '06:00', label: 'Madrugada / Aeroporto', period: 'morning', available: true, statusText: 'Transfer Livre' },
      { time: '07:30', label: 'Início Manhã', period: 'morning', available: true, statusText: 'Horário Nobre' },
      { time: '09:00', label: 'Manhã', period: 'morning', available: true, statusText: 'Transfer Livre' },
      { time: '10:30', label: 'Meio-dia', period: 'morning', available: true, statusText: 'Disponível' },

      // Afternoon
      { time: '12:00', label: 'Almoço', period: 'afternoon', available: true, statusText: 'Disponível' },
      { time: '13:30', label: 'Início Tarde', period: 'afternoon', available: true, statusText: 'Transfer Livre' },
      { time: '15:00', label: 'Tarde', period: 'afternoon', available: true, statusText: 'Horário Nobre' },
      { time: '16:30', label: 'Fim de Tarde', period: 'afternoon', available: true, statusText: 'Disponível' },
      { time: '17:30', label: 'Pôr do Sol', period: 'afternoon', available: true, statusText: 'Transfer Livre' },

      // Evening / Night
      { time: '19:00', label: 'Início Noite', period: 'evening', available: true, statusText: 'Disponível' },
      { time: '20:30', label: 'Noite', period: 'evening', available: true, statusText: 'Transfer Livre' },
      { time: '22:00', label: 'Voo Noturno', period: 'evening', available: true, statusText: 'Recomendado GRU' },
      { time: '23:30', label: 'Madrugada', period: 'evening', available: true, statusText: 'Plantão Noturno' },
    ];
  }, []);

  const filteredSlots = useMemo(() => {
    if (activePeriodFilter === 'all') return availableSlots;
    return availableSlots.filter((slot) => slot.period === activePeriodFilter);
  }, [availableSlots, activePeriodFilter]);

  // Formatted date details for selected day
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-').map(Number);
    if (parts.length !== 3) return selectedDate;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTimeInput) {
      onTimeChange(customTimeInput);
      setShowCustomTime(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Calendar & Hours Grid - Two Column Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* LEFT: Compact Minimalist Monthly Calendar (7 Cols on desktop) */}
        <div className="lg:col-span-7 p-4 sm:p-5">
          {/* Header Month / Year & Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif-display font-bold text-base text-slate-900 leading-tight">
                  {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  Selecione a data de embarque
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer mr-1"
                title="Ir para o mês atual"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer active:scale-95"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer active:scale-95"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDayLabels.map((wd, i) => (
              <div
                key={i}
                className={`text-[11px] font-bold py-1 ${
                  i === 0 || i === 6 ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, index) => {
              const isSelected = item.dateString === selectedDate;
              const isToday =
                item.date.getDate() === today.getDate() &&
                item.date.getMonth() === today.getMonth() &&
                item.date.getFullYear() === today.getFullYear();

              const dayOfWeek = item.date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              let buttonClass = 'relative h-9 w-full rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ';

              if (item.isPast) {
                buttonClass += 'text-slate-300 bg-transparent cursor-not-allowed opacity-40 ';
              } else if (isSelected) {
                buttonClass += 'bg-slate-900 text-amber-400 font-bold ring-2 ring-amber-400 shadow-sm scale-105 z-10 ';
              } else if (!item.isCurrentMonth) {
                buttonClass += 'text-slate-300 hover:text-slate-600 hover:bg-slate-50 ';
              } else {
                buttonClass += isWeekend
                  ? 'text-slate-900 hover:bg-amber-50 hover:text-amber-900 '
                  : 'text-slate-800 hover:bg-slate-100 ';
              }

              return (
                <button
                  key={index}
                  type="button"
                  disabled={item.isPast}
                  onClick={() => onDateChange(item.dateString)}
                  className={buttonClass}
                >
                  <span className="relative">
                    {item.date.getDate()}
                    {isToday && !isSelected && (
                      <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </span>
                  {/* Subtle availability dot for future current-month dates */}
                  {!item.isPast && item.isCurrentMonth && !isSelected && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isWeekend ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mini Legend & Quick Info */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Saída Imediata</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>Fim de Semana (Alta Procura)</span>
              </span>
            </div>
            <span className="text-slate-400">Atendimento 24h</span>
          </div>
        </div>

        {/* RIGHT: Available Hours / Time Slots Picker (5 Cols on desktop) */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/50 flex flex-col justify-between">
          <div>
            {/* Header for Time Slots */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <h4 className="font-serif-display font-bold text-sm text-slate-900">
                  Horários Disponíveis
                </h4>
              </div>
              <span className="text-[11px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full">
                {selectedTime}
              </span>
            </div>

            {/* Time Period Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-3 text-[10px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActivePeriodFilter('all')}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  activePeriodFilter === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setActivePeriodFilter('morning')}
                className={`py-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  activePeriodFilter === 'morning' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Manhã</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePeriodFilter('afternoon')}
                className={`py-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  activePeriodFilter === 'afternoon' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Sunset className="w-3 h-3 text-orange-500" />
                <span>Tarde</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePeriodFilter('evening')}
                className={`py-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  activePeriodFilter === 'evening' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-500" />
                <span>Noite</span>
              </button>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {filteredSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => onTimeChange(slot.time)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-amber-400 shadow-sm ring-1 ring-amber-400'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                    }`}
                  >
                    <div>
                      <span className={`font-mono text-xs font-extrabold block ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>
                        {slot.time}
                      </span>
                      <span className={`text-[9px] block ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {slot.label}
                      </span>
                    </div>

                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Time Input Toggle */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/70">
              {!showCustomTime ? (
                <button
                  type="button"
                  onClick={() => setShowCustomTime(true)}
                  className="w-full text-[11px] text-sky-700 hover:text-sky-900 font-bold flex items-center justify-center gap-1 py-1 cursor-pointer"
                >
                  <Plane className="w-3 h-3" />
                  <span>Precisa de outro horário específico para voo?</span>
                </button>
              ) : (
                <form onSubmit={handleCustomTimeSubmit} className="flex gap-1.5 items-center">
                  <input
                    type="time"
                    value={customTimeInput || selectedTime}
                    onChange={(e) => setCustomTimeInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Definir
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomTime(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Minimalist Selection Confirmation Bar */}
          <div className="mt-3 bg-white p-2.5 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold text-slate-900 block truncate text-[11px]">
                  {selectedDateFormatted || selectedDate}
                </span>
                <span className="text-[10px] text-slate-500">
                  Partida confirmada às <strong className="text-slate-800">{selectedTime}</strong>
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
              Spin 7L Pronta
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
