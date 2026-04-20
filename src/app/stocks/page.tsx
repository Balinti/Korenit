import StocksPage from "@/components/stocks/StocksPage";

export default function StocksRoute() {
  return (
    <div className="flex flex-col flex-1 items-center">
      <div className="w-full bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-gray-500">חיפוש וסימולציה של מניות — ישראל ועולם</p>
        </div>
      </div>
      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <StocksPage />
      </main>
      <footer className="w-full bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
          נתוני מסחר מ-Yahoo Finance. אין באמור המלצת השקעה.
        </div>
      </footer>
    </div>
  );
}
