# Design Document — GapMatch

## Architecture Overview
GapMatch uses Next.js App Router for both the frontend UI and API endpoints, Supabase for persistent PostgreSQL storage, and Cohere API for topic embedding normalization and generating match explanations.
[ Client Browser ]
│
▼
[ Next.js Frontend ] ──▶ [ Next.js API Routes ]
│        │
┌───────────────┘        └──────────────┐
▼                                       ▼
[ Supabase Database ]                   [ Cohere AI API ]
## Database Schema (PostgreSQL via Supabase)

### Table: `students`
- `id`: `UUID` (Primary Key, Default: `gen_random_uuid()`)
- `name`: `TEXT` (Required)
- `email`: `TEXT` (Unique, Required)
- `course`: `TEXT` (Required)
- `confident_topics`: `TEXT[]` (Array of topic strings)
- `struggling_topics`: `TEXT[]` (Array of topic strings)
- `created_at`: `TIMESTAMP` (Default: `now()`)

## AI Integration Logic (Cohere API)
1. **Topic Normalization (Embeddings):**
   - Route requests through Cohere's Embed endpoint (`embed-english-v3.0`).
   - Calculate semantic closeness so variations like "Big O" and "Big-O Notation" evaluate as identical topics.
2. **Match Explanation (Chat):**
   - Query Cohere's Chat endpoint (`command-r`) with two matching profiles.
   - Prompt context: Generate a 1-2 sentence explanation describing why student A's strengths help student B's gaps.

## API Endpoints
- `POST /api/students`: Create or update a student profile.
- `GET /api/matches?email={email}`: Calculate and return top complementary student matches with Cohere AI explanations.