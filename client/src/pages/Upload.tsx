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
import { Link } from "wouter";

export default function Upload() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para subir informes
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
          <h2 className="text-3xl font-bold mb-2">Subir Informe de Auditoría</h2>
          <p className="text-muted-foreground">
            Sube un informe de inventario para análisis automático
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de Carga</CardTitle>
            <CardDescription>
              Selecciona el local y el tipo de informe (texto, PDF o Excel)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Funcionalidad de carga en desarrollo...
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

