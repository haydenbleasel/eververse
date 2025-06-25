import { embed } from 'ai';
import { provider } from './provider';

/**
 * Generate embeddings for text content using OpenAI's text-embedding-3-small model
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const { embedding } = await embed({
    model: provider.textEmbeddingModel('text-embedding-3-small'),
    value: text,
  });
  
  return embedding;
};

/**
 * Generate embeddings for multiple text contents
 */
export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const embeddings = await Promise.all(
    texts.map(text => generateEmbedding(text))
  );
  
  return embeddings;
};

/**
 * Calculate cosine similarity between two vectors
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  const dotProduct = a.reduce((sum, val, idx) => sum + val * b[idx], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
};