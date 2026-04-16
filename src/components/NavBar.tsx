'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'פנסיה' },
  { href: '/mashkanta', label: 'משכנתא' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between py-4">
        <div>
          <Link href="/" className="text-2xl font-bold text-gray-900">
            קורנית
          </Link>
        </div>
        <nav className="flex gap-1">
          {NAV_ITEMS.map(item => {
            const isActive =
              item.href === '/'
                ? pathname === '/' || pathname === ''
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
