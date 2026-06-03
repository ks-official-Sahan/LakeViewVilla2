export type GeneratedBlogPayload = {
  title: string;
  excerpt: string;
  content: string;
  featuredImageId?: string | null;
};

export function blogGenerationSystemPrompt(tone: string, length: string): string {
  return `You are a professional copywriter for LakeViewVilla, a luxury private villa in Tangalle, Sri Lanka.
Write an engaging, SEO-optimized blog post from the user's prompt.
Tone: ${tone}. Length: ${length}.

Return ONLY valid JSON (no markdown code fences, no prose) with exactly these keys:
- "title": string, concise headline
- "excerpt": string, 2 sentences max for listings
- "content": string, full post body in Markdown only (use ## and ### headings, lists where appropriate). No YAML frontmatter inside this string.
- "featuredImageId": string or null, select the exact Image ID from the list of provided images in the user prompt that best fits as the featured image, or null if none fit.`;
}

export function buildBlogGenerationUserMessage(input: {
  prompt: string;
  imageDescription?: string;
  featuredImageUrl?: string;
}): string {
  const chunks = [input.prompt.trim()];
  if (input.imageDescription?.trim()) {
    chunks.push(
      `Featured image / scene context (weave into the story only where natural): ${input.imageDescription.trim()}`,
    );
  }
  if (input.featuredImageUrl?.trim()) {
    chunks.push(
      `Hero image URL for editorial context only — do not paste raw URLs into the article unless editorially necessary: ${input.featuredImageUrl.trim()}`,
    );
  }
  return chunks.join("\n\n");
}

export function parseCleanJson<T>(raw: string): T | null {
  let cleaned = raw.trim();
  
  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?\n?|```$/g, "").trim();
  }
  
  // If it still doesn't start with "{", try to find the first '{' and last '}'
  if (!cleaned.startsWith("{")) {
    const startIdx = cleaned.indexOf("{");
    const endIdx = cleaned.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.slice(startIdx, endIdx + 1);
    }
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error("[parseCleanJson] Failed parsing JSON:", e, cleaned.slice(0, 200));
    return null;
  }
}

export function parseGeneratedBlog(raw: string): GeneratedBlogPayload | null {
  const j = parseCleanJson<Record<string, unknown>>(raw);
  if (!j) return null;
  try {
    const title = typeof j.title === "string" ? j.title.trim() : "";
    const excerpt = typeof j.excerpt === "string" ? j.excerpt.trim() : "";
    const content =
      typeof j.content === "string"
        ? j.content.trim()
        : typeof j.markdown === "string"
          ? j.markdown.trim()
          : typeof j.body === "string"
            ? j.body.trim()
            : "";
    const featuredImageId = typeof j.featuredImageId === "string" ? j.featuredImageId.trim() : null;
    if (!title || !content) return null;
    return { title, excerpt, content, featuredImageId };
  } catch {
    return null;
  }
}
