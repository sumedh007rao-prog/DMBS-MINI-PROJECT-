-- ============================================================
-- 03: VIEWS
-- ============================================================
USE CorporateRecruitmentDB;

CREATE OR REPLACE VIEW vw_job_summary AS
SELECT j.Job_ID, j.Job_Title, c.Company_ID, c.Company_Name, d.Dept_Name,
       j.Location, j.Salary, j.Status,
       COUNT(a.Application_ID)                        AS Total_Applications,
       COALESCE(SUM(a.Application_Status='Hired'),0)  AS Hired_Count
FROM Job j
JOIN Company c          ON c.Company_ID = j.Company_ID
LEFT JOIN Department d  ON d.Dept_ID    = j.Dept_ID
LEFT JOIN Application a ON a.Job_ID     = j.Job_ID
GROUP BY j.Job_ID, j.Job_Title, c.Company_ID, c.Company_Name, d.Dept_Name,
         j.Location, j.Salary, j.Status;

CREATE OR REPLACE VIEW vw_candidate_profile AS
SELECT ca.Candidate_ID, ca.Candidate_Name, ca.Email, ca.Phone,
       ca.Experience_Years, ca.Qualification,
       COALESCE(GROUP_CONCAT(CONCAT(s.Skill_Name,' (',cs.Proficiency_Level,')')
                SEPARATOR ', '),'') AS Skills,
       (SELECT COUNT(*) FROM Application a WHERE a.Candidate_ID = ca.Candidate_ID) AS Applications
FROM Candidate ca
LEFT JOIN Candidate_Skill cs ON cs.Candidate_ID = ca.Candidate_ID
LEFT JOIN Skill s            ON s.Skill_ID = cs.Skill_ID
GROUP BY ca.Candidate_ID, ca.Candidate_Name, ca.Email, ca.Phone,
         ca.Experience_Years, ca.Qualification;

CREATE OR REPLACE VIEW vw_interview_schedule AS
SELECT i.Interview_ID, i.Interview_Date, i.Interview_Mode, i.Interview_Status,
       i.Interviewer_Name, i.Feedback,
       a.Application_ID, ca.Candidate_ID, ca.Candidate_Name,
       j.Job_ID, j.Job_Title, c.Company_ID, c.Company_Name
FROM Interview i
JOIN Application a ON a.Application_ID = i.Application_ID
JOIN Candidate ca  ON ca.Candidate_ID  = a.Candidate_ID
JOIN Job j         ON j.Job_ID         = a.Job_ID
JOIN Company c     ON c.Company_ID     = j.Company_ID;
