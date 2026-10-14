"use client";

import { useMemo, useState } from "react";
import { DEMO_MODE } from "@/lib/demo-mode";
import type { BookingConfig, BusinessInfo } from "@/lib/site-data";
import { getWhatsAppHref } from "@/lib/format";
import type { DayHours, DayKey, HourException } from "@/lib/open-status";
import { getTodayDateString } from "@/lib/open-status";
import {
  addDays,
  buildBookingMessage,
  getDayAvailability,
  formatDateLabel,
  getTimeOptions,
} from "@/lib/booking";

interface BookingSectionProps {
  businessInfo: BusinessInfo;
  hours: Record<DayKey, DayHours>;
  exceptions: HourException[];
  config: BookingConfig;
}

export default function BookingSection({
  businessInfo,
  hours,
  exceptions,
  config,
}: BookingSectionProps) {
  const today = getTodayDateString(businessInfo.timezone);
  const advanceDays = config.advanceDays ?? 21;
  const stepMinutes = config.stepMinutes ?? 30;
  const maxParty = config.maxParty ?? 12;

  const openDays = useMemo(() => {
    const list: string[] = [];
    for (
      let offset = 0;
      offset <= advanceDays && list.length < 5;
      offset += 1
    ) {
      const iso = addDays(today, offset);
      if (getDayAvailability(iso, hours, exceptions).open) list.push(iso);
    }
    return list;
  }, [today, hours, exceptions, advanceDays]);

  const [date, setDate] = useState(openDays[0] ?? today);
  const [party, setParty] = useState(2);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [privacyOk, setPrivacyOk] = useState(false);

  const availability = getDayAvailability(date, hours, exceptions);
  const timeOptions = getTimeOptions(availability.slots, stepMinutes);
  const [time, setTime] = useState(timeOptions[0] ?? "");
  const selectedTime = timeOptions.includes(time)
    ? time
    : (timeOptions[0] ?? "");

  const maxIso = addDays(today, advanceDays);
  const href = getWhatsAppHref(
    businessInfo.whatsapp,
    buildBookingMessage({ date, time: selectedTime, party, name, notes }),
  );

  return (
    <section id="prenota" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm md:p-8">
            <h2 className="font-heading text-3xl font-medium">
              Prenota un tavolo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {DEMO_MODE
                ? "Prova il modulo: vedrai un’anteprima della richiesta, senza inviarla."
                : (config.note ??
                  "Compila la richiesta: ti risponderemo su WhatsApp per confermare la disponibilità.")}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {openDays.map((iso) => (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={date === iso}
                  onClick={() => {
                    setDate(iso);
                    const options = getTimeOptions(
                      getDayAvailability(iso, hours, exceptions).slots,
                      stepMinutes,
                    );
                    setTime(options[0] ?? "");
                  }}
                  className={
                    date === iso
                      ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white"
                      : "rounded-full border border-foreground/15 px-3.5 py-1.5 text-xs font-medium text-muted transition hover:border-primary/50 hover:text-foreground"
                  }
                >
                  {formatDateLabel(iso)}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium">Data</span>
                <input
                  type="date"
                  value={date}
                  min={today}
                  max={maxIso}
                  onChange={(event) => {
                    const iso = event.target.value || today;
                    setDate(iso);
                    const options = getTimeOptions(
                      getDayAvailability(iso, hours, exceptions).slots,
                      stepMinutes,
                    );
                    setTime(options[0] ?? "");
                  }}
                  className="mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium">Persone</span>
                <select
                  value={party}
                  onChange={(event) => setParty(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2"
                >
                  {Array.from(
                    { length: maxParty },
                    (_, index) => index + 1,
                  ).map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "persona" : "persone"}
                    </option>
                  ))}
                  {maxParty >= 12 && (
                    <option value={maxParty + 1}>Oltre {maxParty}</option>
                  )}
                </select>
              </label>

              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">Orario</span>
                <select
                  value={selectedTime}
                  onChange={(event) => setTime(event.target.value)}
                  disabled={timeOptions.length === 0}
                  className="mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 disabled:opacity-60"
                >
                  {timeOptions.length === 0 ? (
                    <option value="">Nessun servizio</option>
                  ) : (
                    timeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-medium">Nome per la prenotazione</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Mario Rossi"
                  className="mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium">Note (facoltative)</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Seggiolone, tavolo vicino alla finestra, allergie…"
                  className="mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2"
                />
              </label>
            </div>

            {!availability.open ? (
              <p className="mt-5 rounded-lg bg-secondary/10 px-4 py-3 text-sm text-secondary">
                {availability.note ??
                  "Chiuso in questa data: scegli un giorno di apertura."}
              </p>
            ) : (
              <>
                <label className="mt-5 flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-muted">
                  <input
                    type="checkbox"
                    checked={privacyOk}
                    onChange={(event) => setPrivacyOk(event.target.checked)}
                    className="mt-0.5 accent-primary"
                  />
                  <span>
                    Ho letto l&apos;
                    <a href="/privacy" className="underline underline-offset-2">
                      informativa privacy
                    </a>{" "}
                    e accetto che i dati della richiesta viaggino via WhatsApp.
                  </span>
                </label>
                <a
                  href={selectedTime && privacyOk ? href : undefined}
                  target={selectedTime && privacyOk ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-disabled={!selectedTime || !privacyOk}
                  className={`mt-3 block rounded-full px-6 py-3 text-center text-sm font-semibold text-white transition ${
                    selectedTime && privacyOk
                      ? "bg-primary hover:brightness-110 active:scale-[0.98]"
                      : "pointer-events-none bg-primary/50"
                  }`}
                >
                  {DEMO_MODE
                    ? "Prova la prenotazione"
                    : "Invia richiesta su WhatsApp"}
                </a>
              </>
            )}

            {config.phoneFallback !== false && (
              <p className="mt-4 text-center text-xs text-muted">
                Preferisci il telefono?{" "}
                <a
                  href={
                    DEMO_MODE
                      ? "#demo-contact"
                      : `tel:${businessInfo.phone.replace(/[^+\d]/g, "")}`
                  }
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {businessInfo.phone}
                </a>
              </p>
            )}
          </div>

          <ul className="space-y-4 text-sm leading-relaxed text-muted">
            <li className="rounded-xl border border-foreground/5 bg-background px-4 py-3">
              La richiesta arriva in chat: la conferma definitiva arriva dal
              locale, di norma entro pochi minuti durante il servizio.
            </li>
            <li className="rounded-xl border border-foreground/5 bg-background px-4 py-3">
              Per gruppi oltre {maxParty} coperti, o per eventi e menu
              concordati, scriveteci direttamente: organizziamo il servizio su
              misura.
            </li>
            <li className="rounded-xl border border-foreground/5 bg-background px-4 py-3">
              I tavoli restano a disposizione 15 minuti oltre l&apos;orario
              prenotato; per ritardi segnalatelo in chat e li teniamo fin quando
              possibile.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
