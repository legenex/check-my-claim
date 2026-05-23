import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function SurveyPage() {
  const { slug } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Try to find by slug param or use default "mva"
        const targetSlug = slug || "mva";
        const results = await base44.entities.Survey.filter({ slug: targetSlug, status: "published" });
        setSurvey(results[0] || null);
      } catch (e) {
        setSurvey(null);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-3">🚧</div>
          <div className="text-xl font-bold mb-2">Survey not available</div>
          <div className="text-slate-400 text-sm">This survey is not published yet.</div>
        </div>
      </div>
    );
  }

  // Survey runtime placeholder — full runtime engine mounts here
  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-white">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-3">📋</div>
        <div className="text-2xl font-bold mb-2">{survey.name}</div>
        <div className="text-slate-400 text-sm">Survey runtime is loading...</div>
        <div className="mt-4 text-xs text-slate-600">ID: {survey.id} · Steps: {(survey.step_order || []).length}</div>
      </div>
    </div>
  );
}