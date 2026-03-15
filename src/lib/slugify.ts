// src/lib/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '') // allow arabic + latin + numbers + hyphen
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
