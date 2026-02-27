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

    const tiktokScript = document.createElement("script");
    tiktokScript.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
        var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
        ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load('D6GNOQRC77U61H03K31G');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(tiktokScript);

    const noscript = document.createElement("noscript");
    noscript.innerHTML = '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=764662699668489&ev=PageView&noscript=1"/>';
    document.head.appendChild(noscript);

    const scripts = [
      { src: "https://static.truecall.com/c/xg60dqbonituu0aebhl2qq83cmoh46t1c2nb.js" },
      { src: "https://static.truecall.com/s/truecall.js" },
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