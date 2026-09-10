# Implementation Plan — GapMatch

## Phase 1: Database & Environment Setup
- [x] 1.1 Create Supabase project and set up `students` table schema.
- [x] 1.2 Verify `.env.local` contains valid `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `COHERE_API_KEY`.
- [x] 1.3 Verify `.gitignore` strictly ignores `.env.local`.

## Phase 2: Frontend Profile Form
- [x] 2.1 Build dynamic form in Next.js for name, email, course, confident topics, and struggling topics.
- [x] 2.2 Wire form submission to `POST /api/students` endpoint.

## Phase 3: Backend API & AI Logic
- [x] 3.1 Implement `POST /api/students` route to store user profile in Supabase.
- [x] 3.2 Build `GET /api/matches` route to retrieve candidates in the same course.
- [x] 3.3 Integrate Cohere Embed endpoint to normalize topic variations.
- [x] 3.4 Calculate gap/strength complementary compatibility scores.
- [x] 3.5 Integrate Cohere Chat endpoint to generate concise match reasonings.

## Phase 4: UI Dashboard & Deployment
- [x] 4.1 Render ranked match cards displaying compatibility scores and AI explanations.
- [x] 4.2 Test profile creation and matching end-to-end locally.
- [ ] 4.3 Deploy Next.js project to Vercel free tier.