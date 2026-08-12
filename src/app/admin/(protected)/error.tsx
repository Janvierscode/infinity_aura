"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="admin-error" role="alert">
      <AlertTriangle size={28} />
      <span>Something needs attention</span>
      <h1>That change could not be completed.</h1>
      <p>
        Your existing content is still safe. Check the information and try the
        action again.
      </p>
      <button className="button button-primary" onClick={reset} type="button">
        <RotateCcw size={16} />
        Try again
      </button>
    </section>
  );
}
