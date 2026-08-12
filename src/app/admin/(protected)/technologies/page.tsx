import { Save, Trash2 } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  deleteTechnology,
  saveTechnology,
  saveTechnologyCategory,
} from "@/features/content/cms-actions";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTechnologiesPage() {
  const supabase = await createClient();
  const [categories, technologies] = await Promise.all([
    supabase.from("technology_categories").select("*").order("sort_order"),
    supabase.from("technologies").select("*").order("sort_order"),
  ]);

  return (
    <>
      <header className="admin-page-header">
        <div>
          <span>Technical capabilities</span>
          <h1>Technologies</h1>
          <p>Organize the modern tools shown on the public homepage.</p>
        </div>
      </header>

      <div className="admin-stack">
        {categories.data?.map((category) => (
          <section className="editor-panel" key={category.id}>
            <form
              className="editor-panel-title inline-title-form"
              action={saveTechnologyCategory}
            >
              <input type="hidden" name="id" value={category.id} />
              <input
                name="name"
                defaultValue={category.name}
                aria-label="Category name"
                required
              />
              <input
                name="slug"
                defaultValue={category.slug}
                aria-label="Category slug"
                required
              />
              <input
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={category.sort_order}
                aria-label="Category order"
              />
              <label className="mini-check">
                <input
                  name="visible"
                  type="checkbox"
                  defaultChecked={category.is_visible}
                />
                Visible
              </label>
              <button className="icon-button" aria-label="Save category">
                <Save size={16} />
              </button>
            </form>

            <div className="inline-record-list">
              {technologies.data
                ?.filter((item) => item.category_id === category.id)
                .map((item) => (
                  <form
                    className="inline-record"
                    action={saveTechnology}
                    key={item.id}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name="categoryId"
                      value={category.id}
                    />
                    <input
                      name="name"
                      defaultValue={item.name}
                      aria-label="Technology name"
                      required
                    />
                    <input
                      name="shortMark"
                      defaultValue={item.short_mark ?? ""}
                      aria-label="Short mark"
                    />
                    <input
                      name="websiteUrl"
                      defaultValue={item.website_url ?? ""}
                      aria-label="Website URL"
                      placeholder="https://"
                    />
                    <input
                      name="sortOrder"
                      type="number"
                      min={0}
                      defaultValue={item.sort_order}
                      aria-label="Order"
                    />
                    <label className="mini-check">
                      <input
                        name="visible"
                        type="checkbox"
                        defaultChecked={item.is_visible}
                      />
                      Visible
                    </label>
                    <button
                      className="icon-button"
                      aria-label={`Save ${item.name}`}
                    >
                      <Save size={16} />
                    </button>
                    <ConfirmSubmitButton
                      className="icon-button danger"
                      formAction={deleteTechnology}
                      name="kind"
                      value="item"
                      label={`Delete ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </ConfirmSubmitButton>
                  </form>
                ))}

              <form className="inline-record new-record" action={saveTechnology}>
                <input type="hidden" name="categoryId" value={category.id} />
                <input name="name" placeholder="New technology" required />
                <input name="shortMark" placeholder="Mark" />
                <input name="websiteUrl" placeholder="https://" />
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={100}
                />
                <label className="mini-check">
                  <input name="visible" type="checkbox" defaultChecked />
                  Visible
                </label>
                <button className="button button-secondary">Add</button>
              </form>
            </div>
          </section>
        ))}

        <section className="editor-panel compact-create">
          <div className="editor-panel-title">
            <h2>Add category</h2>
          </div>
          <form className="editor-fields" action={saveTechnologyCategory}>
            <label>
              <span>Name</span>
              <input name="name" required />
            </label>
            <label>
              <span>Slug</span>
              <input name="slug" required />
            </label>
            <label>
              <span>Order</span>
              <input name="sortOrder" type="number" min={0} defaultValue={100} />
            </label>
            <label className="checkbox-field">
              <input name="visible" type="checkbox" defaultChecked />
              <span>Visible</span>
            </label>
            <button className="button button-primary field-wide">
              Add category
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
