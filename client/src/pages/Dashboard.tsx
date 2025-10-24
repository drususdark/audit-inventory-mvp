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
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: rankedLocals, isLoading } = trpc.ranking.getAll.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para ver el dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Iniciar Sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

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
            <Link href="/dashboard">
              <a className="text-sm font-medium hover:underline">Dashboard</a>
            </Link>
            <Link href="/upload">
              <a className="text-sm font-medium hover:underline">Subir Informe</a>
            </Link>
            <Link href="/settings">
              <a className="text-sm font-medium hover:underline">Configuración</a>
            </Link>
            <span className="text-sm text-muted-foreground">{user?.name}</span>
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
            {!rankedLocals || rankedLocals.length === 0 ? (
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
                  {rankedLocals?.map((item, index) => (
                    <TableRow key={item.local.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.local.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.local.address || "—"}
                      </TableCell>
                      <TableCell className="text-right">{item.reportsCount}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-bold ${
                            item.avgScore >= 80
                              ? "text-green-600"
                              : item.avgScore >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.avgScore}/100
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/local/${item.local.id}`}>
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

