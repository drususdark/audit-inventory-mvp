import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_LOGO, APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function Upload() {
  const { data: locals } = trpc.locals.list.useQuery();
  const createReport = trpc.reports.create.useMutation();
  const utils = trpc.useUtils();
  
  const [localId, setLocalId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!localId) {
      setError("Debe seleccionar un local.");
      return;
    }

    if (inputType === "text" && !text.trim()) {
      setError("Debe proporcionar contenido de texto.");
      return;
    }

    if (inputType === "file" && !file) {
      setError("Debe seleccionar un archivo.");
      return;
    }

    try {
      setIsLoading(true);
      let fileData: string | undefined;
      let fileName: string | undefined;
      let reportText: string | undefined = undefined;
      
      if (inputType === "file" && file) {
        const buffer = await file.arrayBuffer();
        fileData = arrayBufferToBase64(buffer);
        fileName = file.name;
      } else {
        reportText = text;
      }
      
      await createReport.mutateAsync({
        localId: parseInt(localId),
        date,
        text: reportText,
        fileName,
        fileData,
      });

      // Invalidate queries to refresh data
      await utils.reports.list.invalidate();
      await utils.scores.list.invalidate();

      toast.success("Informe subido y analizado correctamente.");
      
      // Reset form
      setLocalId("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setText("");
      setFile(null);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Hubo un error al subir el informe.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
              Subir Informe
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

      <main className="container py-8 max-w-2xl">
        <h2 className="text-3xl font-bold mb-2">Subir Informe</h2>
        <p className="text-muted-foreground mb-6">
          Sube un informe de inventario en texto o archivo para obtener una puntuación automática.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Informe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="local">Local *</Label>
                <Select value={localId} onValueChange={setLocalId}>
                  <SelectTrigger id="local">
                    <SelectValue placeholder="Seleccione un local" />
                  </SelectTrigger>
                  <SelectContent>
                    {locals?.map((local) => (
                      <SelectItem key={local.id} value={local.id.toString()}>
                        {local.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha del Informe *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inputType">Tipo de Entrada *</Label>
                <Select value={inputType} onValueChange={(value) => setInputType(value as "text" | "file")}>
                  <SelectTrigger id="inputType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="file">Archivo (PDF, Excel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inputType === "text" ? (
                <div className="space-y-2">
                  <Label htmlFor="content">Contenido del Informe *</Label>
                  <Textarea
                    id="content"
                    placeholder="Ingrese el contenido del informe. Puede incluir palabras clave como 'exactitud: 95%', 'faltantes: 2%', etc."
                    rows={8}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="file">Archivo (PDF, Excel, etc.) *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.xlsx,.xls,.csv"
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: {file.name}
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Subiendo..." : "Subir Informe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
