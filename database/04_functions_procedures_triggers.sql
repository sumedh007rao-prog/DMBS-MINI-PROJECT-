-- ============================================================
-- 04: FUNCTION, STORED PROCEDURES (with TRANSACTIONS), TRIGGERS
-- Run in MySQL Workbench (File > Open SQL Script > Execute) or:
--   mysql -u root -p < 04_functions_procedures_triggers.sql
-- ============================================================
USE CorporateRecruitmentDB;
DELIMITER $$

-- ---------- FUNCTION: % of a job's required skills a candidate has ----------
DROP FUNCTION IF EXISTS fn_match_percentage$$
CREATE FUNCTION fn_match_percentage(p_cand INT, p_job INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
BEGIN
    DECLARE v_total   INT DEFAULT 0;
    DECLARE v_matched INT DEFAULT 0;
    SELECT COUNT(*) INTO v_total FROM Job_Skill WHERE Job_ID = p_job;
    IF v_total = 0 THEN RETURN 0; END IF;
    SELECT COUNT(*) INTO v_matched
    FROM Job_Skill js
    JOIN Candidate_Skill cs ON cs.Skill_ID = js.Skill_ID AND cs.Candidate_ID = p_cand
    WHERE js.Job_ID = p_job;
    RETURN ROUND(v_matched * 100 / v_total, 2);
END$$

-- ---------- PROCEDURE: apply for a job (transaction + rollback) ----------
DROP PROCEDURE IF EXISTS sp_apply_for_job$$
CREATE PROCEDURE sp_apply_for_job(IN p_cand INT, IN p_job INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
        INSERT INTO Application (Candidate_ID, Job_ID, Application_Date)
        VALUES (p_cand, p_job, CURDATE());
    COMMIT;
    SELECT LAST_INSERT_ID() AS Application_ID;
END$$

-- ---------- PROCEDURE: hire a candidate (atomic multi-statement transaction) ----------
-- Marks the application Hired, rejects all other open applicants, closes the job.
DROP PROCEDURE IF EXISTS sp_hire_candidate$$
CREATE PROCEDURE sp_hire_candidate(IN p_app INT)
BEGIN
    DECLARE v_job    INT DEFAULT NULL;
    DECLARE v_status VARCHAR(30);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        SELECT Job_ID, Application_Status INTO v_job, v_status
        FROM Application WHERE Application_ID = p_app FOR UPDATE;   -- row lock

        IF v_job IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Application not found';
        END IF;
        IF v_status NOT IN ('Shortlisted','Interview Scheduled') THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only shortlisted / interviewed applications can be hired';
        END IF;

        UPDATE Application SET Application_Status = 'Hired' WHERE Application_ID = p_app;
        UPDATE Application SET Application_Status = 'Rejected'
         WHERE Job_ID = v_job AND Application_ID <> p_app
           AND Application_Status NOT IN ('Hired','Rejected');
        UPDATE Job SET Status = 'Closed' WHERE Job_ID = v_job;
    COMMIT;
    SELECT 'Hired' AS Result, v_job AS Job_ID;
END$$

-- ---------- TRIGGERS ----------
-- 1. Integrity: no applications to closed jobs; a resume is mandatory
DROP TRIGGER IF EXISTS trg_app_before_insert$$
CREATE TRIGGER trg_app_before_insert BEFORE INSERT ON Application
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(10);
    SELECT Status INTO v_status FROM Job WHERE Job_ID = NEW.Job_ID;
    IF v_status = 'Closed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot apply: this job is closed';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM Resume WHERE Candidate_ID = NEW.Candidate_ID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Upload a resume before applying';
    END IF;
END$$

-- 2. 'Hired' is a final state
DROP TRIGGER IF EXISTS trg_app_before_update$$
CREATE TRIGGER trg_app_before_update BEFORE UPDATE ON Application
FOR EACH ROW
BEGIN
    IF OLD.Application_Status = 'Hired' AND NEW.Application_Status <> 'Hired' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A hired application cannot change status';
    END IF;
END$$

-- 3. Audit log (insert + status change)
DROP TRIGGER IF EXISTS trg_app_after_insert$$
CREATE TRIGGER trg_app_after_insert AFTER INSERT ON Application
FOR EACH ROW
BEGIN
    INSERT INTO Application_Status_Log (Application_ID, Old_Status, New_Status)
    VALUES (NEW.Application_ID, NULL, NEW.Application_Status);
END$$

DROP TRIGGER IF EXISTS trg_app_after_update$$
CREATE TRIGGER trg_app_after_update AFTER UPDATE ON Application
FOR EACH ROW
BEGIN
    IF NOT (OLD.Application_Status <=> NEW.Application_Status) THEN
        INSERT INTO Application_Status_Log (Application_ID, Old_Status, New_Status)
        VALUES (NEW.Application_ID, OLD.Application_Status, NEW.Application_Status);
    END IF;
END$$

-- 4. Interview must not precede the application date
DROP TRIGGER IF EXISTS trg_interview_before_insert$$
CREATE TRIGGER trg_interview_before_insert BEFORE INSERT ON Interview
FOR EACH ROW
BEGIN
    DECLARE v_app_date DATE;
    SELECT Application_Date INTO v_app_date FROM Application WHERE Application_ID = NEW.Application_ID;
    IF DATE(NEW.Interview_Date) < v_app_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Interview date cannot be before application date';
    END IF;
END$$

-- 5. Scheduling an interview auto-advances the application status
DROP TRIGGER IF EXISTS trg_interview_after_insert$$
CREATE TRIGGER trg_interview_after_insert AFTER INSERT ON Interview
FOR EACH ROW
BEGIN
    UPDATE Application SET Application_Status = 'Interview Scheduled'
    WHERE Application_ID = NEW.Application_ID
      AND Application_Status IN ('Applied','Shortlisted');
END$$

DELIMITER ;
