-- ============================================================
-- 07: DATABASE-LEVEL TEST CASES (Data validation & integrity)
-- Every statement marked "EXPECT ERROR" must FAIL. Run one at a time and screenshot.
-- Run on seeded DB (05) BEFORE running Q14 of 06_queries.sql.
-- ============================================================
USE CorporateRecruitmentDB;

-- T1  NOT NULL: candidate without name                         EXPECT ERROR 1048
INSERT INTO Candidate (Email) VALUES ('x@mail.example');
-- T2  UNIQUE: duplicate email                                  EXPECT ERROR 1062
INSERT INTO Candidate (Candidate_Name, Email) VALUES ('Dup','aarav@mail.example');
-- T3  CHECK: negative experience                               EXPECT ERROR 3819
INSERT INTO Candidate (Candidate_Name, Email, Experience_Years) VALUES ('Neg','neg@mail.example',-1);
-- T4  CHECK: phone shorter than 10 chars                       EXPECT ERROR 3819
INSERT INTO Candidate (Candidate_Name, Email, Phone) VALUES ('Short','s@mail.example','12345');
-- T5  CHECK: negative salary                                   EXPECT ERROR 3819
INSERT INTO Job (Company_ID, Job_Title, Salary) VALUES (1,'Bad Job',-100);
-- T6  CHECK: invalid job type                                  EXPECT ERROR 3819
INSERT INTO Job (Company_ID, Job_Title, Job_Type) VALUES (1,'Bad Type','Weekend');
-- T7  FK: job for non-existent company                         EXPECT ERROR 1452
INSERT INTO Job (Company_ID, Job_Title) VALUES (999,'Ghost Job');
-- T8  UNIQUE (composite): same candidate applies twice         EXPECT ERROR 1062
INSERT INTO Application (Candidate_ID, Job_ID, Application_Date) VALUES (1,1,CURDATE());
-- T9  CHECK: invalid application status                        EXPECT ERROR 3819
UPDATE Application SET Application_Status = 'Maybe' WHERE Application_ID = 2;
-- T10 TRIGGER: apply without a resume (add candidate first)    EXPECT ERROR 1644
INSERT INTO Candidate (Candidate_Name, Email) VALUES ('No Resume','nr@mail.example');
INSERT INTO Application (Candidate_ID, Job_ID, Application_Date)
VALUES (LAST_INSERT_ID(), 2, CURDATE());
-- T11 TRIGGER: interview before application date               EXPECT ERROR 1644
INSERT INTO Interview (Application_ID, Interviewer_Name, Interview_Date)
VALUES (2,'Test','2020-01-01 10:00:00');
-- T12 FK RESTRICT: delete company that has jobs                EXPECT ERROR 1451
DELETE FROM Company WHERE Company_ID = 1;
-- T13 PROCEDURE: hire an application that is only 'Applied'    EXPECT ERROR 1644 + rollback
CALL sp_hire_candidate(3);
-- T14 TRIGGER: apply to a closed job (after Q14 closed job 1)  EXPECT ERROR 1644
-- CALL sp_apply_for_job(5, 1);

-- ---------- Positive tests ----------
-- P1  Interview insert auto-advances status
INSERT INTO Interview (Application_ID, Interviewer_Name, Interview_Date, Interview_Mode)
VALUES (2,'Anita Rao','2026-10-05 11:00:00','Phone');
SELECT Application_Status FROM Application WHERE Application_ID = 2;   -- 'Interview Scheduled'
-- P2  ON DELETE CASCADE: deleting a candidate removes their resumes, skills and login
START TRANSACTION;
  INSERT INTO Candidate (Candidate_Name, Email) VALUES ('Temp Person','temp@mail.example');
  SET @cid = LAST_INSERT_ID();
  INSERT INTO Resume (Candidate_ID, Resume_File_Name, Upload_Date) VALUES (@cid,'t.pdf',CURDATE());
  INSERT INTO Candidate_Skill VALUES (@cid,1,'Beginner');
  DELETE FROM Candidate WHERE Candidate_ID = @cid;
  SELECT (SELECT COUNT(*) FROM Resume WHERE Candidate_ID=@cid) AS resumes_left,
         (SELECT COUNT(*) FROM Candidate_Skill WHERE Candidate_ID=@cid) AS skills_left;  -- 0, 0
ROLLBACK;
-- NOTE: Application.Candidate_ID has no cascade (per your DDL), so deleting a candidate who has
-- applications fails with 1451 - by design: hiring history must not be silently lost.
