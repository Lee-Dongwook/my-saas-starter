/**
 * Turns a display name into a URL-safe organization slug.
 * "Acme, Inc." -> "acme-inc"
 */
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * Slugs must be unique across the whole instance, so a plain slugify will
 * collide for common names. Appending a short random suffix keeps creation
 * from failing on the happy path.
 */
export function slugifyWithSuffix(input: string) {
  const base = slugify(input) || "org";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
