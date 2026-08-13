import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { isSafeMarkdownUrl } from "@/lib/ideas";

export function MarkdownContent({ markdown, compact = false }: { markdown: string; compact?: boolean }) {
  return (
    <div className={compact ? "idea-prose preview-prose" : "idea-prose"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        skipHtml
        urlTransform={(url, key) => isSafeMarkdownUrl(url, key === "src") ? url : ""}
        components={{
          a: ({ href, children }) => href?.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} target="_blank" rel="noreferrer">{children}</a>,
          img: ({ src, alt }) => typeof src === "string" && isSafeMarkdownUrl(src, true) ? <Image src={src} alt={alt ?? ""} width={1200} height={675} sizes="(max-width: 800px) 100vw, 760px" /> : null,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
