"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
export function CopyMarkdownButton({ url, alt }: { url: string; alt: string }) { const [copied, setCopied] = useState(false); return <button className="icon-button" type="button" onClick={async () => { await navigator.clipboard.writeText(`![${alt}](${url})`); setCopied(true); setTimeout(() => setCopied(false), 1500); }} aria-label="Copy image Markdown">{copied ? <Check size={16} /> : <Copy size={16} />}</button>; }
