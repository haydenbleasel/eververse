import type { LanguageModelV1 } from '@ai-sdk/provider';
import { provider } from './provider';

export const textModel: LanguageModelV1 = provider.chat('gpt-4o-mini');
export const objectModel: LanguageModelV1 = provider.chat('gpt-4o-mini', {
  structuredOutputs: true,
});
