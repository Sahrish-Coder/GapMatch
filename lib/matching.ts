import { cohere } from '@/lib/cohere';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  course: string;
  confident_topics: string[];
  struggling_topics: string[];
}

export interface MatchResult {
  student: Omit<StudentRow, 'confident_topics' | 'struggling_topics'>;
  score: number;
  theyCanTeachYou: string[];
  youCanTeachThem: string[];
  explanation: string;
}

// ─── Cosine similarity ────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── Embed a batch of topics, return a map of topic → embedding vector ────────

async function embedTopics(topics: string[]): Promise<Map<string, number[]>> {
  if (topics.length === 0) return new Map();

  const response = await cohere.embed({
    texts: topics,
    model: 'embed-english-v3.0',
    inputType: 'search_document',
  });

  const embeddings = response.embeddings as number[][];
  const map = new Map<string, number[]>();
  topics.forEach((topic, i) => map.set(topic, embeddings[i]));
  return map;
}

// ─── Match strength: how well candidate's strengths cover seeker's gaps ───────
//
// For each of the seeker's struggling topics, we find the max cosine similarity
// against each of the candidate's confident topics. The average of those max
// similarities is the directional "can teach you" score.

function directionalScore(
  seekerGaps: number[][],
  candidateStrengths: number[][]
): number {
  if (seekerGaps.length === 0 || candidateStrengths.length === 0) return 0;

  let total = 0;
  for (const gap of seekerGaps) {
    const best = Math.max(...candidateStrengths.map((s) => cosineSimilarity(gap, s)));
    total += best;
  }
  return total / seekerGaps.length;
}

// ─── Topic overlap label: return topics where similarity exceeds threshold ────

function overlappingTopics(
  topicsA: string[],
  embsA: number[][],
  topicsB: string[],
  embsB: number[][],
  threshold = 0.72
): string[] {
  const matched = new Set<string>();
  for (let i = 0; i < embsA.length; i++) {
    for (let j = 0; j < embsB.length; j++) {
      if (cosineSimilarity(embsA[i], embsB[j]) >= threshold) {
        matched.add(topicsB[j]);
      }
    }
  }
  return Array.from(matched);
}

// ─── Main matching function ───────────────────────────────────────────────────

export async function rankMatches(
  seeker: StudentRow,
  candidates: StudentRow[]
): Promise<MatchResult[]> {
  if (candidates.length === 0) return [];

  // Collect all unique topics across seeker + candidates for a single embed call
  const allTopics = Array.from(
    new Set([
      ...seeker.confident_topics,
      ...seeker.struggling_topics,
      ...candidates.flatMap((c) => [...c.confident_topics, ...c.struggling_topics]),
    ])
  );

  const embeddingMap = await embedTopics(allTopics);

  function vecs(topics: string[]): number[][] {
    return topics.map((t) => embeddingMap.get(t) ?? []).filter((v) => v.length > 0);
  }

  const seekerGapVecs = vecs(seeker.struggling_topics);
  const seekerStrengthVecs = vecs(seeker.confident_topics);

  const results: MatchResult[] = [];

  for (const candidate of candidates) {
    const candStrengthVecs = vecs(candidate.confident_topics);
    const candGapVecs = vecs(candidate.struggling_topics);

    // Bidirectional complementary score
    const theyTeachScore = directionalScore(seekerGapVecs, candStrengthVecs);
    const youTeachScore = directionalScore(candGapVecs, seekerStrengthVecs);
    const score = Math.round(((theyTeachScore + youTeachScore) / 2) * 100);

    const theyCanTeachYou = overlappingTopics(
      seeker.struggling_topics, seekerGapVecs,
      candidate.confident_topics, candStrengthVecs
    );
    const youCanTeachThem = overlappingTopics(
      candidate.struggling_topics, candGapVecs,
      seeker.confident_topics, seekerStrengthVecs
    );

    results.push({
      student: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        course: candidate.course,
      },
      score,
      theyCanTeachYou,
      youCanTeachThem,
      explanation: '', // filled in next step
    });
  }

  // Sort descending by score before generating explanations
  results.sort((a, b) => b.score - a.score);

  // Only generate explanations for the top 5 to save API quota
  const top = results.slice(0, 5);

  await Promise.all(
    top.map(async (match) => {
      try {
        match.explanation = await generateExplanation(seeker, match);
      } catch {
        match.explanation =
          `${match.student.name} can help you with ${match.theyCanTeachYou.join(', ') || 'overlapping topics'}, ` +
          `and you can help them with ${match.youCanTeachThem.join(', ') || 'your strong areas'}.`;
      }
    })
  );

  return top;
}

// ─── Cohere Chat explanation ──────────────────────────────────────────────────

async function generateExplanation(
  seeker: StudentRow,
  match: MatchResult
): Promise<string> {
  const prompt =
    `You are a study-group matchmaker. Write ONE sentence (max 30 words) explaining why ` +
    `${seeker.name} and ${match.student.name} are a good study pair for "${seeker.course}". ` +
    `${seeker.name} struggles with: ${seeker.struggling_topics.join(', ')}. ` +
    `${match.student.name} is confident in: ${match.theyCanTeachYou.length > 0 ? match.theyCanTeachYou.join(', ') : 'complementary topics'}. ` +
    `${seeker.name} is confident in: ${seeker.confident_topics.join(', ')}. ` +
    `${match.student.name} struggles with: ${match.youCanTeachThem.length > 0 ? match.youCanTeachThem.join(', ') : 'areas you excel in'}. ` +
    `Be specific and encouraging.`;

  const response = await cohere.chat({
    model: 'command-r-plus',
    message: prompt,
    maxTokens: 80,
  });

  return response.text.trim();
}
