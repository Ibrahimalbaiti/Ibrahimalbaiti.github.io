import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import UploadArea from "../components/UploadArea";
import JobStatus from "../components/JobStatus";
import { uploadFile } from "../api/client";

const Dashboard = () => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState("eng_Latn");
  const [targetLang, setTargetLang] = useState("arb_Arab");
  const [engine, setEngine] = useState("gemini");

  const mutation = useMutation({
    mutationFn: (file: File) => uploadFile(file, sourceLang, targetLang, engine),
    onSuccess: (data) => setTaskId(data.task_id)
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-xl font-semibold">Translation Dashboard</h2>
        <p className="mt-2 text-sm text-slate-400">
          Upload presentations, monitor progress, and route tasks to Gemini or NLLB engines.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            Source Language
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              value={sourceLang}
              onChange={(event) => setSourceLang(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Target Language
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              value={targetLang}
              onChange={(event) => setTargetLang(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Engine
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              value={engine}
              onChange={(event) => setEngine(event.target.value)}
            >
              <option value="gemini">Gemini</option>
              <option value="nllb">NLLB-200</option>
            </select>
          </label>
        </div>
      </section>

      <UploadArea onFileSelected={(file) => mutation.mutate(file)} />

      {mutation.isPending ? (
        <p className="text-sm text-slate-400">Uploading...</p>
      ) : null}

      {taskId ? <JobStatus taskId={taskId} /> : null}
    </div>
  );
};

export default Dashboard;
