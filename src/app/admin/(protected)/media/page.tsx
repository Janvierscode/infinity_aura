import Image from "next/image";
import { ExternalLink, Save, Trash2 } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { CopyMarkdownButton } from "@/components/admin/copy-markdown-button";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { deleteMedia, updateMedia } from "@/features/content/cms-actions";
import { resolveMediaSource } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

function bytes(value: number) { return value < 1024 * 1024 ? `${Math.round(value / 1024)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`; }

export default async function MediaPage() {
  const supabase = await createClient(); const { data } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
  return <><header className="admin-page-header"><div><span>Supabase Storage</span><h1>Media library</h1><p>Upload business idea and service images, then maintain accessible descriptions.</p></div></header><section className="editor-panel media-upload"><div className="editor-panel-title"><h2>Upload image</h2><p>JPG, PNG, WebP, or AVIF up to 10 MB. Images are optimized automatically; SVG files are not accepted.</p></div><MediaUploadForm /></section>{data?.length ? <div className="media-grid">{data.map((asset) => <article className="media-card" key={asset.id}><div className="media-preview"><Image src={resolveMediaSource(asset.public_url)} alt={asset.alt_text || "Media preview"} fill sizes="(max-width: 700px) 100vw, 320px" /></div><div className="media-meta"><strong>{asset.original_filename}</strong><span>{asset.mime_type.replace("image/", "").toUpperCase()} · {bytes(asset.size_bytes)}</span><form action={updateMedia}><input type="hidden" name="id" value={asset.id} /><label><span>Alt text</span><input name="altText" defaultValue={asset.alt_text ?? ""} /></label><label><span>Caption</span><input name="caption" defaultValue={asset.caption ?? ""} /></label><div className="media-actions"><button className="button button-secondary"><Save size={15} /> Save</button><CopyMarkdownButton url={asset.public_url} alt={asset.alt_text || asset.original_filename} /><a className="icon-button" href={asset.public_url} target="_blank" rel="noreferrer" aria-label={`Open ${asset.original_filename}`}><ExternalLink size={16} /></a><ConfirmSubmitButton className="icon-button danger" formAction={deleteMedia} name="id" value={asset.id} label={`Delete ${asset.original_filename}`}><Trash2 size={16} /></ConfirmSubmitButton></div></form></div></article>)}</div> : <div className="admin-empty admin-panel">No media uploaded yet.</div>}</>;
}
