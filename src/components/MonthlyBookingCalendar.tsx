import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Check,
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

  const [viewDate, setViewDate] = useState<Date>(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
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

  const isSelectedWeekend = useMemo(() => {
    if (!selectedDate) return false;
    const parts = selectedDate.split('-').map(Number);
    if (parts.length !== 3) return false;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const day = d.getDay();
    return day === 0 || day === 6;
  }, [selectedDate]);

  const isSubida = useMemo(() => {
    const orig = (origin || '').toLowerCase();
    return orig.includes('sebastião') || orig.includes('caraguatatuba') || orig.includes('ilhabela');
  }, [origin]);

  const availableSlots: TimeSlot[] = useMemo(() => {
    if (isSubida) {
      return [
        { time: '05:00', label: 'Saída 1', periodName: 'Madrugada' },
        { time: '08:30', label: 'Saída 2', periodName: 'Manhã' },
        { time: '14:00', label: 'Saída 3', periodName: 'Início Tarde' },
        { time: '18:30', label: 'Saída 4', periodName: 'Fim de Tarde' },
      ];
    }

    if (isSelectedWeekend) {
      return [
        { time: '11:30', label: 'Saída 1', periodName: 'Almoço' },
        { time: '13:00', label: 'Saída 2 • Ajuste FDS', periodName: '13:00', isAdjusted: true },
        { time: '17:30', label: 'Saída 3', periodName: 'Fim de Tarde' },
        { time: '21:30', label: 'Saída 4 • Ajuste FDS', periodName: '21:30', isAdjusted: true },
      ];
    }

    return [
      { time: '11:30', label: 'Saída 1', periodName: 'Almoço' },
      { time: '14:30', label: 'Saída 2', periodName: 'Tarde' },
      { time: '17:30', label: 'Saída 3', periodName: 'Fim de Tarde' },
      { time: '22:00', label: 'Saída 4', periodName: 'Noturno' },
    ];
  }, [isSubida, isSelectedWeekend]);

  useEffect(() => {
    const validTimes = availableSlots.map((s) => s.time);
    if (!validTimes.includes(selectedTime) && availableSlots.length > 0) {
      onTimeChange(availableSlots[0].time);
    }
  }, [availableSlots, selectedTime, onTimeChange]);

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
    <div className="space-y-4">
      {/* SECTION 1: CALENDAR SELECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif-display font-extrabold text-sm text-slate-900 capitalize">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h4>
              <span className="text-[11px] text-slate-500 block">Selecione o dia da viagem</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekDayLabels.map((day, idx) => (
            <span
              key={day}
              className={`text-[11px] font-bold py-1 ${
                idx === 0 || idx === 6 ? 'text-amber-600' : 'text-slate-400'
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((item, index) => {
            const isSelected = item.dateString === selectedDate;
            const isToday =
              item.date.getDate() === today.getDate() &&
              item.date.getMonth() === today.getMonth() &&
              item.date.getFullYear() === today.getFullYear();

            const dayOfWeek = item.date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            let buttonClass =
              'relative h-10 w-full rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ';

            if (item.isPast) {
              buttonClass += 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-40 ';
            } else if (isSelected) {
              buttonClass += 'bg-slate-900 text-amber-400 ring-2 ring-amber-400 shadow-md scale-105 z-10 ';
            } else if (!item.isCurrentMonth) {
              buttonClass += 'text-slate-300 hover:bg-slate-50 ';
            } else {
              buttonClass += isWeekend
                ? 'text-slate-900 bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200/50 '
                : 'text-slate-800 bg-slate-50 hover:bg-slate-100 ';
            }

            return (
              <button
                key={index}
                type="button"
                disabled={item.isPast}
                onClick={() => onDateChange(item.dateString)}
                className={buttonClass}
              >
                <span>{item.date.getDate()}</span>
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Dias úteis
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Fim de semana (Horário Ajustado)
          </span>
        </div>
      </div>

      {/* SECTION 2: OFFICIAL TIME SLOTS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h4 className="font-serif-display font-extrabold text-sm text-slate-900">
              Horários Oficiais de Saída
            </h4>
          </div>
          <span className="text-[10px] uppercase font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded-md">
            {isSubida ? 'Subida (Litoral ➔ SP)' : isSelectedWeekend ? 'Descida FDS' : 'Descida Seg-Sex'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {availableSlots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            return (
              <button
                key={slot.time}
                type="button"
                onClick={() => onTimeChange(slot.time)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xl font-black ${isSelected ? 'text-amber-400' : 'text-slate-950'}`}>
                      {slot.time}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-700'}`}>
                      {slot.periodName}
                    </span>
                  </div>
                  <span className={`text-xs block font-medium ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                    {slot.label}
                  </span>
                  {slot.isAdjusted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 pt-0.5">
                      <Sparkles className="w-3 h-3" />
                      Horário especial FDS
                    </span>
                  )}
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'border border-slate-300 text-transparent'}`}>
                  ✓
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Summary Badge */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-2 font-medium">
            <span>📅 Data: <strong className="font-bold text-slate-900">{selectedDateFormatted || selectedDate}</strong></span>
            <span>•</span>
            <span>🕐 Horário: <strong className="font-bold text-slate-900 font-mono">{selectedTime}</strong></span>
          </div>
          <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px]">
            Confirmado
          </span>
        </div>
      </div>
    </div>
  );
};
