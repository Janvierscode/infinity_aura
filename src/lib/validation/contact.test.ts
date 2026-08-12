import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validation/contact";

describe("contactSchema", () => {
  it("accepts a complete legitimate enquiry", () => {
    const result = contactSchema.safeParse({ name: "Janvier Karemy", email: "janvier@example.com", phone: "+263 716 524 607", organization: "Infinity Aura", subject: "School platform", message: "We would like to discuss a new school management platform.", sourcePath: "/contact", website: "" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid contact details and short messages", () => {
    const result = contactSchema.safeParse({ name: "J", email: "invalid", message: "Short", sourcePath: "/contact", website: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    const result = contactSchema.safeParse({ name: "Valid Name", email: "valid@example.com", message: "This otherwise looks like a valid message.", sourcePath: "/contact", website: "bot-value" });
    expect(result.success).toBe(false);
  });
});
