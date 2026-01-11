import { useQuery } from "@tanstack/react-query";
import { getTaskStatus } from "../api/client";

interface JobStatusProps {
  taskId: string;
}

const JobStatus = ({ taskId }: JobStatusProps) => {
  const { data } = useQuery({
    queryKey: ["taskStatus", taskId],
    queryFn: () => getTaskStatus(taskId),
    refetchInterval: 2000
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">Task ID</p>
      <p className="text-sm font-medium text-emerald-400">{taskId}</p>
      <div className="mt-3">
        <p className="text-sm text-slate-300">Status: {data?.status ?? "pending"}</p>
        {data?.progress ? (
          <p className="text-xs text-slate-500">{data.progress}</p>
        ) : null}
      </div>
    </div>
  );
};

export default JobStatus;
