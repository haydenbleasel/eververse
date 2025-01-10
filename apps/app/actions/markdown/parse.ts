'use server';

import { parseError } from '@repo/lib/parse-error';
import matter from 'gray-matter';

export const parseMarkdown = async (
  files: {
    fileContent: string;
    filename: string;
  }[]
): Promise<
  | {
      data: {
        data: Record<string, unknown>;
        content: string;
        filename: string;
      }[];
    }
  | {
      error: string;
    }
> => {
  try {
    const data = files.map((file) => {
      const { data, content } = matter(file.fileContent);
      return {
        data: data as Record<string, unknown>,
        content,
        filename: file.filename,
      };
    });

    return { data };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
