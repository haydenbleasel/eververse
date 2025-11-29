import { AssemblyAI } from "assemblyai";
import { keys } from "./keys";

export type { Transcript } from "assemblyai";

const assembly = new AssemblyAI({ apiKey: keys().ASSEMBLYAI_API_KEY });

export const createTranscript = async (audioUrl: string) =>
  assembly.transcripts.transcribe({
    audio_url: audioUrl,
    word_boost: ["eververse"],
  });
