import type { HourException } from '@/lib/open-status';

export default function NoticeBanner({ exception }: { exception: HourException | null }) {
  if (!exception?.note) return null;

  return (
    <div className="border-b border-accent/40 bg-accent/15">
      <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-2.5 text-sm">
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <p className="font-medium">{exception.note}</p>
      </div>
    </div>
  );
}
