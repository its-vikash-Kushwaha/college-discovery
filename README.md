# College Discovery Backend

This repository contains the backend and database architecture for the College Discovery and Compare platform. It is built as a Next.js application using Prisma ORM connected to a PostgreSQL database.

---

## Technical Stack

* **Framework:** Next.js (App Router Route Handlers)
* **Database ORM:** Prisma
* **Database Engine:** PostgreSQL (Neon Serverless)
* **Authentication:** JWT-based session security via `jose` (Edge-compatible)
* **Security:** Password salting and hashing via `bcryptjs`

---

## Database Design & Relational Integrity

The relational database is normalized and structured to enforce strict data constraints at the database engine level:

* **Watchlist Compound Key:** To prevent duplicate bookmarks, the `SavedCollege` table enforces a composite unique constraint on `[userId, collegeId]`:
  ```prisma
  @@unique([userId, collegeId])
  ```
* **Referential Action (Cascading Deletes):** Foreign key relationships use `onDelete: Cascade`. Deleting a `College` automatically cleans up its dependent `Course`, `Placement`, and `Review` records to avoid orphaned rows.
* **Optimized Ratings Cache:** Reviews use transaction-scoped writes. When a review is posted, the backend calculates the average rating across all reviews for that college and caches it on the `College` model's `rating` field. This eliminates the need for expensive JOIN queries during paginated list views.

---

## Core API Endpoints

All API endpoints return JSON payloads. Authentication is managed via secure, HTTP-only JWT cookies (`session_token`).

### Authentication
* `POST /api/auth/signup` - Registers a new user account.
* `POST /api/auth/login` - Authenticates credentials and sets the session cookie.
* `GET /api/auth/me` - Verifies session status and returns active user info.
* `DELETE /api/auth/me` - Clears the session cookie (logout).

### Colleges Directory
* `GET /api/colleges` - Query directory supporting pagination (`page`, `limit`), case-insensitive pattern matching (`query`), multiple state filters (`state`), fee limits (`maxFees`), and sorting parameters (`sortBy=fees_asc|fees_desc|rating_desc`).
* `GET /api/colleges/[id]` - Retrieves detail profile for a single college, including placements and course list.

### Watchlists & Reviews (Authenticated)
* `GET /api/saved` - Fetches the authenticated user's bookmarked watchlist.
* `POST /api/saved` - Toggles the bookmark status for a college (adds or removes).
* `POST /api/colleges/[id]/reviews` - Submits a review and updates the college's overall aggregate rating cache.

---

## Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/its-vikash-Kushwaha/college-discovery.git
cd college-discovery
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://neondb_owner:npg_TedI8jn6fGmZ@ep-young-meadow-ao9x75fw.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="use-a-secure-random-32-character-secret-key"
```

### 3. Sync Database & Run Migrations
Generate the Prisma Client binaries locally and apply the relational schema to the database:
```bash
npx prisma db push
```

### 4. Seed Mock Data
Load the relational mock dataset of premier Indian institutions, placement statistics, course details, and initial reviews:
```bash
npx prisma db seed
```

### 5. Start the Development Server
```bash
npm run dev
```
The application will boot locally at `http://localhost:3000`.

---

## Vercel Deployment Configurations

For serverless deployments (e.g. Vercel), standard file tracing is configured using `prisma-client-js`. Ensure your build commands are set to generate the client prior to compiling the Next.js build:

```json
"scripts": {
  "build": "prisma generate && next build"
}
```
In your production environment, ensure that `DATABASE_URL` and `JWT_SECRET` are correctly populated under the project settings.
