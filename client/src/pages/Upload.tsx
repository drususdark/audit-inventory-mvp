import { useState, ChangeEvent, FormEvent } from "react";
import { trpc } from "../lib/trpc";
import { format } from "date-fns";

export default function Upload() {
  const { data: locals } = trpc.locals.list.useQuery();
  const createReport = trpc.reports.create.useMutation();
  const [localId, setLocalId] = useState("");
const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
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
    if (!localId) {
      setStatus("Debe seleccionar un local.");
      return;
    }
    try {
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
        localId,
        date,
        text: reportText,
        fileName,
        fileData,
      });
      setStatus("Informe subido y analizado correctamente.");
      setLocalId("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setText("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus("Hubo un error al subir el informe.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Subir Informe</h1>
      {status && <p className="mb-4">{status}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Local</label>
          <select
            className="border p-2 w-full"
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
          >
            <option value="">Seleccione un local</option>
            {locals?.map((local) => (
              <option key={local.id} value={local.id}>
                {local.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Fecha del Informe</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">Tipo de entrada</label>
          <select
            className="border p-2 w-full"
            value={inputType}
            onChange={(e) =>
              setInputType(e.target.value as "text" | "file")
            }
          >
            <option value="text">Texto</option>
            <option value="file">Archivo</option>
          </select>
        </div>
        {inputType === "text" ? (
          <div>
            <label className="block mb-1">Contenido del Informe</label>
            <textarea
              className="border p-2 w-full"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        ) : (
          <div>
            <label className="block mb-1">Archivo (PDF, Excel, etc.)</label>
            <input type="file" onChange={handleFileChange} />
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Subir
        </button>
      </form>
    </div>
  );
}
