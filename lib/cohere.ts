import { CohereClient } from 'cohere-ai';

const apiKey = process.env.COHERE_API_KEY;

if (!apiKey) {
  throw new Error('COHERE_API_KEY is not set in .env.local');
}

export const cohere = new CohereClient({ token: apiKey });
