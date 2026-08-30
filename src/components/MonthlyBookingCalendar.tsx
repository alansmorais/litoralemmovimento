import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Check,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface MonthlyBookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:mm
  origin?: string;
  destination?: string;
  tripType?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

interface TimeSlot {
  time: string;
  label: string;
  periodName: string;
  isAdjusted?: boolean;
}

export const MonthlyBookingCalendar: React.FC<MonthlyBookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  origin = 'São Paulo',
  destination = 'São Sebastião',
  tripType = 'Compartilhada',
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

  // Determine if currently selected date is weekend (Saturday or Sunday)
  const isSelectedWeekend = useMemo(() => {
    if (!selectedDate) return false;
    const parts = selectedDate.split('-').map(Number);
    if (parts.length !== 3) return false;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const day = d.getDay();
    return day === 0 || day === 6;
  }, [selectedDate]);

  // Determine direction: Subida (Litoral -> SP/GRU) vs Descida (SP/GRU -> Litoral)
  const isSubida = useMemo(() => {
    const orig = (origin || '').toLowerCase();
    return orig.includes('sebastião') || orig.includes('caraguatatuba') || orig.includes('ilhabela');
  }, [origin]);

  // Master available departure slots: ONLY the exact hours requested by Michelly
  const availableSlots: TimeSlot[] = useMemo(() => {
    if (isSubida) {
      // Subida (Litoral ➔ São Paulo & GRU): 05:00, 08:30, 14:00, 18:30 (Diariamente)
      return [
        { time: '05:00', label: 'Saída 1', periodName: 'Madrugada' },
        { time: '08:30', label: 'Saída 2', periodName: 'Manhã' },
        { time: '14:00', label: 'Saída 3', periodName: 'Início Tarde' },
        { time: '18:30', label: 'Saída 4', periodName: 'Fim de Tarde' },
      ];
    }

    // Descida (São Paulo / GRU ➔ Litoral)
    if (isSelectedWeekend) {
      // Sábados e Domingos: 11:30, 13:00, 17:30, 21:30
      return [
        { time: '11:30', label: 'Saída 1', periodName: 'Almoço' },
        { time: '13:00', label: 'Saída 2 (Ajuste FDS)', periodName: '13:00', isAdjusted: true },
        { time: '17:30', label: 'Saída 3', periodName: 'Fim de Tarde' },
        { time: '21:30', label: 'Saída 4 (Ajuste FDS)', periodName: '21:30', isAdjusted: true },
      ];
    }

    // Segunda a Sexta-feira: 11:30, 14:30, 17:30, 22:00
    return [
      { time: '11:30', label: 'Saída 1', periodName: 'Almoço' },
      { time: '14:30', label: 'Saída 2', periodName: 'Tarde' },
      { time: '17:30', label: 'Saída 3', periodName: 'Fim de Tarde' },
      { time: '22:00', label: 'Saída 4', periodName: 'Noturno' },
    ];
  }, [isSubida, isSelectedWeekend]);

  // Ensure selectedTime is strictly one of the exact official available slots
  useEffect(() => {
    const validTimes = availableSlots.map((s) => s.time);
    if (!validTimes.includes(selectedTime) && availableSlots.length > 0) {
      onTimeChange(availableSlots[0].time);
    }
  }, [availableSlots, selectedTime, onTimeChange]);

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
                <span className="text-[10px] text-slate-400 block font-sans">
                  Selecione a data da sua viagem
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer mr-1"
                title="Ir para o mês atual"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDayLabels.map((day, idx) => (
              <span
                key={day}
                className={`text-[11px] font-bold py-1 ${
                  idx === 0 || idx === 6 ? 'text-amber-700' : 'text-slate-400'
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Monthly Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, index) => {
              const isSelected = item.dateString === selectedDate;
              const isToday =
                item.date.getDate() === today.getDate() &&
                item.date.getMonth() === today.getMonth() &&
                item.date.getFullYear() === today.getFullYear();

              const dayOfWeek = item.date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              let buttonClass =
                'relative h-9 w-full rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ';

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

          {/* Mini Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Dias de Semana</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>Fim de Semana (Horário Ajustado)</span>
              </span>
            </div>
            <span className="text-slate-400 font-medium">Linha Regular Michelly</span>
          </div>
        </div>

        {/* RIGHT: ONLY Michelly's Official Available Hours (5 Cols on desktop) */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/50 flex flex-col justify-between">
          <div>
            {/* Header for Time Slots */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <h4 className="font-serif-display font-bold text-sm text-slate-900">
                  Horários Oficiais
                </h4>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-amber-300">
                {isSubida
                  ? 'Subida Diária'
                  : isSelectedWeekend
                  ? 'Descida FDS'
                  : 'Descida Seg a Sex'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              {isSubida
                ? '4 saídas diárias de São Sebastião / Caraguá para SP e GRU.'
                : isSelectedWeekend
                ? 'Horários ajustados de fim de semana (saídas às 13:00 e 21:30).'
                : '4 saídas de segunda a sexta-feira do Metrô Tietê / GRU para o Litoral.'}
            </p>

            {/* Exact 4 Slots Grid */}
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => onTimeChange(slot.time)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1 relative ${
                      isSelected
                        ? 'bg-slate-900 text-white border-amber-400 shadow-md ring-2 ring-amber-400'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {slot.periodName}
                      </span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="mt-1">
                      <strong className={`font-mono text-xl font-extrabold block ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                        {slot.time}
                      </strong>
                      <span className={`text-[10px] block ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {slot.label}
                      </span>
                    </div>

                    {slot.isAdjusted && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                        <Sparkles className="w-2.5 h-2.5" />
                        Ajuste FDS
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection Confirmation Bar */}
          <div className="mt-4 bg-white p-3 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold text-slate-900 block truncate text-xs">
                  {selectedDateFormatted || selectedDate}
                </span>
                <span className="text-[11px] text-slate-500">
                  Saída programada: <strong className="text-slate-900 font-mono text-xs">{selectedTime}</strong>
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
              Vaga Confirmada
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
