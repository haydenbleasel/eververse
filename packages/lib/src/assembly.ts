import { AssemblyAI } from 'assemblyai';

export type { Transcript } from 'assemblyai';

const apiKey = process.env.ASSEMBLYAI_API_KEY;

if (!apiKey) {
  throw new Error('ASSEMBLYAI_API_KEY must be set');
}

export const assembly = new AssemblyAI({ apiKey });
