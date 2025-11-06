import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";

export default function Upload() {

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

