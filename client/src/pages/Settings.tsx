import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Settings() {
  const { data: locals, isLoading } = trpc.locals.list.useQuery();

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
                      <Link href={`/local/${local.id}`}>
                        <a className="text-sm font-medium hover:underline">Ver Detalle</a>
                      </Link>
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

