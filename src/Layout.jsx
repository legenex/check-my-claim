import React, { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";

const NO_NAVBAR_PAGES = ["Submitted", "Thanks", "Sorry"];

export default function Layout({ children, currentPageName }) {
  const showNavbar = !NO_NAVBAR_PAGES.includes(currentPageName);

  useEffect(() => {
    const scripts = [
      { src: "https://static.truecall.com/c/x3co6aj15sabuvd33z06oli1cb4qzlyn979j.js" },
      { src: "https://static.truecall.com/s/truecall.js", id: "__tc_script", "data-campaign_uuid": "x3co6aj15sabuvd33z06oli1kb4qzlyn979j" },
      { src: "//b-js.ringba.com/CA21e00314872e49f486db9db5c54eef94", async: true },
    ];

    const added = scripts.map((attrs) => {
      if (attrs.id && document.getElementById(attrs.id)) return null;
      const s = document.createElement("script");
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "async") s.async = v;
        else s.setAttribute(k, v);
      });
      document.head.appendChild(s);
      return s;
    });

    return () => {
      added.forEach((s) => s && s.parentNode && s.parentNode.removeChild(s));
    };
  }, []);

  return (
    <div>
      {showNavbar && <Navbar />}
      {children}
    </div>
  );
}