import React from "react";
import { QuizRuntimeEmbedded } from "@/pages/QuizRuntime";

/**
 * EmbeddedQuiz — thin wrapper that passes quizId into the QuizRuntime in embedded mode.
 */
export default function EmbeddedQuiz({ quizId, onFirstInteraction }) {
  return <QuizRuntimeEmbedded quizId={quizId} onFirstInteraction={onFirstInteraction} />;
}