import { Fragment, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stage, Layer, Rect, Text } from "react-konva";
import { getSlideDetails, submitFeedback, SlideElement } from "../api/client";

const Studio = () => {
  const [taskId, setTaskId] = useState("");
  const [elements, setElements] = useState<SlideElement[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["slideDetails", taskId],
    queryFn: () => getSlideDetails(taskId),
    enabled: Boolean(taskId)
  });

  const resolvedElements = useMemo(() => {
    if (data?.result?.elements) {
      return data.result.elements;
    }
    return [];
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      submitFeedback({
        slide_id: taskId,
        corrected_text: elements.map((item) => item.text).join("\n"),
        corrected_bounding_boxes: elements,
        user_rating: 5
      }),
    onSuccess: () => {
      setToast("Feedback saved successfully.");
      setTimeout(() => setToast(null), 3000);
    }
  });

  useEffect(() => {
    if (resolvedElements.length) {
      setElements(resolvedElements);
    }
  }, [resolvedElements]);

  const handleDragMove = (index: number, x: number, y: number) => {
    setElements((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, x, y } : item))
    );
  };

  const handleTextChange = (value: string) => {
    if (selectedIndex === null) {
      return;
    }
    setElements((prev) =>
      prev.map((item, idx) => (idx === selectedIndex ? { ...item, text: value } : item))
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-xl font-semibold">Training Studio</h2>
        <p className="mt-2 text-sm text-slate-400">
          Load the translated slide output, adjust layout, and submit feedback for fine-tuning.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm md:w-80"
            placeholder="Enter Task ID"
            value={taskId}
            onChange={(event) => setTaskId(event.target.value)}
          />
          <button
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
            onClick={() => refetch()}
          >
            {isFetching ? "Loading..." : "Load Slide"}
          </button>
          <button
            className="rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-400"
            onClick={() => mutation.mutate()}
            disabled={!elements.length}
          >
            Save & Train
          </button>
        </div>
        {toast ? <p className="mt-3 text-sm text-emerald-400">{toast}</p> : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-lg font-semibold">Original Slide</h3>
          <div className="mt-4 flex h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500">
            {data?.result?.output_path ? (
              <span>Slide preview coming from: {data.result.output_path}</span>
            ) : (
              <span>Load a task to preview slides.</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-lg font-semibold">Translated Canvas</h3>
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <Stage width={520} height={360}>
              <Layer>
                {elements.map((element, index) => (
                  <Fragment key={`${element.slide}-${index}`}>
                    <Rect
                      x={element.x / 1000}
                      y={element.y / 1000}
                      width={element.w / 1000}
                      height={element.h / 1000}
                      stroke={selectedIndex === index ? "#34d399" : "#475569"}
                      dash={[4, 4]}
                    />
                    <Text
                      text={element.text}
                      x={element.x / 1000}
                      y={element.y / 1000}
                      width={element.w / 1000}
                      height={element.h / 1000}
                      fontSize={14}
                      fill="#e2e8f0"
                      draggable
                      onClick={() => setSelectedIndex(index)}
                      onDragEnd={(event) =>
                        handleDragMove(index, event.target.x() * 1000, event.target.y() * 1000)
                      }
                    />
                  </Fragment>
                ))}
              </Layer>
            </Stage>
          </div>
          <div className="mt-4">
            <label className="text-sm text-slate-400">Edit Text</label>
            <textarea
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
              rows={4}
              value={selectedIndex !== null ? elements[selectedIndex]?.text ?? "" : ""}
              onChange={(event) => handleTextChange(event.target.value)}
              placeholder="Select a text box to edit"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;
