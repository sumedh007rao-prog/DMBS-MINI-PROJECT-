# Git / GitHub workflow (individual contributions must be visible)

## Suggested responsibility split
| Member | Database | Application |
|---|---|---|
| **PES2UG24CS535** | `02_schema_extensions`, `03_views`, `04_functions_procedures_triggers`, `06_queries`, data dictionary | `lib/db.js`, `lib/auth.js`, `middleware.js`, auth + jobs + applications + interviews APIs, login/register/jobs/applications/interviews pages |
| **PES2UG24CS527** | `05_seed_dml`, `07_test_cases`, Qdrant design | `lib/vector.js`, `scripts/*`, semantic search API, dashboard + candidates + profile + match pages, docs/README |

(Swap as you like – just make sure each person commits their own part.)

## Commands
```bash
git init && git branch -M main
git remote add origin https://github.com/<you>/recruitment-app.git

# each member works on a branch under their OWN git identity
git config user.name "Your Name" && git config user.email "you@example.com"
git checkout -b feature/db-advanced
git add database/02_schema_extensions.sql database/03_views.sql
git commit -m "feat(db): add Department, Interview, Job_Skill, Users tables and indexes"
git push -u origin feature/db-advanced
# open Pull Request -> teammate reviews -> merge
```
Use small commits with prefixes (`feat`, `fix`, `docs`, `test`). **Never commit `.env`** (already in `.gitignore`).
