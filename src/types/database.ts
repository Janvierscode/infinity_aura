export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ContentStatus = "draft" | "published" | "archived";
export type EnquiryStatus = "new" | "read" | "in_progress" | "replied" | "closed" | "spam";
export type CommentStatus = "visible" | "hidden";
export type InvestmentLevel = "low" | "moderate" | "high";

type AuditFields = { created_at: string; updated_at: string; updated_by: string | null };
type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type MediaAssetRow = {
  id: string;
  bucket: string;
  object_path: string;
  public_url: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  uploaded_by: string;
  created_at: string;
};

export type ServiceRow = AuditFields & {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon_key: string | null;
  hero_media_id: string | null;
  is_featured: boolean;
  status: ContentStatus;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
};

export type IdeaCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BusinessIdeaRow = AuditFields & {
  id: string;
  title: string;
  slug: string;
  summary: string;
  preview_markdown: string;
  body_markdown: string;
  category_id: string;
  cover_media_id: string | null;
  investment: InvestmentLevel;
  launch_time: string | null;
  status: ContentStatus;
  is_featured: boolean;
  upvote_count: number;
  downvote_count: number;
  vote_score: number;
  comment_count: number;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
};

export type PublicBusinessIdea = Omit<
  BusinessIdeaRow,
  "body_markdown" | "updated_by"
>;

export type PublicMediaAsset = Pick<MediaAssetRow, "id" | "public_url" | "alt_text" | "width" | "height">;

export type BusinessIdeaCard = Pick<
  PublicBusinessIdea,
  | "id"
  | "title"
  | "slug"
  | "summary"
  | "category_id"
  | "cover_media_id"
  | "investment"
  | "launch_time"
  | "is_featured"
  | "upvote_count"
  | "downvote_count"
  | "vote_score"
  | "comment_count"
  | "published_at"
> & {
  category: Pick<IdeaCategoryRow, "id" | "name" | "slug"> | null;
  cover: PublicMediaAsset | null;
};

export type BusinessIdeaWithRelations = BusinessIdeaCard & Pick<
  PublicBusinessIdea,
  "preview_markdown" | "meta_title" | "meta_description" | "created_at" | "updated_at"
>;

export type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type IdeaCommentRow = {
  id: string;
  idea_id: string;
  user_id: string;
  body: string;
  status: CommentStatus;
  upvote_count: number;
  downvote_count: number;
  vote_score: number;
  created_at: string;
  updated_at: string;
};

export type IdeaCommentWithProfile = IdeaCommentRow & {
  profile: Pick<ProfileRow, "id" | "display_name" | "avatar_url"> | null;
};

export type MemberIdeaContent = {
  body_markdown: string;
  comments: IdeaCommentWithProfile[];
  ideaVote: -1 | 1 | null;
  commentVotes: Record<string, -1 | 1>;
};

export type MemberActivitySummary = {
  comments: number;
  ideaVotes: number;
  commentVotes: number;
};

export type IdeaVoteRow = { idea_id: string; user_id: string; value: -1 | 1; created_at: string; updated_at: string };
export type CommentVoteRow = { comment_id: string; user_id: string; value: -1 | 1; created_at: string; updated_at: string };

export type ContactEnquiryRow = {
  id: string;
  reference_number: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  service_id: string | null;
  subject: string | null;
  message: string;
  status: EnquiryStatus;
  source_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  notification_status: "pending" | "sent" | "failed";
  internal_note: string | null;
  read_at: string | null;
  closed_at: string | null;
  created_at: string;
};

export type SiteSettingsRow = AuditFields & {
  id: boolean;
  company_name: string;
  tagline: string;
  legal_name: string | null;
  public_email: string;
  enquiry_email: string;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  country_code: string | null;
  timezone: string;
  website_url: string | null;
  default_meta_title: string | null;
  default_meta_description: string | null;
  default_og_media_id: string | null;
  logo_media_id: string | null;
  icon_media_id: string | null;
};

export type Database = {
  public: {
    Tables: {
      media_assets: TableDefinition<MediaAssetRow, Omit<Partial<MediaAssetRow>, "id" | "created_at">>;
      site_settings: TableDefinition<SiteSettingsRow>;
      services: TableDefinition<ServiceRow, Omit<Partial<ServiceRow>, "id" | "created_at" | "updated_at">>;
      profiles: TableDefinition<ProfileRow, Omit<Partial<ProfileRow>, "created_at" | "updated_at">>;
      idea_categories: TableDefinition<IdeaCategoryRow, Omit<Partial<IdeaCategoryRow>, "id" | "created_at" | "updated_at">>;
      business_ideas: TableDefinition<BusinessIdeaRow, Omit<Partial<BusinessIdeaRow>, "id" | "created_at" | "updated_at">>;
      idea_comments: TableDefinition<IdeaCommentRow, Omit<Partial<IdeaCommentRow>, "id" | "created_at" | "updated_at">>;
      idea_votes: TableDefinition<IdeaVoteRow, Omit<Partial<IdeaVoteRow>, "created_at" | "updated_at">>;
      comment_votes: TableDefinition<CommentVoteRow, Omit<Partial<CommentVoteRow>, "created_at" | "updated_at">>;
      contact_enquiries: TableDefinition<ContactEnquiryRow, Pick<ContactEnquiryRow, "name" | "email" | "message"> & Partial<ContactEnquiryRow>>;
    };
    Views: Record<string, never>;
    Functions: {
      is_app_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      submit_contact_enquiry: {
        Args: { p_name: string; p_email: string; p_phone?: string | null; p_organization?: string | null; p_subject?: string | null; p_message?: string | null; p_source_path?: string | null };
        Returns: Array<{ id: string; reference_number: string }>;
      };
    };
    Enums: {
      content_status: ContentStatus;
      enquiry_status: EnquiryStatus;
      notification_status: "pending" | "sent" | "failed";
      comment_status: CommentStatus;
      investment_level: InvestmentLevel;
    };
    CompositeTypes: Record<string, never>;
  };
};
