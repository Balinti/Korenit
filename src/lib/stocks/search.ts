import { Stock } from './types';

/**
 * Regex-based search across name, hebrewName, symbol, and securityNumber.
 * Falls back to literal match if the query is not valid regex.
 */
export function searchStocks(query: string, allStocks: Stock[]): Stock[] {
  if (!query.trim()) return [];

  let regex: RegExp;
  try {
    regex = new RegExp(query, 'i');
  } catch {
    // Invalid regex — escape and treat as literal
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regex = new RegExp(escaped, 'i');
  }

  return allStocks
    .filter(
      s =>
        regex.test(s.symbol) ||
        regex.test(s.name) ||
        (s.hebrewName ? regex.test(s.hebrewName) : false) ||
        (s.securityNumber ? regex.test(s.securityNumber) : false),
    )
    .slice(0, 20);
}
