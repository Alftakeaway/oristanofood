import { describe, expect, it } from 'vitest';
import {
  buildBookingMessage,
  formatDateLabel,
  getDayAvailability,
  getTimeOptions,
} from './booking';
import type { DayHours, DayKey, HourException } from './open-status';

const openDay: DayHours = {
  isOpen: true,
  slots: [{ open: '12:00', close: '14:30' }],
};
const closedDay: DayHours = { isOpen: false, slots: [] };
const hours = {
  monday: closedDay,
  tuesday: openDay,
  wednesday: openDay,
  thursday: openDay,
  friday: openDay,
  saturday: openDay,
  sunday: closedDay,
} satisfies Record<DayKey, DayHours>;

describe('getDayAvailability', () => {
  it('giorno aperto: slot del giorno', () => {
    // 2026-10-13 = martedì
    const day = getDayAvailability('2026-10-13', hours, []);
    expect(day.open).toBe(true);
    expect(day.slots).toEqual([{ open: '12:00', close: '14:30' }]);
  });

  it('giorno chiuso: niente slot', () => {
    // 2026-10-12 = lunedì
    const day = getDayAvailability('2026-10-12', hours, []);
    expect(day.open).toBe(false);
    expect(day.slots).toEqual([]);
  });

  it('eccezione chiusura: batte il settimanale', () => {
    const exceptions: HourException[] = [{ date: '2026-10-13', isOpen: false, note: 'Festa' }];
    const day = getDayAvailability('2026-10-13', hours, exceptions);
    expect(day.open).toBe(false);
    expect(day.note).toBe('Festa');
  });
});

describe('getTimeOptions', () => {
  it('step 30m con ultimo ingresso 45m prima della chiusura', () => {
    // 12:00–14:30 → ultimo slot 13:45 (14:30 − 45m)
    expect(getTimeOptions([{ open: '12:00', close: '14:30' }])).toEqual([
      '12:00',
      '12:30',
      '13:00',
      '13:30',
    ]);
  });
});

describe('messaggio prenotazione', () => {
  it('contiene data in italiano, ora, persone, nome', () => {
    const msg = buildBookingMessage({ date: '2026-10-13', time: '12:30', party: 4, name: 'Rossi' });
    expect(msg).toContain('12:30');
    expect(msg).toContain('4');
    expect(msg).toContain('Rossi');
    expect(msg).toMatch(/marted.+13 ottobre/i);
  });

  it('etichetta data in italiano', () => {
    expect(formatDateLabel('2026-10-13')).toMatch(/marted.+13 ottobre/i);
  });
});
