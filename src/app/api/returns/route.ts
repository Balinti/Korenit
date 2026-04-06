import { NextResponse } from 'next/server';
import { fetchFundReturns } from '@/lib/gemelnet';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fundIds = searchParams.get('funds')?.split(',') || [];
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  if (fundIds.length === 0 || !from || !to) {
    return NextResponse.json(
      { error: 'Missing required params: funds, from, to' },
      { status: 400 }
    );
  }

  try {
    const returns = await fetchFundReturns(fundIds, from, to);
    return NextResponse.json(returns);
  } catch (error) {
    console.error('GemelNet fetch error:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת נתונים מגמלנט' },
      { status: 502 }
    );
  }
}
