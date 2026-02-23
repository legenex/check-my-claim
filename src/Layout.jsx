import React from "react";
import Navbar from "@/components/landing/Navbar";

export default function Layout({ children, currentPageName }) {
  // Hide navbar on survey page
  const hideNavbar = currentPageName === "Survey";

  return (
    <div>
      {!hideNavbar && <Navbar />}
      {children}
    </div>
  );
}