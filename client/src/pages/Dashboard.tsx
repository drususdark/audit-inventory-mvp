import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: locals, isLoading: localsLoading } = trpc.locals.list.useQuery();
  const { data: reports, isLoading: reportsLoading } = trpc.reports.list.useQuery();
  const { data: scores, isLoading: scoresLoading } = trpc.scores.list.useQuery();

  if (localsLoading || reportsLoading || scoresLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const scoreMap: Record<string, number[]> = {};
  scores?.forEach((score) => {
    const report = reports?.find((r) => r.id === score.reportId);
    if (report) {
      const arr = scoreMap[report.localId] ?? [];
      arr.push(score.finalScore ?? score.autoScore ?? 0);
      scoreMap[report.localId] = arr;
    }
  });

  const ranking = (locals ?? []).map((local) => {
    const arr = scoreMap[local.id] ?? [];
    const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return {
      id: local.id,
      name: local.name,
      average: avg,
      count: arr.length,
    };
  }).sort((a, b) => b.average - a.average);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} className="h-8 w-8" alt="Logo" />}
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/upload" className="text-sm font-medium hover:underline">
              Subir Informe
            </Link>
            <Link href="/settings" className="text-sm font-medium hover:underline">
              Configuración
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 flex-grow">
        <h2 className="text-xl font-bold mb-4">Ranking de Locales</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Local</th>
              <th className="px-4 py-2 text-left">Promedio</th>
              <th className="px-4 py-2 text-left">Informes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ranking.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.average.toFixed(1)}</td>
                <td className="px-4 py-2">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
