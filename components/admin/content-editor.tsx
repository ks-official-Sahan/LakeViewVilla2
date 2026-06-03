"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { saveContentBlock, getContentBlockVersions } from "@/lib/admin/content-actions";
import { SECTION_SCHEMAS, sectionSchemaKey, type SectionField } from "@/lib/admin/section-schemas";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";
import { ChevronDown, ChevronRight, Save, Code, Layout, Eye, History, ImageIcon, Loader2, RefreshCw, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface ContentEditorProps {
  pageSlug: string;
  sections: string[];
  initialBlocks: { sectionSlug: string; data: unknown }[];
}

interface BlockVersion {
  id: string;
  version: number;
  data: any;
  publishedAt: Date | string | null;
  createdAt: Date | string;
}

function parseDataMap(
  sections: string[],
  initialBlocks: ContentEditorProps["initialBlocks"],
): Record<string, string> {
  const map: Record<string, string> = {};
  sections.forEach((sec) => {
    const existing = initialBlocks.find((b) => b.sectionSlug === sec);
    map[sec] = existing ? JSON.stringify(existing.data, null, 2) : "{\n  \n}";
  });
  return map;
}

function safeParseObject(raw: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(raw) as unknown;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export function ContentEditor({ pageSlug, sections, initialBlocks }: ContentEditorProps) {
  const [activeSection, setActiveSection] = useState<string | null>(sections[0] || null);
  const [saving, setSaving] = useState(false);
  const [publishImmediate, setPublishImmediate] = useState(true);
  const [dataMap, setDataMap] = useState<Record<string, string>>(() =>
    parseDataMap(sections, initialBlocks),
  );

  // Schema for the active section
  const schemaForActive = useMemo(() => {
    if (!activeSection) return undefined;
    return SECTION_SCHEMAS[sectionSchemaKey(pageSlug, activeSection)];
  }, [pageSlug, activeSection]);

  const [viewMode, setViewMode] = useState<"form" | "json" | "preview">("form");
  const [versions, setVersions] = useState<BlockVersion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Image Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<string | null>(null);

  // Automatically adjust view mode depending on schema availability
  useEffect(() => {
    if (schemaForActive) {
      setViewMode("form");
    } else {
      setViewMode("json");
    }
  }, [activeSection, schemaForActive]);

  // Load history whenever active section changes
  const fetchHistory = useCallback(async () => {
    if (!activeSection) return;
    setLoadingHistory(true);
    try {
      const history = await getContentBlockVersions(pageSlug, activeSection);
      setVersions(history as any);
    } catch (e) {
      console.error("Failed to load section history:", e);
    } finally {
      setLoadingHistory(false);
    }
  }, [pageSlug, activeSection]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSave = async (sectionSlug: string) => {
    try {
      setSaving(true);
      const dataStr = dataMap[sectionSlug];
      const parsedData = JSON.parse(dataStr) as unknown;
      
      // Save content block (versioning is handled dynamically by server action)
      await saveContentBlock(pageSlug, sectionSlug, parsedData);
      
      toast.success("Saved successfully!");
      fetchHistory(); // Refresh history timeline
    } catch {
      toast.error("Invalid JSON format. Please fix syntax errors before saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDataChange = useCallback((sectionSlug: string, newValue: string) => {
    setDataMap((prev) => ({ ...prev, [sectionSlug]: newValue }));
  }, []);

  const setFieldValue = useCallback(
    (sectionSlug: string, key: string, value: any) => {
      setDataMap((prev) => {
        const raw = prev[sectionSlug];
        const base = safeParseObject(raw) ?? {};
        const next = { ...base, [key]: value };
        return { ...prev, [sectionSlug]: JSON.stringify(next, null, 2) };
      });
    },
    [],
  );

  const handleChooseImage = (fieldKey: string) => {
    setActiveImageField(fieldKey);
    setMediaPickerOpen(true);
  };

  const handleClearImage = (sectionSlug: string, fieldKey: string) => {
    setFieldValue(sectionSlug, fieldKey, "");
  };

  const switchToForm = () => {
    if (!activeSection || !schemaForActive) return;
    const parsed = safeParseObject(dataMap[activeSection]);
    if (!parsed) {
      toast.error("Fix JSON syntax before using the form editor.");
      return;
    }
    setViewMode("form");
  };

  const renderFieldInput = (sectionSlug: string, field: SectionField, obj: Record<string, unknown>) => {
    const rawVal = obj[field.key];
    const strVal = rawVal === undefined || rawVal === null ? "" : String(rawVal);

    const commonClass =
      "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all";

    const maxLen = "maxLength" in field ? field.maxLength : undefined;

    if (field.type === "textarea") {
      return (
        <textarea
          value={strVal}
          maxLength={maxLen}
          rows={4}
          onChange={(e) => setFieldValue(sectionSlug, field.key, e.target.value)}
          className={commonClass}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
        />
      );
    }

    if (field.type === "image") {
      return (
        <div className="space-y-3">
          {strVal ? (
            <div className="relative aspect-[16/6] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
              <Image
                src={strVal}
                alt="Selected background or visual element"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleClearImage(sectionSlug, field.key)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex aspect-[16/4] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs text-[var(--color-muted)]">
              <ImageIcon className="mb-2 h-6 w-6 opacity-60" />
              No image selected for this slot.
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleChooseImage(field.key)}
              className="flex items-center gap-1.5"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Choose from Library
            </Button>
            {strVal && (
              <span className="truncate text-[10px] text-[var(--color-muted)] self-center max-w-[200px]">
                {strVal}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <input
        type={field.type === "url" ? "url" : "text"}
        value={strVal}
        maxLength={maxLen}
        onChange={(e) => setFieldValue(sectionSlug, field.key, e.target.value)}
        className={commonClass}
        placeholder={`Enter ${field.label.toLowerCase()}...`}
      />
    );
  };

  // Renders a high-fidelity visual layout simulation of the section based on state
  const renderLivePreview = () => {
    if (!activeSection) return null;
    const data = safeParseObject(dataMap[activeSection]) ?? {};

    // Live preview styled specifically per page section
    const bgUrl = typeof data.bgImage === "string" ? data.bgImage : "";
    const headline = typeof data.headline === "string" ? data.headline : "Heading";
    const subheadline = typeof data.subheadline === "string" ? data.subheadline : "Description text";
    const ctaLabel = typeof data.ctaLabel === "string" ? data.ctaLabel : "Explore Stays";
    
    return (
      <div className="flex h-full min-h-[380px] flex-col items-center justify-center p-6 bg-stone-900 text-stone-100 rounded-2xl relative overflow-hidden shadow-inner">
        {/* Background visual (optional) */}
        {bgUrl ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={bgUrl}
              alt="Live background preview"
              fill
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-900/60" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800/80 via-stone-900 to-stone-950 opacity-40" />
        )}

        <div className="relative z-10 text-center max-w-xl space-y-4">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-[10px] text-cyan-300 font-mono tracking-widest uppercase">
            Live Preview
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-50 font-serif leading-tight">
            {headline}
          </h1>
          <p className="text-sm md:text-base text-stone-300 font-light leading-relaxed">
            {subheadline}
          </p>
          {typeof data.ctaLabel === "string" && data.ctaLabel && (
            <div className="pt-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9a55a] px-5 py-2 text-xs font-semibold text-stone-950 hover:bg-[#c9a55a]/90 transition-colors shadow-lg shadow-[#c9a55a]/10">
                {ctaLabel}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        filterType="IMAGE"
        title="Select media asset"
        onSelect={(asset) => {
          if (activeSection && activeImageField) {
            setFieldValue(activeSection, activeImageField, asset.url);
          }
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <div className="space-y-2 lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Page Sections</h3>
              <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--color-primary)] uppercase">
                {pageSlug}
              </span>
            </div>
            <div className="space-y-1 p-2">
              {sections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setActiveSection(sec)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                    activeSection === sec
                      ? "bg-[var(--color-primary)]/10 font-medium text-[var(--color-primary)] shadow-sm"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  <span className="capitalize">{sec.replace(/-/g, " ")}</span>
                  {activeSection === sec ? (
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-75" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-55" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Block Editor Panel */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Main Editing Card */}
              <div className="xl:col-span-2 flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4 bg-[var(--color-background)]/30">
                  <div>
                    <h2 className="text-lg font-bold capitalize text-[var(--color-foreground)]">
                      {activeSection.replace(/-/g, " ")}
                    </h2>
                    <p className="text-xs text-[var(--color-muted)]">
                      {schemaForActive
                        ? `${schemaForActive.label} — customize fields or inspect JSON.`
                        : "Edit JSON payload directly (no metadata schema configured)."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {schemaForActive ? (
                      <div className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-1">
                        <button
                          type="button"
                          onClick={switchToForm}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            viewMode === "form"
                              ? "bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm"
                              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                          }`}
                        >
                          <Layout className="h-3.5 w-3.5" /> Form
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("json")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            viewMode === "json"
                              ? "bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm"
                              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                          }`}
                        >
                          <Code className="h-3.5 w-3.5" /> JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("preview")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            viewMode === "preview"
                              ? "bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm"
                              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </button>
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      onClick={() => handleSave(activeSection)}
                      disabled={saving}
                      className="flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                </div>

                <div className="relative min-h-0 flex-1 p-5 bg-[var(--color-surface)]">
                  {viewMode === "json" || !schemaForActive ? (
                    <textarea
                      value={dataMap[activeSection]}
                      onChange={(e) => handleDataChange(activeSection, e.target.value)}
                      className="h-full min-h-[380px] w-full resize-none rounded-xl bg-stone-950 p-4 font-mono text-sm leading-relaxed text-stone-100 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      spellCheck={false}
                    />
                  ) : viewMode === "preview" ? (
                    renderLivePreview()
                  ) : (
                    <div className="space-y-5">
                      {schemaForActive.fields.map((field) => {
                        const obj = safeParseObject(dataMap[activeSection]) ?? {};
                        return (
                          <div key={field.key} className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--color-foreground)]">
                              {field.label}
                            </label>
                            {renderFieldInput(activeSection, field, obj)}
                            {"maxLength" in field && field.maxLength ? (
                              <div className="text-[10px] text-[var(--color-muted)] text-right">
                                Max {field.maxLength} characters
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Version History Sidebar */}
              <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden h-[min(720px,75vh)]">
                <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-[var(--color-primary)]" />
                    <h3 className="font-semibold text-sm text-[var(--color-foreground)]">Version History</h3>
                  </div>
                  <button
                    onClick={fetchHistory}
                    className="p-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] rounded transition-colors"
                    title="Refresh timeline"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin" : ""}`} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-16 text-xs text-[var(--color-muted)] gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                      Loading snapshots...
                    </div>
                  ) : versions.length === 0 ? (
                    <div className="text-center py-12 text-xs text-[var(--color-muted)]">
                      No snapshots captured yet. Saving edits creates version records automatically.
                    </div>
                  ) : (
                    versions.map((ver) => {
                      const pubDate = ver.publishedAt ? new Date(ver.publishedAt) : null;
                      return (
                        <div
                          key={ver.id}
                          className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]/40 hover:bg-[var(--color-background)]/80 transition-all flex flex-col space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-500 font-mono">
                              v{ver.version}
                            </span>
                            <span className="text-[10px] text-[var(--color-muted)] font-mono">
                              {pubDate ? pubDate.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "Draft"}
                            </span>
                          </div>
                          
                          <pre className="text-[9px] font-mono text-[var(--color-muted)] truncate max-h-[44px] overflow-hidden leading-relaxed bg-[var(--color-background)] p-1.5 rounded-lg border border-[var(--color-border)]/50">
                            {JSON.stringify(ver.data)}
                          </pre>
                          
                          <div className="flex gap-2 justify-end pt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const restoredRaw = JSON.stringify(ver.data, null, 2);
                                handleDataChange(activeSection, restoredRaw);
                                toast.success(`Restored v${ver.version} draft to editor! Save to make it active.`);
                              }}
                              className="h-7 text-[10px] px-2.5 flex items-center gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Load in Editor
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm">
              Select a section from the sidebar to begin editing.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
