import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import LandingPageEditorTopBar from "@/components/landingpages/LandingPageEditorTopBar";
import LandingPageEditorTabs from "@/components/landingpages/LandingPageEditorTabs";
import LandingPagePreview from "@/components/landingpages/LandingPagePreview";

export default function LandingPageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeTab, setActiveTab] = useState("hero");
  const [previewMode, setPreviewMode] = useState("desktop"); // "desktop" | "mobile"
  const autoSaveTimer = useRef(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const [pages, qs, bs] = await Promise.all([
      base44.entities.LandingPage.filter({ id }),
      base44.entities.Quiz.filter({ status: "Published" }),
      base44.entities.DecisionTreeBrand.list(),
    ]);
    setPage(pages[0] || null);
    setQuizzes(qs);
    setBrands(bs);
    setLoading(false);
  };

  const updatePage = useCallback((patch) => {
    setPage(prev => ({ ...prev, ...patch }));
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true);
      await base44.entities.LandingPage.update(id, patch);
      setSaving(false);
      setLastSaved(new Date());
    }, 1500);
  }, [id]);

  const savePage = async (patch = {}) => {
    setSaving(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    const merged = { ...page, ...patch };
    await base44.entities.LandingPage.update(id, merged);
    setPage(merged);
    setSaving(false);
    setLastSaved(new Date());
  };

  const publishPage = async () => {
    await savePage({
      status: "published",
      published_at: new Date().toISOString(),
      version: (page.version || 1) + 1,
    });
  };

  if (loading) return (
    <AdminRouteGuard>
      <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-[#1e90ff] rounded-full animate-spin" />
      </div>
    </AdminRouteGuard>
  );

  if (!page) return (
    <AdminRouteGuard>
      <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">Landing page not found</p>
          <button onClick={() => navigate("/admin/LandingPages")} className="text-[#1e90ff] hover:underline text-sm">← Back to list</button>
        </div>
      </div>
    </AdminRouteGuard>
  );

  return (
    <AdminRouteGuard>
      <div className="fixed inset-0 bg-[#0a1628] flex flex-col overflow-hidden">
        <LandingPageEditorTopBar
          page={page}
          saving={saving}
          lastSaved={lastSaved}
          quizzes={quizzes}
          brands={brands}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          onTitleChange={t => updatePage({ title: t })}
          onSlugChange={s => updatePage({ slug: s })}
          onPublish={publishPage}
          onBack={() => navigate("/admin/LandingPages")}
        />
        <div className="flex-1 flex overflow-hidden">
          {/* Left: tabs */}
          <div className="w-96 flex-shrink-0 bg-[#0f1e35] border-r border-white/10 overflow-y-auto">
            <LandingPageEditorTabs
              page={page}
              quizzes={quizzes}
              brands={brands}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onUpdate={updatePage}
            />
          </div>
          {/* Right: live preview */}
          <div className="flex-1 overflow-auto bg-[#060e1a] p-4 flex flex-col items-center">
            <LandingPagePreview page={page} previewMode={previewMode} quizzes={quizzes} brands={brands} />
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  );
}