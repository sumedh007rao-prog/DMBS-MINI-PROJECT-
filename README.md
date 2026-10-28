# RecruitIQ – Corporate Recruitment & Candidate Resume Indexing

DBMS Level 3 project (PES University). **SQL (MySQL) + Vector DB (Qdrant)**, Next.js web app.

| Layer | Tech |
|---|---|
| Frontend + API | Next.js 14 (App Router, Route Handlers) |
| Relational DB | MySQL 8 (`CorporateRecruitmentDB`) |
| Vector DB | Qdrant, embeddings via `all-MiniLM-L6-v2` (local, no API key) |
| Auth | bcrypt + JWT in HttpOnly cookie, roles: Admin / Recruiter / Candidate |

## Prerequisites
Node.js 20.6+, MySQL 8 (+ Workbench), Docker (for Qdrant).

## Setup
```bash
# 1. Database – run in this order in MySQL Workbench (or `mysql -u root -p < file`)
database/01_ddl_completed.sql            # base tables (CREATE/ALTER/DROP already done)
database/02_schema_extensions.sql        # Department, Interview, Job_Skill, Users, indexes, fulltext
database/03_views.sql
database/04_functions_procedures_triggers.sql
database/05_seed_dml.sql                 # sample data

# 2. App
cp .env.example .env                     # fill DB_PASSWORD and JWT_SECRET
npm install
npm run seed:users                       # creates demo logins (bcrypt hashed)

# 3. Vector DB
docker compose up -d                     # Qdrant on :6333
npm run index:vectors                    # embeds seeded resumes + jobs (first run downloads ~25 MB model)

# 4. Run
npm run dev                              # http://localhost:3000
```

## Demo accounts
| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| Recruiter | `recruiter_technova` (also `_medicare`, `_finedge`, `_greengrid`) | `Recruit@123` |
| Candidate | `aarav`, `diya`, `rohan`, `sneha`, `karthik`, `meera` | `Cand@123` |

## Demo flow
1. Login as `recruiter_technova` → Dashboard → Jobs → post a job with skills.
2. Login as `aarav` → My Profile → add resume → Jobs → Apply (see skill-match %) → Recommended Jobs (semantic).
3. Recruiter → Applications → Shortlist → Interview → **Hire** (atomic transaction closes job, rejects others).
4. Recruiter → Semantic Match → pick a job → ranked candidate resumes by cosine similarity.

## Project layout
```
database/   SQL scripts 01-07 (DDL, extensions, views, routines/triggers, seed, queries, tests)
app/api/    Route handlers (auth, jobs, applications, interviews, candidates, profile, search, dashboard)
app/*       Pages (login, dashboard, jobs, applications, interviews, candidates, profile, match)
lib/        db.js (pool), auth.js (JWT+RBAC), vector.js (Qdrant+embeddings), api.js (error mapping)
scripts/    seed-users.mjs, index-vectors.mjs
docs/       PROJECT_DOCUMENTATION.md, GIT_WORKFLOW.md
```
