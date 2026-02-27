import React from "react";
import Navbar from "@/components/landing/Navbar";

const NO_NAVBAR_PAGES = ["Submitted", "Thanks", "Sorry"];

export default function Layout({ children, currentPageName }) {
  const showNavbar = !NO_NAVBAR_PAGES.includes(currentPageName);
  return (
    <div>
      {showNavbar && <Navbar />}
      {children}
    </div>
  );
}