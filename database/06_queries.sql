-- ============================================================
-- 06: IMPORTANT QUERIES (SELECT / JOIN / GROUP BY / HAVING / subqueries / DML)
-- ============================================================
USE CorporateRecruitmentDB;

-- Q1  4-table JOIN: all applications with candidate, job, company
SELECT a.Application_ID, ca.Candidate_Name, j.Job_Title, c.Company_Name, a.Application_Status
FROM Application a
JOIN Candidate ca ON ca.Candidate_ID = a.Candidate_ID
JOIN Job j        ON j.Job_ID        = a.Job_ID
JOIN Company c    ON c.Company_ID    = j.Company_ID
ORDER BY a.Application_Date DESC;

-- Q2  GROUP BY + HAVING: jobs that received 2 or more applications
SELECT j.Job_Title, COUNT(*) AS applicants
FROM Application a JOIN Job j ON j.Job_ID = a.Job_ID
GROUP BY j.Job_ID, j.Job_Title
HAVING COUNT(*) >= 2
ORDER BY applicants DESC;

-- Q3  Aggregates: average / max salary and openings per industry
SELECT c.Industry, COUNT(*) AS openings, ROUND(AVG(j.Salary),0) AS avg_salary, MAX(j.Salary) AS max_salary
FROM Job j JOIN Company c ON c.Company_ID = j.Company_ID
GROUP BY c.Industry
ORDER BY avg_salary DESC;

-- Q4  Scalar subquery: candidates with experience above the overall average
SELECT Candidate_Name, Experience_Years
FROM Candidate
WHERE Experience_Years > (SELECT AVG(Experience_Years) FROM Candidate)
ORDER BY Experience_Years DESC;

-- Q5  NOT EXISTS (correlated): jobs nobody has applied to
SELECT j.Job_ID, j.Job_Title
FROM Job j
WHERE NOT EXISTS (SELECT 1 FROM Application a WHERE a.Job_ID = j.Job_ID);

-- Q6  Relational division: candidates who have ALL skills required by Job 1
SELECT ca.Candidate_Name
FROM Candidate ca
JOIN Candidate_Skill cs ON cs.Candidate_ID = ca.Candidate_ID
JOIN Job_Skill js       ON js.Skill_ID = cs.Skill_ID AND js.Job_ID = 1
GROUP BY ca.Candidate_ID, ca.Candidate_Name
HAVING COUNT(*) = (SELECT COUNT(*) FROM Job_Skill WHERE Job_ID = 1);

-- Q7  Best candidates for a job using the stored FUNCTION
SELECT ca.Candidate_Name, fn_match_percentage(ca.Candidate_ID, 2) AS match_pct
FROM Candidate ca
ORDER BY match_pct DESC, ca.Experience_Years DESC
LIMIT 5;

-- Q8  FULL-TEXT search on jobs and resumes
SELECT Job_ID, Job_Title, MATCH(Job_Title, Job_Description) AGAINST ('python embeddings') AS score
FROM Job
WHERE MATCH(Job_Title, Job_Description) AGAINST ('python embeddings' IN NATURAL LANGUAGE MODE)
ORDER BY score DESC;

SELECT Resume_ID, Candidate_ID
FROM Resume
WHERE MATCH(Resume_Text) AGAINST ('+Docker +SQL' IN BOOLEAN MODE);

-- Q9  Most demanded skills (JOIN + GROUP BY + ORDER BY)
SELECT s.Skill_Name, COUNT(*) AS jobs_requiring
FROM Job_Skill js JOIN Skill s ON s.Skill_ID = js.Skill_ID
GROUP BY s.Skill_ID, s.Skill_Name
ORDER BY jobs_requiring DESC, s.Skill_Name;

-- Q10 Hiring funnel per company (conditional aggregation)
SELECT c.Company_Name,
       COUNT(a.Application_ID)                              AS total,
       SUM(a.Application_Status = 'Interview Scheduled')    AS interviewing,
       SUM(a.Application_Status = 'Hired')                  AS hired,
       ROUND(100*SUM(a.Application_Status='Hired')/NULLIF(COUNT(a.Application_ID),0),1) AS hire_rate_pct
FROM Company c
LEFT JOIN Job j         ON j.Company_ID = c.Company_ID
LEFT JOIN Application a ON a.Job_ID     = j.Job_ID
GROUP BY c.Company_ID, c.Company_Name;

-- Q11 LEFT JOIN: candidates who never applied
SELECT ca.Candidate_Name
FROM Candidate ca LEFT JOIN Application a ON a.Candidate_ID = ca.Candidate_ID
WHERE a.Application_ID IS NULL;

-- Q12 Views
SELECT * FROM vw_job_summary ORDER BY Total_Applications DESC;
SELECT * FROM vw_candidate_profile WHERE Skills LIKE '%SQL%';
SELECT * FROM vw_interview_schedule;

-- Q13 Audit trail written by triggers
SELECT * FROM Application_Status_Log ORDER BY Log_ID DESC LIMIT 10;

-- Q14 Procedures: apply, then hire (atomic)
CALL sp_apply_for_job(4, 1);       -- Sneha applies to Backend Developer
CALL sp_hire_candidate(1);          -- Hire Aarav; others rejected; job closed
SELECT Application_ID, Application_Status FROM Application WHERE Job_ID = 1;
SELECT Job_ID, Status FROM Job WHERE Job_ID = 1;

-- Q15 DML demos inside a transaction (rolled back so seed data is untouched)
START TRANSACTION;
  INSERT INTO Skill (Skill_Name, Skill_Category) VALUES ('Kubernetes','DevOps');
  UPDATE Candidate SET Experience_Years = Experience_Years + 1 WHERE Candidate_ID = 3;
  DELETE FROM Skill WHERE Skill_Name = 'Kubernetes';
ROLLBACK;

-- Q16 Isolation demo (run in two Workbench tabs):
-- Tab 1: START TRANSACTION; SELECT * FROM Application WHERE Application_ID=2 FOR UPDATE;
-- Tab 2: UPDATE Application SET Application_Status='Rejected' WHERE Application_ID=2;  -- blocks until Tab 1 COMMIT
