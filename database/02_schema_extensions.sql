-- ============================================================
-- 02: ALTER / CREATE extensions + INDEXES  (run after 01)
-- ============================================================
USE CorporateRecruitmentDB;

-- ---------- New tables (from ER diagram: Department, Interview) ----------
CREATE TABLE Department (
    Dept_ID    INT AUTO_INCREMENT,
    Company_ID INT NOT NULL,
    Dept_Name  VARCHAR(80) NOT NULL,
    CONSTRAINT PK_Department PRIMARY KEY (Dept_ID),
    CONSTRAINT FK_Dept_Company FOREIGN KEY (Company_ID)
        REFERENCES Company(Company_ID) ON DELETE CASCADE,
    CONSTRAINT UQ_Dept UNIQUE (Company_ID, Dept_Name)
);

-- ---------- ALTER Job: link to department, posting date, open/closed status ----------
ALTER TABLE Job
    ADD COLUMN Dept_ID     INT NULL,
    ADD COLUMN Posted_Date DATE NOT NULL DEFAULT (CURRENT_DATE),
    ADD COLUMN Status      VARCHAR(10) NOT NULL DEFAULT 'Open',
    ADD CONSTRAINT FK_Job_Dept FOREIGN KEY (Dept_ID)
        REFERENCES Department(Dept_ID) ON DELETE SET NULL,
    ADD CONSTRAINT CHK_Job_Status CHECK (Status IN ('Open','Closed')),
    ADD CONSTRAINT CHK_Job_Type CHECK (Job_Type IS NULL OR
        Job_Type IN ('Full-time','Part-time','Contract','Internship'));

-- Skills required by a job (M:N Job <-> Skill) - powers skill-match scoring
CREATE TABLE Job_Skill (
    Job_ID      INT,
    Skill_ID    INT,
    Is_Required BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT PK_Job_Skill PRIMARY KEY (Job_ID, Skill_ID),
    CONSTRAINT FK_JS_Job   FOREIGN KEY (Job_ID)   REFERENCES Job(Job_ID)     ON DELETE CASCADE,
    CONSTRAINT FK_JS_Skill FOREIGN KEY (Skill_ID) REFERENCES Skill(Skill_ID) ON DELETE CASCADE
);

-- Domain constraints on existing tables
ALTER TABLE Application
    ADD CONSTRAINT CHK_App_Status CHECK (Application_Status IN
        ('Applied','Shortlisted','Interview Scheduled','Rejected','Hired'));
ALTER TABLE Candidate_Skill
    ADD CONSTRAINT CHK_Proficiency CHECK (Proficiency_Level IN
        ('Beginner','Intermediate','Advanced','Expert'));

CREATE TABLE Interview (
    Interview_ID     INT AUTO_INCREMENT,
    Application_ID   INT NOT NULL,
    Interviewer_Name VARCHAR(100) NOT NULL,
    Interview_Date   DATETIME NOT NULL,
    Interview_Mode   VARCHAR(10) NOT NULL DEFAULT 'Online',
    Interview_Status VARCHAR(10) NOT NULL DEFAULT 'Scheduled',
    Feedback         TEXT,
    CONSTRAINT PK_Interview PRIMARY KEY (Interview_ID),
    CONSTRAINT FK_Interview_App FOREIGN KEY (Application_ID)
        REFERENCES Application(Application_ID) ON DELETE CASCADE,
    CONSTRAINT CHK_Int_Mode   CHECK (Interview_Mode   IN ('Online','Onsite','Phone')),
    CONSTRAINT CHK_Int_Status CHECK (Interview_Status IN ('Scheduled','Completed','Cancelled'))
);

-- Application users (authentication + RBAC: Admin / Recruiter / Candidate)
CREATE TABLE Users (
    User_ID       INT AUTO_INCREMENT,
    Username      VARCHAR(50)  NOT NULL UNIQUE,
    Password_Hash VARCHAR(100) NOT NULL,           -- bcrypt hash, never plain text
    Role          VARCHAR(15)  NOT NULL,
    Candidate_ID  INT NULL UNIQUE,
    Company_ID    INT NULL,
    Created_At    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Users PRIMARY KEY (User_ID),
    CONSTRAINT CHK_User_Role CHECK (Role IN ('Admin','Recruiter','Candidate')),
    CONSTRAINT FK_User_Candidate FOREIGN KEY (Candidate_ID)
        REFERENCES Candidate(Candidate_ID) ON DELETE CASCADE,
    CONSTRAINT FK_User_Company FOREIGN KEY (Company_ID)
        REFERENCES Company(Company_ID) ON DELETE SET NULL
);

-- Audit trail filled by trigger
CREATE TABLE Application_Status_Log (
    Log_ID         INT AUTO_INCREMENT PRIMARY KEY,
    Application_ID INT NOT NULL,
    Old_Status     VARCHAR(30),
    New_Status     VARCHAR(30) NOT NULL,
    Changed_At     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Log_App FOREIGN KEY (Application_ID)
        REFERENCES Application(Application_ID) ON DELETE CASCADE
);

-- ---------- INDEXES ----------
CREATE INDEX idx_job_status_location ON Job(Status, Location);
CREATE INDEX idx_app_job_status      ON Application(Job_ID, Application_Status);
CREATE INDEX idx_candidate_exp       ON Candidate(Experience_Years);
CREATE INDEX idx_resume_cand_date    ON Resume(Candidate_ID, Upload_Date);
CREATE INDEX idx_interview_date      ON Interview(Interview_Date);

-- Full-text indexes (keyword search)
CREATE FULLTEXT INDEX ft_job    ON Job(Job_Title, Job_Description);
CREATE FULLTEXT INDEX ft_resume ON Resume(Resume_Text);

-- DROP INDEX demonstration
CREATE INDEX idx_tmp ON Company(Industry);
DROP INDEX idx_tmp ON Company;

SHOW INDEX FROM Job;
