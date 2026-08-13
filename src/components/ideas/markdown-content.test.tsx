import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownContent } from "@/components/ideas/markdown-content";

describe("MarkdownContent", () => {
  it("renders supported Markdown structure", () => {
    const html = renderToStaticMarkup(<MarkdownContent markdown={"## Heading\n\n- One\n- Two"} />);

    expect(html).toContain("<h2>Heading</h2>");
    expect(html).toContain("<li>One</li>");
  });

  it("removes raw HTML and dangerous links", () => {
    const html = renderToStaticMarkup(
      <MarkdownContent markdown={'<script>alert("unsafe")</script>\n\n[Unsafe](javascript:alert("unsafe"))'} />,
    );

    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("Unsafe");
  });
});
