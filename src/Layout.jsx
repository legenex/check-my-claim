import React from "react";
import Navbar from "@/components/landing/Navbar";

export default function Layout({ children, currentPageName }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}