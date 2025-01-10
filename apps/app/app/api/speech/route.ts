import { generateSpeech } from '@repo/eleven-labs';
import { Window } from 'happy-dom';
import { marked } from 'marked';

type HandlerProperties = {
  message?: string;
};

const processMessage = async (message: string) => {
  const html = await marked(message, { gfm: true });
  const window = new Window();

  window.document.body.innerHTML = html;

  // Remove all images, iframes, and videos
  const medias = [...window.document.querySelectorAll('img, iframe, video')];
  for (const media of medias) {
    media.remove();
  }

  return window.document.body.textContent ?? '';
};

export const POST = async (request: Request): Promise<Response> => {
  const { message } = (await request.json()) as HandlerProperties;

  if (!message) {
    return new Response('No message in the request', { status: 400 });
  }

  const text = await processMessage(message);
  const response = await generateSpeech(text);

  if (!response.ok) {
    return new Response(`Error generating speech ${response.statusText}`, {
      status: 500,
    });
  }

  const blob = await response.blob();
  return new Response(blob);
};
