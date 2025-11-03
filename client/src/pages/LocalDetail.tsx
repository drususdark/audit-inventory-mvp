import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";

export default function LocalDetail() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams<{ id: string }>();
  const localId = parseInt(params.id || "0", 10);

  const { data: local, isLoading: localLoading } = trpc.locals.getById.useQuery({ id: localId });
  const { data: reports, isLoading: reportsLoading } = trpc.reports.getByLocalId.useQuery({ localId });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para ver el detalle del local
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

  if (localLoading || reportsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!local) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Local no encontrado</CardTitle>
            <CardDescription>El local solicitado no existe</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">
                <a>Volver al Dashboard</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
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
          <Button asChild variant="outline" className="mb-4">
            <Link href="/dashboard">
              <a>← Volver al Dashboard</a>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold mb-2">{local.name}</h2>
          <p className="text-muted-foreground">{local.address || "Sin dirección"}</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Informes</CardTitle>
              <CardDescription>
                Todos los informes de auditoría para este local
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports && reports.length > 0 ? (
                <p className="text-muted-foreground">
                  {reports.length} informe(s) encontrado(s)
                </p>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay informes para este local
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Evolución</CardTitle>
              <CardDescription>
                Evolución de las puntuaciones en el tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Gráfico en desarrollo...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

