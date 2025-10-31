import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />
            )}
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild variant="outline">
              <a href="/dashboard">Dashboard</a>
            </Button>
            <Button asChild>
              <a href="/upload">Subir Informe</a>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Sistema de Auditoría de Inventarios
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Analiza informes de inventario con IA, asigna puntuaciones automáticas
              y genera rankings de locales con evolución histórica.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate("/dashboard")}
              >
                Ver Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/upload")}
              >
                Subir Informe
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-16 border-t">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">
              Características Principales
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis Automático</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sube informes en texto, PDF o Excel y obtén una puntuación
                    automática de 0 a 100 basada en criterios predefinidos.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Locales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualiza un ranking de locales ordenado por puntuación
                    promedio y compara el desempeño entre sucursales.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Evolución Histórica</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Consulta gráficos de evolución de puntuaciones por local
                    y detecta tendencias en el tiempo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Audit Inventory MVP © 2025</p>
        </div>
      </footer>
    </div>
  );
}

