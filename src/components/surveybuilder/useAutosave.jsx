import { useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useAutosave() {
  const timerRef = useRef(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [savedAt, setSavedAt] = useState(null);

  const save = useCallback(async (entityName, id, data) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState("saving");
    timerRef.current = setTimeout(async () => {
      try {
        await base44.entities[entityName].update(id, data);
        setSaveState("saved");
        setSavedAt(new Date());
      } catch (e) {
        setSaveState("error");
      }
    }, 800);
  }, []);

  const saveNow = useCallback(async (entityName, id, data) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState("saving");
    try {
      await base44.entities[entityName].update(id, data);
      setSaveState("saved");
      setSavedAt(new Date());
    } catch (e) {
      setSaveState("error");
    }
  }, []);

  const saveStep = useCallback(async (stepId, data) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState("saving");
    timerRef.current = setTimeout(async () => {
      try {
        await base44.entities.SurveyStep.update(stepId, data);
        setSaveState("saved");
        setSavedAt(new Date());
      } catch (e) {
        setSaveState("error");
      }
    }, 800);
  }, []);

  const savedLabel = () => {
    if (saveState === "saving") return "Saving...";
    if (saveState === "error") return "Save error";
    if (saveState === "saved" && savedAt) {
      const sec = Math.floor((Date.now() - savedAt.getTime()) / 1000);
      return `Saved ${sec < 5 ? "just now" : sec + "s ago"}`;
    }
    return "All changes saved";
  };

  return { save, saveNow, saveStep, saveState, savedLabel };
}