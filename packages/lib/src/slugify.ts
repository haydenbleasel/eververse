import createSlug from 'slugify';

export const slugify = (text: string): string =>
  createSlug(text, { lower: true, strict: true });

export const slugifyLax = (text: string): string =>
  createSlug(text, {
    lower: true,
    strict: false,
    trim: false,
    remove: /@/g,
  });
