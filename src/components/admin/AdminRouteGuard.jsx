import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function AdminRouteGuard({ children }) {
  const [status, setStatus] = useState("loading"); // "loading" | "admin" | "denied" | "unauthenticated"
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          setStatus("unauthenticated");
          return;
        }
        const me = await base44.auth.me();
        if (me?.role === "admin") {
          setUserEmail(me.email || me.full_name || "");
          setStatus("admin");
        } else {
          setStatus("denied");
        }
      } catch {
        setStatus("unauthenticated");
      }
    };
    check();
  }, []);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-[#1e90ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    base44.auth.redirectToLogin(window.location.href);
    return (
      <div className="fixed inset-0 bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-[#1e90ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-8">
            This area is restricted to authorized administrators.
          </p>
          <a
            href="/"
            className="inline-block bg-[#1e90ff] hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-all"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  // status === "admin"
  return <>{children}</>;
}