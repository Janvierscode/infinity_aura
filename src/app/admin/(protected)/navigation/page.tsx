import { Save, Trash2 } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  deleteLink,
  saveNavigationItem,
  saveSocialLink,
} from "@/features/content/cms-actions";
import { createClient } from "@/lib/supabase/server";

const locations = [
  "header",
  "footer_primary",
  "footer_services",
  "legal",
] as const;

export default async function NavigationPage() {
  const supabase = await createClient();
  const [navigation, social] = await Promise.all([
    supabase
      .from("navigation_items")
      .select("*")
      .order("location")
      .order("sort_order"),
    supabase.from("social_links").select("*").order("sort_order"),
  ]);

  return (
    <>
      <header className="admin-page-header">
        <div>
          <span>Website structure</span>
          <h1>Navigation and social links</h1>
          <p>
            Control visible labels, destinations, order, and external-link
            behavior.
          </p>
        </div>
      </header>

      <section className="editor-panel">
        <div className="editor-panel-title">
          <h2>Navigation links</h2>
          <p>Header, footer, service, and legal destinations.</p>
        </div>
        <div className="inline-record-list">
          {navigation.data?.map((item) => (
            <form
              className="inline-record link-record"
              action={saveNavigationItem}
              key={item.id}
            >
              <input type="hidden" name="id" value={item.id} />
              <select name="location" defaultValue={item.location} aria-label="Location">
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location.replace("_", " ")}
                  </option>
                ))}
              </select>
              <input name="label" defaultValue={item.label} aria-label="Label" required />
              <input name="url" defaultValue={item.url} aria-label="URL" required />
              <input
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={item.sort_order}
                aria-label="Order"
              />
              <label className="mini-check">
                <input name="visible" type="checkbox" defaultChecked={item.is_visible} />
                Visible
              </label>
              <label className="mini-check">
                <input
                  name="newTab"
                  type="checkbox"
                  defaultChecked={item.open_in_new_tab}
                />
                New tab
              </label>
              <button className="icon-button" aria-label={`Save ${item.label}`}>
                <Save size={16} />
              </button>
              <ConfirmSubmitButton
                className="icon-button danger"
                formAction={deleteLink}
                name="kind"
                value="navigation"
                label={`Delete ${item.label}`}
              >
                <Trash2 size={16} />
              </ConfirmSubmitButton>
            </form>
          ))}

          <form className="inline-record link-record new-record" action={saveNavigationItem}>
            <select name="location" defaultValue="header">
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location.replace("_", " ")}
                </option>
              ))}
            </select>
            <input name="label" placeholder="New label" required />
            <input name="url" placeholder="/path" required />
            <input name="sortOrder" type="number" min={0} defaultValue={100} />
            <label className="mini-check">
              <input name="visible" type="checkbox" defaultChecked /> Visible
            </label>
            <label className="mini-check">
              <input name="newTab" type="checkbox" /> New tab
            </label>
            <button className="button button-secondary">Add link</button>
          </form>
        </div>
      </section>

      <section className="editor-panel">
        <div className="editor-panel-title">
          <h2>Social links</h2>
          <p>External profiles displayed in the footer.</p>
        </div>
        <div className="inline-record-list">
          {social.data?.map((item) => (
            <form
              className="inline-record social-record"
              action={saveSocialLink}
              key={item.id}
            >
              <input type="hidden" name="id" value={item.id} />
              <input name="platform" defaultValue={item.platform} aria-label="Platform" required />
              <input name="label" defaultValue={item.label} aria-label="Label" required />
              <input name="url" defaultValue={item.url} aria-label="URL" required />
              <input name="iconKey" defaultValue={item.icon_key} aria-label="Icon key" required />
              <input
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={item.sort_order}
                aria-label="Order"
              />
              <label className="mini-check">
                <input name="visible" type="checkbox" defaultChecked={item.is_visible} />
                Visible
              </label>
              <button className="icon-button" aria-label={`Save ${item.label}`}>
                <Save size={16} />
              </button>
              <ConfirmSubmitButton
                className="icon-button danger"
                formAction={deleteLink}
                name="kind"
                value="social"
                label={`Delete ${item.label}`}
              >
                <Trash2 size={16} />
              </ConfirmSubmitButton>
            </form>
          ))}

          <form className="inline-record social-record new-record" action={saveSocialLink}>
            <input name="platform" placeholder="Platform" required />
            <input name="label" placeholder="Label" required />
            <input name="url" placeholder="https://" required />
            <input name="iconKey" placeholder="Icon" required />
            <input name="sortOrder" type="number" min={0} defaultValue={100} />
            <label className="mini-check">
              <input name="visible" type="checkbox" defaultChecked /> Visible
            </label>
            <button className="button button-secondary">Add profile</button>
          </form>
        </div>
      </section>
    </>
  );
}
