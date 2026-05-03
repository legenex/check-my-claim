import React from "react";
import { useParams } from "react-router-dom";
import AdvertorialPublicPage from "@/components/advertorials/AdvertorialPublicPage";
import ClaimBotWidget from "@/components/claimbot/ClaimBotWidget";

export default function AdvertorialPage() {
  const { slug } = useParams();
  return (
    <>
      <AdvertorialPublicPage slug={slug} />
      <ClaimBotWidget pageType="advertorial" advertorialSlug={slug || ""} />
    </>
  );
}