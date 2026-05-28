# CollegeDiscover 🎓
> A production-grade MVP for a College Discovery, Compare, and Decision-Making Platform built with a robust, scalable backend architecture.

---

## 📖 Project Overview & Description

**CollegeDiscover** is a high-fidelity full-stack MVP designed to solve a critical product challenge: helping students navigate the highly stressful process of researching, comparing, and deciding on colleges. Unlike generic marketplaces, CollegeDiscover is built as a production-grade directory focused on **relational integrity, query performance, and user-scoped data protection**.

Students can search across premier Indian institutes, filter colleges by average tuition fees and location states, visualize placement timelines (highest package vs. average package), write detailed reviews, side-by-side compare multiple colleges, and bookmark favorites to their watchlist securely.

---

## 🛠️ Backend Architecture & System Design

Our backend is designed with a focus on data safety, low-latency querying, and robust relational isolation. It utilizes a **Next.js App Router API Handler** model connected to a **PostgreSQL** database (hosted on Neon) through **Prisma ORM**.

```
                           ┌─────────────────────────┐
                           │      Client Browser     │
                           └───────────┬─────────────┘
                                       │
                        HTTP Requests  │ (Reads JWT Session Cookie)
                                       ▼
                     ┌───────────────────────────────────┐
                     │ Next.js App Router Route Handlers │
                     └─────────────────┬─────────────────┘
                                       │
                        Prisma Queries │ (Connection Pool)
                                       ▼
                       ┌──────────────────────────────┐
                       │   PostgreSQL Database (Neon) │
                       └──────────────────────────────┘
```

### 1. Database Schema & Relational Integrity (`prisma/schema.prisma`)
The PostgreSQL database is structured in Third Normal Form (3NF) to eliminate reduncancy while maintaining cascading integrity:

* **Compound Watchlist Index**: The `SavedCollege` join table maps users to bookmarked colleges. We enforce a compound unique index:
  ```prisma
  @@unique([userId, collegeId])
  ```
  This guarantees database-level integrity, preventing a user from duplicating bookmarks and optimizing indexing speed.
* **Cascade Deletes**: Foreign key relations are linked with `onDelete: Cascade`. Deleting a `College` automatically purges associated courses, placements, and reviews, avoiding orphaned rows.
* **Optimal Field Types**: Average tuition fees are stored as `Int` to avoid floating-point errors in SQL budget calculations. Package trends (LPA) and aggregate scores use `Float` for precise fractions.

---

### 2. Search, Filtering, and Paginated Query Engine
The primary explore directory handler `/api/colleges` is a high-performance query builder:
- **ILIKE Pattern Searching**: Leverages Prisma's `mode: 'insensitive'` to compile Postgres `ILIKE` queries, matching keywords against names, states, or locations dynamically.
- **Multi-Value States Lookup**: Splits comma-separated strings (e.g. `state=Delhi,Karnataka`) into array-based queries `state: { in: states, mode: 'insensitive' }`.
- **Atomic Pagination Transactions**: To prevent pagination sync errors, listings execute the search query and total count matching the active criteria in a single database `$transaction` block:
  ```typescript
  const [colleges, totalCount] = await prisma.$transaction([
    prisma.college.findMany({ where, orderBy, skip, take: limit, ... }),
    prisma.college.count({ where }),
  ]);
  ```

---

### 3. Custom Cookie-Based JWT Session Security
We engineered a custom lightweight edge-compliant token security suite without using heavy third-party packages:
- **Cryptographic Hashing**: User passwords are salted and hashed using `bcryptjs` (salt index `10`) before writing to the database.
- **Edge-Ready Cryptography (`jose`)**: Decodes and signs HS256 tokens using the Web Crypto API, fully compatible with Next.js Serverless and Edge runtimes.
- **XSS Token Safeguards**: Session tokens are written directly to HTTP-only cookies (`session_token`) with `sameSite: 'strict'` configuration. This secures tokens from browser JavaScript reading, completely neutralizing XSS extraction.
- **Relational Data Protection**: Scopes all watchlist bookmarks (`/api/saved`) strictly to the resolved token `userId` payload, responding with `401 Unauthorized` for expired or invalid cookies.

---

### 4. Input Validations & Transactional Aggregations
When users submit feedback for a college, the API maintains consistent aggregates through sequential transaction-style writes:
1. **Strict Input Boundaries**: Ratings must be Float values between `1.0` and `5.0` with non-empty review messages.
2. **Relational Review Creation**: Inserts the review linked to the author's `userId`.
3. **Database Aggregation**: Aggregates the reviews for the college using the `_avg` database operator:
   ```typescript
   const aggregates = await prisma.review.aggregate({
     where: { collegeId },
     _avg: { rating: true },
   });
   ```
4. **Normalized Rating Cache**: The average is rounded to 1 decimal place and cached on the `College` model `rating` field. This prevents high-overhead JOIN calculations during listings directories queries.

---

## 📊 Database Schema Relationships

```
                  ┌──────────────┐
                  │     User     │
                  └──────┬───────┘
                         │ 1
                         │
             ┌───────────┴───────────┐
             │1:N                    │1:N
     ┌───────▼──────┐        ┌───────▼──────┐
     │ SavedCollege │        │    Review    │
     └───────▲──────┘        └───────▲──────┘
             │N:1                    │N:1
             │                       │
             │           1           │
             ├───────────────────────┤
             │                       │
      ┌──────┴──────┐         ┌──────┴──────┐
      │   College   ◄─────────┤   Course    │
      └──────▲──────┘1      N └─────────────┘
             │1
             │
             │N
      ┌──────┴──────┐
      │  Placement  │
      └─────────────┘
```

---

## 🔌 API Routes Reference

Our API is fully RESTful and guarantees standardized JSON error schemas across endpoints:

| Endpoint | Method | Function | Payload / Queries | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `/api/colleges` | `GET` | Paginated search & multi-filtering directory. | `query`, `state`, `minRating`, `maxFees`, `sortBy`, `page`, `limit` | No |
| `/api/colleges/[id]` | `GET` | Relational profiles lookup and bookmark check. | Dynamic route parameters | No |
| `/api/colleges/[id]/reviews` | `POST` | Validates, submits review and updates college overall rating. | `{ rating: number, comment: string }` | **Yes** |
| `/api/saved` | `GET` | Fetches private bookmarked watchlists. | None (Session Cookie) | **Yes** |
| `/api/saved` | `POST` | Toggles bookmark watchlist status. | `{ collegeId: string }` | **Yes** |
| `/api/auth/signup` | `POST` | Registers user and issues secure JWT cookie. | `{ name, email, password }` | No |
| `/api/auth/login` | `POST` | Validates credentials and issues secure JWT cookie. | `{ email, password }` | No |
| `/api/auth/me` | `GET` | Resolves active session username from cookie. | None | No |
| `/api/auth/me` | `DELETE` | Clears cookies to log user out. | None | No |

---

## 💻 Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/its-vikash-Kushwaha/college-discovery.git
cd college-discovery
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://neondb_owner:npg_TedI8jn6fGmZ@ep-young-meadow-ao9x75fw.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="generate-a-secure-secret-key-at-least-32-chars-long"
```

### 4. Sync Prisma schema & Seed database
Push the relational schema models directly to your Neon database and load mock Indian colleges data:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Boot the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result!
