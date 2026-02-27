import React, { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";

const NO_NAVBAR_PAGES = ["Submitted", "Thanks", "Sorry"];

export default function Layout({ children, currentPageName }) {
  const showNavbar = !NO_NAVBAR_PAGES.includes(currentPageName);

  useEffect(() => {
    // Meta Pixel
    const metaPixelScript = document.createElement("script");
    metaPixelScript.innerHTML = `
      function getEventIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('event_id');
      }
      const eventId = getEventIdFromUrl();
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '764662699668489');
      fbq('track', 'PageView', {}, {eventID: eventId});
    `;
    document.head.appendChild(metaPixelScript);

    const noscript = document.createElement("noscript");
    noscript.innerHTML = '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=764662699668489&ev=PageView&noscript=1"/>';
    document.head.appendChild(noscript);

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