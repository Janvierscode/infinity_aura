"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadMedia } from "@/features/content/cms-actions";
import type { CmsActionState } from "@/features/content/cms-actions";

const initialState: CmsActionState = {};

export function MediaUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(uploadMedia, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} className="editor-fields" action={action}>
      <label className="field-wide file-field">
        <span>Image file</span>
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          disabled={pending}
        />
        <small>Choose a JPG, PNG, WebP, or AVIF image.</small>
      </label>
      <label><span>Alternative text</span><input name="altText" maxLength={240} placeholder="Describe meaningful visual content" disabled={pending} /></label>
      <label><span>Caption</span><input name="caption" maxLength={500} placeholder="Optional public caption" disabled={pending} /></label>
      <button className="button button-primary field-wide" disabled={pending}>
        {pending ? <Loader2 className="spin" size={17} /> : <Upload size={17} />}
        {pending ? "Optimizing and uploading..." : "Upload to library"}
      </button>
      {state.message ? <p className={`form-status ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
    </form>
  );
}
