export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ContentStatus = "draft" | "published" | "archived";
export type EnquiryStatus = "new" | "read" | "in_progress" | "replied" | "closed" | "spam";
export type NavigationLocation = "header" | "footer_primary" | "footer_services" | "legal";
export type SectionType = "hero" | "rich_text" | "purpose" | "services" | "statistics" | "solutions" | "technologies" | "testimonials" | "contact" | "cta";

type AuditFields = { created_at: string; updated_at: string; updated_by: string | null };
type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

export type ServiceRow = AuditFields & { id: string; slug: string; title: string; summary: string; body: string; icon_key: string | null; hero_media_id: string | null; is_featured: boolean; status: ContentStatus; sort_order: number; meta_title: string | null; meta_description: string | null; published_at: string | null };
export type SolutionRow = AuditFields & { id: string; slug: string; title: string; category: string | null; summary: string; body: string; challenge: string | null; approach: string | null; benefits: Json; hero_media_id: string | null; is_featured: boolean; status: ContentStatus; sort_order: number; meta_title: string | null; meta_description: string | null; published_at: string | null };
export type PageRow = AuditFields & { id: string; slug: string; name: string; status: ContentStatus; meta_title: string | null; meta_description: string | null; canonical_url: string | null; og_media_id: string | null; robots_index: boolean; published_at: string | null };
export type PageSectionRow = AuditFields & { id: string; page_id: string; section_key: string; section_type: SectionType; eyebrow: string | null; heading: string | null; accent_text: string | null; body: string | null; primary_cta_label: string | null; primary_cta_url: string | null; secondary_cta_label: string | null; secondary_cta_url: string | null; media_id: string | null; settings: Json; sort_order: number; is_visible: boolean };
export type TechnologyCategoryRow = { id: string; name: string; slug: string; sort_order: number; is_visible: boolean };
export type TechnologyRow = { id: string; category_id: string; name: string; short_mark: string | null; logo_media_id: string | null; website_url: string | null; sort_order: number; is_visible: boolean };
export type TestimonialRow = AuditFields & { id: string; quote: string; person_name: string; person_role: string | null; organization: string | null; avatar_media_id: string | null; is_approved: boolean; is_featured: boolean; sort_order: number; published_at: string | null };
export type NavigationItemRow = { id: string; location: NavigationLocation; label: string; url: string; parent_id: string | null; open_in_new_tab: boolean; sort_order: number; is_visible: boolean };
export type SocialLinkRow = { id: string; platform: string; label: string; url: string; icon_key: string; sort_order: number; is_visible: boolean };
export type MediaAssetRow = { id: string; bucket: string; object_path: string; public_url: string; original_filename: string; mime_type: string; size_bytes: number; width: number | null; height: number | null; alt_text: string | null; caption: string | null; uploaded_by: string; created_at: string };
export type ContactEnquiryRow = { id: string; reference_number: string; name: string; email: string; phone: string | null; organization: string | null; service_id: string | null; subject: string | null; message: string; status: EnquiryStatus; source_path: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; notification_status: "pending" | "sent" | "failed"; internal_note: string | null; read_at: string | null; closed_at: string | null; created_at: string };

export type SiteSettingsRow = AuditFields & { id: boolean; company_name: string; tagline: string; legal_name: string | null; public_email: string; enquiry_email: string; phone: string | null; address_line: string | null; city: string | null; country_code: string | null; timezone: string; website_url: string | null; default_meta_title: string | null; default_meta_description: string | null; default_og_media_id: string | null; logo_media_id: string | null; icon_media_id: string | null };

export type Database = {
  public: {
    Tables: {
      services: TableDefinition<ServiceRow, Omit<Partial<ServiceRow>, "id" | "created_at" | "updated_at">>;
      solutions: TableDefinition<SolutionRow, Omit<Partial<SolutionRow>, "id" | "created_at" | "updated_at">>;
      pages: TableDefinition<PageRow, Omit<Partial<PageRow>, "id" | "created_at" | "updated_at">>;
      page_sections: TableDefinition<PageSectionRow, Omit<Partial<PageSectionRow>, "id" | "created_at" | "updated_at">>;
      technology_categories: TableDefinition<TechnologyCategoryRow>;
      technologies: TableDefinition<TechnologyRow>;
      testimonials: TableDefinition<TestimonialRow>;
      navigation_items: TableDefinition<NavigationItemRow>;
      social_links: TableDefinition<SocialLinkRow>;
      media_assets: TableDefinition<MediaAssetRow>;
      contact_enquiries: TableDefinition<ContactEnquiryRow, Pick<ContactEnquiryRow, "name" | "email" | "message"> & Partial<ContactEnquiryRow>>;
      site_settings: TableDefinition<SiteSettingsRow>;
      content_revisions: TableDefinition<{ id: string; entity_type: string; entity_id: string; revision_number: number; snapshot: Json; change_summary: string | null; created_by: string; created_at: string }>;
      audit_logs: TableDefinition<{ id: number; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string }>;
      stat_items: TableDefinition<{ id: string; section_id: string; label: string; value: number; prefix: string | null; suffix: string | null; description: string | null; sort_order: number; is_visible: boolean }>;
    };
    Views: Record<string, never>;
    Functions: { is_app_admin: { Args: Record<PropertyKey, never>; Returns: boolean } };
    Enums: { content_status: ContentStatus; enquiry_status: EnquiryStatus; notification_status: "pending" | "sent" | "failed"; navigation_location: NavigationLocation; section_type: SectionType };
    CompositeTypes: Record<string, never>;
  };
};
