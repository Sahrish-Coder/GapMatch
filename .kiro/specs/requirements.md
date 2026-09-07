# Requirements Document — GapMatch

## Core Purpose
GapMatch is a web application that matches university students into study groups based on complementary knowledge gaps rather than simple schedule/class overlaps.

## Key Features & User Stories

### 1. Student Profile Creation
- **User Story:** As a student, I want to create a lightweight profile by providing my name, email, course name, confident topics, and struggling topics.
- **Acceptance Criteria:**
  - Email acts as the unique identifier (no login/auth required).
  - Users can input multiple topics under "Confident In" and "Struggling With".

### 2. AI Matching & Topic Normalization
- **User Story:** As a student, I want the system to match my weak topics with another student's strong topics.
- **Acceptance Criteria:**
  - AI extracts and normalizes topic names (e.g., treats "Big O" and "Big-O Notation" as identical).
  - Matches are calculated based on complementary overlap (Person A weak = Person B strong).

### 3. Ranked Match Dashboard
- **User Story:** As a student, I want to view my top student matches ranked by compatibility score with an AI-generated explanation.
- **Acceptance Criteria:**
  - Displays compatibility score and a short Cohere-generated explanation of why the match makes sense.

## Tech Stack & Architecture
- **Frontend & API:** Next.js (App Router)
- **Database:** Supabase (Postgres)
- **AI Engine:** Cohere API (Chat + Embeddings)
- **Deployment:** Vercel (Free Tier)