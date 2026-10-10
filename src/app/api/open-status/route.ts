import { NextResponse } from 'next/server';
import { getSiteData } from '@/lib/site-data';
import { getOpenStatus } from '@/lib/open-status';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getSiteData();
  return NextResponse.json(
    getOpenStatus(data.hours, data.businessInfo.timezone, new Date(), data.exceptions ?? []),
  );
}
