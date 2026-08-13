import { saveSettings } from "@/features/content/actions";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .single();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <span>Global configuration</span>
          <h1>Company settings</h1>
          <p>
            These values control business identity, contact details, and
            default search metadata.
          </p>
        </div>
      </header>

      <form className="editor-form settings-form" action={saveSettings}>
        <section className="editor-panel">
          <div className="editor-panel-title">
            <h2>Public company details</h2>
            <p>Keep these details accurate across the website.</p>
          </div>
          <div className="editor-fields">
            <label>
              <span>Company name</span>
              <input
                name="companyName"
                defaultValue={data?.company_name ?? "Infinity Aura Technologies"}
                required
              />
            </label>
            <label>
              <span>Legal name</span>
              <input
                name="legalName"
                defaultValue={data?.legal_name ?? "Infinity Aura Technologies"}
              />
            </label>
            <label className="field-wide">
              <span>Tagline</span>
              <input
                name="tagline"
                defaultValue={data?.tagline ?? "Innovate. Build. Empower."}
                required
              />
            </label>
            <label>
              <span>Public email</span>
              <input
                name="publicEmail"
                type="email"
                defaultValue={data?.public_email ?? "info@infinityaura.tech"}
                required
              />
            </label>
            <label>
              <span>Lead email</span>
              <input
                name="enquiryEmail"
                type="email"
                defaultValue={data?.enquiry_email ?? "iyakaremyejanvier@gmail.com"}
                required
              />
            </label>
            <label>
              <span>Phone</span>
              <input
                name="phone"
                defaultValue={data?.phone ?? "+263 716 524 607"}
              />
            </label>
            <label>
              <span>Street address</span>
              <input name="addressLine" defaultValue={data?.address_line ?? ""} />
            </label>
            <label>
              <span>City</span>
              <input name="city" defaultValue={data?.city ?? "Harare"} />
            </label>
            <label>
              <span>Country code</span>
              <input
                name="countryCode"
                defaultValue={data?.country_code ?? "ZW"}
                minLength={2}
                maxLength={2}
                required
              />
            </label>
            <label>
              <span>Timezone</span>
              <input
                name="timezone"
                defaultValue={data?.timezone ?? "Africa/Harare"}
                required
              />
            </label>
            <label>
              <span>Website URL</span>
              <input
                name="websiteUrl"
                type="url"
                defaultValue={data?.website_url ?? "https://www.infinityaura.tech"}
                required
              />
            </label>
            <label className="field-wide">
              <span>Default search title</span>
              <input
                name="defaultMetaTitle"
                defaultValue={data?.default_meta_title ?? ""}
                maxLength={160}
              />
            </label>
            <label className="field-wide">
              <span>Default search description</span>
              <textarea
                name="defaultMetaDescription"
                rows={3}
                defaultValue={data?.default_meta_description ?? ""}
                maxLength={320}
              />
            </label>
          </div>
        </section>

        <aside className="editor-panel editor-publish">
          <div className="editor-panel-title">
            <h2>Save changes</h2>
            <p>Changes apply across the public website.</p>
          </div>
          <div className="editor-fields">
            <button className="button button-primary">Update settings</button>
          </div>
        </aside>
      </form>
    </>
  );
}
