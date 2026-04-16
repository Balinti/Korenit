import MortgageCalculator from "@/components/mashkanta/MortgageCalculator";

export default function MashkantaPage() {
  return (
    <div className="flex flex-col flex-1 items-center">
      <div className="w-full bg-white border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-gray-500">מחשבון משכנתא — השוואת מסלולים ואופציות</p>
        </div>
      </div>
      <main className="w-full max-w-5xl mx-auto px-4 py-8">
        <MortgageCalculator />
      </main>
      <footer className="w-full bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          אין באמור המלצה פיננסית. יש להתייעץ עם יועץ משכנתאות מוסמך.
        </div>
      </footer>
    </div>
  );
}
