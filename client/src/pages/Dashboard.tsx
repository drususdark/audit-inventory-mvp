import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: locals, isLoading: localsLoading } = trpc.locals.list.useQuery();
  const { data: reports, isLoading: reportsLoading } = trpc.reports.list.useQuery();

  if (localsLoading || reportsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // Calcular promedio de puntuaciones por local
  const localScores = locals?.map((local) => {
    const localReports = reports?.filter((r) => r.localId === local.id) || [];
    // Por ahora, sin scores reales, usamos un placeholder
    const avgScore = localReports.length > 0 ? 75 : 0;
    return {
      ...local,
      reportsCount: localReports.length,
      avgScore,
    };
  }) || [];

  // Ordenar por puntuación descendente
  const rankedLocals = localScores.sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />
            )}
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <nav className="flex items-center gap-4">
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

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard de Auditorías</h2>
          <p className="text-muted-foreground">
            Ranking de locales basado en las puntuaciones de auditoría
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ranking de Locales</CardTitle>
            <CardDescription>
              Locales ordenados por puntuación promedio (mayor a menor)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rankedLocals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay locales registrados. Comienza creando uno en Configuración.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Posición</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead className="text-right">Informes</TableHead>
                    <TableHead className="text-right">Puntuación Promedio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedLocals.map((local, index) => (
                    <TableRow key={local.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{local.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {local.address || "—"}
                      </TableCell>
                      <TableCell className="text-right">{local.reportsCount}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-bold ${
                            local.avgScore >= 80
                              ? "text-green-600"
                              : local.avgScore >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {local.avgScore}/100
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/local/${local.id}`}>
                            <a>Ver Detalle</a>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

