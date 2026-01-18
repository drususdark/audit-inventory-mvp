import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Settings() {
  const { data: locals } = trpc.locals.list.useQuery();
  const utils = trpc.useUtils();
  const createLocal = trpc.locals.create.useMutation({
    onSuccess: async () => {
      await utils.locals.list.invalidate();
      setNewName("");
      setNewAddress("");
    },
  });

  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) return;
    try {
      await createLocal.mutateAsync({
        name: newName.trim(),
        address: newAddress.trim(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="text-sm font-medium hover:underline"
            >
              Subir informe
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium hover:underline"
            >
              Configuración
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <h2 className="text-3xl font-bold mb-2">Configuración</h2>
        <p className="text-muted-foreground mb-6">
          Administra tus locales y criterios de puntuación.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gestión de locales</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del local</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Dirección del local</Label>
                  <Input
                    id="address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Dirección"
                  />
                </div>
              </div>
              <Button type="submit">Crear local</Button>
            </form>

            {locals && locals.length > 0 ? (
              <ul className="space-y-2">
                {locals.map((loc) => (
                  <li key={loc.id} className="border rounded p-2">
                    <span className="font-medium">{loc.name}</span> –{" "}
                    {loc.address}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No hay locales registrados.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variables del sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Funcionalidad en desarrollo. Aquí podrás configurar los criterios
              de puntuación y pesos.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
