import type { DayHours, DayKey, HourException, TimeSlot } from './open-status';
import { getItalianDayName } from './open-status';

const DAY_BY_JS_INDEX: DayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export interface DayAvailability {
  iso: string;
  open: boolean;
  slots: TimeSlot[];
  note?: string;
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toIso(date);
}

export function toIso(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const value = hours * 60 + minutes;
  // un turno che chiude a mezzanotte è mezzanotte del giorno dopo
  return value === 0 && hours === 0 ? 24 * 60 : value;
}

export function getDayAvailability(
  iso: string,
  hours: Record<DayKey, DayHours>,
  exceptions: HourException[],
): DayAvailability {
  const exception = exceptions.find((entry) => entry.date === iso);
  if (exception) {
    return {
      iso,
      open: exception.isOpen,
      slots: exception.isOpen ? (exception.slots ?? []) : [],
      note: exception.note,
    };
  }
  const dayKey = DAY_BY_JS_INDEX[new Date(`${iso}T12:00:00`).getDay()];
  const dayHours = hours[dayKey];
  const open = Boolean(dayHours?.isOpen);
  return { iso, open, slots: open ? dayHours.slots : [] };
}

export function getTimeOptions(
  slots: TimeSlot[],
  stepMinutes = 30,
  lastSeatingBeforeClose = 45,
): string[] {
  const options: string[] = [];
  for (const slot of slots) {
    const start = toMinutes(slot.open);
    const limit = toMinutes(slot.close) - lastSeatingBeforeClose;
    for (let value = start; value <= limit; value += stepMinutes) {
      const hours = Math.floor(value / 60);
      if (hours >= 24) break;
      const minutes = `${value % 60}`.padStart(2, '0');
      options.push(`${`${hours}`.padStart(2, '0')}:${minutes}`);
    }
  }
  return options;
}

export function formatDateLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  const day = getItalianDayName(DAY_BY_JS_INDEX[date.getDay()]);
  const long = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' }).format(date);
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} ${long}`;
}

export interface BookingDraft {
  date: string;
  time: string;
  party: number;
  name: string;
  notes?: string;
}

export function buildBookingMessage(draft: BookingDraft): string {
  const lines = [
    'Ciao! Vorrei prenotare un tavolo.',
    `Data: ${formatDateLabel(draft.date)}`,
    `Ora: ${draft.time}`,
    `Persone: ${draft.party}`,
  ];
  if (draft.name.trim()) lines.push(`Nome: ${draft.name.trim()}`);
  if (draft.notes?.trim()) lines.push(`Note: ${draft.notes.trim()}`);
  return lines.join('\n');
}
