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
import { Link } from "wouter";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const { data: locals, isLoading } = trpc.locals.list.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para acceder a la configuración
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
          <h2 className="text-3xl font-bold mb-2">Configuración</h2>
          <p className="text-muted-foreground">
            Gestiona los locales y las variables del sistema
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Locales</CardTitle>
              <CardDescription>
                Administra los locales que serán auditados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Cargando...</p>
              ) : locals && locals.length > 0 ? (
                <div className="space-y-2">
                  {locals.map((local) => (
                    <div
                      key={local.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{local.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {local.address || "Sin dirección"}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/local/${local.id}`}>
                          <a>Ver Detalle</a>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay locales registrados
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variables del Sistema</CardTitle>
              <CardDescription>
                Configuración de criterios y pesos de puntuación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Funcionalidad en desarrollo...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

