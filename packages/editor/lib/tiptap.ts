import 'server-only';
import type { JsonValue } from '@prisma/client/runtime/library';
import { parseError } from '@repo/lib/parse-error';
import { generateText } from '@tiptap/core';
import { generateJSON } from '@tiptap/html';
import { Window } from 'happy-dom';
import { marked } from 'marked';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { defaultExtensions } from './extensions/server';
import { generateHTML } from './generate-html';

export const htmlToContent = (html: string): object =>
  generateJSON(html, defaultExtensions);

export const htmlToText = (html: string): string => {
  const window = new Window();

  window.document.body.innerHTML = html;

  return document.body.textContent ?? '';
};

export const contentToHtml = (json: JsonValue | object): string => {
  try {
    return generateHTML(json as object, defaultExtensions);
  } catch (error) {
    const message = parseError(error);
    throw new Error(`Failed to convert content to HTML: ${message}`);
  }
};

export const contentToText = (json: JsonValue | object): string =>
  generateText(json as object, defaultExtensions);

export const textToHtml = (text: string): string =>
  text
    .split('\n')
    .map((line) => `<p>${line}</p>`)
    .join('');

export const textToContent = (text: string): object =>
  htmlToContent(textToHtml(text));

export const markdownToContent = async (markdown: string): Promise<object> =>
  htmlToContent(await marked(markdown, { gfm: true }));

const unwrapImagesFromParagraphs = (html: string): string => {
  const window = new Window();

  window.document.body.innerHTML = html;

  // Find all paragraph (<p>) elements
  const paragraphs = [...window.document.querySelectorAll('p')];
  for (const paragraph of paragraphs) {
    // Find all image (<img>) tags directly under this paragraph
    const images = [...paragraph.querySelectorAll('img')];
    if (images.length > 0) {
      for (const image of images) {
        // Move each image outside and just after the paragraph
        paragraph.parentNode?.insertBefore(image, paragraph.nextSibling);
      }

      // Remove the paragraph if it's empty now
      if (paragraph.innerHTML.trim() === '') {
        paragraph.remove();
      }
    }
  }

  return window.document.body.innerHTML;
};

const convertYouTubeImgToIframe = (html: string): string => {
  const window = new Window();

  window.document.body.innerHTML = html;

  // Find all img elements
  const images = [...window.document.querySelectorAll('img')];

  for (const image of images) {
    const { src } = image;
    // Check if the image src contains a YouTube link
    if (src.includes('youtube.com')) {
      // Create a new div element to wrap the iframe
      const div = window.document.createElement('div');
      div.dataset.youtubeVideo = '';
      div.dataset.youtubeVideo = '';

      // Create the iframe element
      const iframe = window.document.createElement('iframe');

      // Set the src as it was in the <img>
      iframe.src = src;

      // Append the iframe to the div
      div.append(iframe);

      // Replace the image with the new div
      image.parentNode?.replaceChild(div, image);
    }
  }

  return window.document.body.innerHTML;
};

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const string = markdown.replaceAll('<br>', '\n');

  let html = await marked(string, { gfm: true });

  // Issue #1: Images need to be unwrapped from the paragraph tag to be compatible with Tiptap
  html = unwrapImagesFromParagraphs(html);

  // Issue #2: YouTube videos get converted to images, which is not what we want
  html = convertYouTubeImgToIframe(html);

  return html;
};

export const markdownToText = async (markdown: string): Promise<string> =>
  htmlToText(await markdownToHtml(markdown));

export const contentToMarkdown = async (
  content: JsonValue | object
): Promise<string> => await NodeHtmlMarkdown.translate(contentToHtml(content));

export const htmlToMarkdown = async (html: string): Promise<string> =>
  await NodeHtmlMarkdown.translate(html);
