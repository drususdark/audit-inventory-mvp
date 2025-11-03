import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

/**
 * All content in this page are only for example, delete if unneeded
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  // If theme is switchable in App.tsx, we can implement theme toggling like this:
  // const { theme, toggleTheme } = useTheme();

  // Use APP_LOGO (as image src) and APP_TITLE if needed

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
            {isAuthenticated ? (
              <>
                <Button asChild variant="outline">
                  <a href="/dashboard">Dashboard</a>
                </Button>
                <Button onClick={logout} variant="ghost">
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Iniciar Sesión</a>
              </Button>
            )}
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
            {isAuthenticated ? (
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <a href="/dashboard">Ver Dashboard</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="/upload">Subir Informe</a>
                </Button>
              </div>
            ) : (
              <Button asChild size="lg">
                <a href={getLoginUrl()}>Comenzar Ahora</a>
              </Button>
            )}
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
