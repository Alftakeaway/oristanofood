export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DayHours {
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface HourException {
  date: string;
  isOpen: boolean;
  slots?: TimeSlot[];
  note?: string;
}

export const DAY_ORDER: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const WEEKDAY_INDEX: Record<string, DayKey> = {
  Sun: 'sunday',
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
  Sat: 'saturday',
};

export function getTodayKey(timezone: string, now: Date = new Date()): DayKey {
  const short = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).format(now);
  return WEEKDAY_INDEX[short];
}

function getMinutesOfDay(timezone: string, now: Date): number {
  const hm = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now);
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function slotContains(slot: TimeSlot, minutes: number): boolean {
  const open = parseMinutes(slot.open);
  const close = parseMinutes(slot.close);
  if (open === close) return false;
  if (close < open) return minutes >= open || minutes < close;
  return minutes >= open && minutes < close;
}

export function formatSlot(slot: TimeSlot): string {
  return `${slot.open} – ${slot.close}`;
}

export function getItalianDayName(day: DayKey, capitalize = true): string {
  const index = DAY_ORDER.indexOf(day);
  const date = new Date(Date.UTC(2024, 0, 1 + index));
  const name = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
  return capitalize ? name.charAt(0).toUpperCase() + name.slice(1) : name;
}

export function getTodayDateString(timezone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getTodayException(
  exceptions: HourException[],
  timezone: string,
  now: Date = new Date(),
): HourException | null {
  const today = getTodayDateString(timezone, now);
  return exceptions.find((exception) => exception.date === today) ?? null;
}

export interface OpenStatus {
  isOpen: boolean;
  label: string;
  today: DayKey;
}

function closeLabel(close: string): string {
  return close === '00:00' ? 'chiude a mezzanotte' : `chiude alle ${close}`;
}

export function getOpenStatus(
  hours: Record<DayKey, DayHours>,
  timezone: string,
  now: Date = new Date(),
  exceptions: HourException[] = [],
): OpenStatus {
  const today = getTodayKey(timezone, now);
  const minutes = getMinutesOfDay(timezone, now);

  const exception = getTodayException(exceptions, timezone, now);
  if (exception) {
    if (!exception.isOpen) {
      return { isOpen: false, today, label: exception.note ?? 'Chiuso oggi' };
    }
    const slots = exception.slots ?? [];
    const current = slots.find((slot) => slotContains(slot, minutes));
    if (current) {
      return { isOpen: true, today, label: `Aperto ora · ${closeLabel(current.close)}` };
    }
    if (slots.length > 0) {
      return {
        isOpen: false,
        today,
        label: exception.note ?? `Orario speciale oggi: ${slots.map(formatSlot).join(' · ')}`,
      };
    }
    return { isOpen: true, today, label: exception.note ?? 'Aperto oggi' };
  }

  const todayHours = hours[today] ?? { isOpen: false, slots: [] };

  if (todayHours.isOpen) {
    const current = todayHours.slots.find((slot) => slotContains(slot, minutes));
    if (current) {
      return { isOpen: true, today, label: `Aperto ora · ${closeLabel(current.close)}` };
    }
    const next = todayHours.slots.find((slot) => parseMinutes(slot.open) > minutes);
    if (next) {
      return { isOpen: false, today, label: `Chiuso ora · riapre alle ${next.open}` };
    }
  }

  for (let offset = 0; offset < 7; offset++) {
    const index = (DAY_ORDER.indexOf(today) + offset) % 7;
    const day = DAY_ORDER[index];
    const dayHours = hours[day];
    if (dayHours?.isOpen && dayHours.slots.length > 0) {
      const slot = dayHours.slots[0];
      if (offset === 0) {
        return { isOpen: false, today, label: `Chiuso ora · riapre alle ${slot.open}` };
      }
      return {
        isOpen: false,
        today,
        label: `Chiuso · apre ${getItalianDayName(day, false)} alle ${slot.open}`,
      };
    }
  }

  return { isOpen: false, today, label: 'Chiuso' };
}
