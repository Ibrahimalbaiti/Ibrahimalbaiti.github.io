import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";

interface UploadAreaProps {
  onFileSelected: (file: File) => void;
}

const UploadArea = ({ onFileSelected }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    const isValid = file.name.endsWith(".ppt") || file.name.endsWith(".pptx");
    if (!isValid) {
      setError("Only PPT or PPTX files are allowed.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelected(file);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
      <div
        className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-6 transition ${
          isDragging ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <UploadCloud className="h-10 w-10 text-emerald-400" />
        <div>
          <p className="text-lg font-semibold">Upload PPTX for Translation</p>
          <p className="text-sm text-slate-400">
            Drag & drop your file here or select from your device.
          </p>
        </div>
        <label className="cursor-pointer rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Select File
          <input type="file" className="hidden" onChange={handleSelect} />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
};

export default UploadArea;
