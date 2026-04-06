import { NextResponse } from 'next/server';
import funds from '../../../../data/funds.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  const filtered = query
    ? funds.filter(
        (f: any) =>
          f.name.includes(query) ||
          f.id.includes(query) ||
          f.category.includes(query)
      )
    : funds;

  return NextResponse.json(filtered);
}
