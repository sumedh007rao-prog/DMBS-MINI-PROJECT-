-- ============================================================
-- 05: INSERT / UPDATE seed data (run on EMPTY tables after 01-04; IDs assume fresh DB)
-- ============================================================
USE CorporateRecruitmentDB;

INSERT INTO Company (Company_Name, Industry, Location, Email) VALUES
('TechNova Solutions','IT','Bengaluru','hr@technova.example'),
('MediCare Labs','Healthcare','Mangaluru','hr@medicare.example'),
('FinEdge Capital','Finance','Mumbai','hr@finedge.example'),
('GreenGrid Energy','Energy','Pune','hr@greengrid.example');

INSERT INTO Department (Company_ID, Dept_Name) VALUES
(1,'Engineering'),(1,'Data Science'),(2,'Research'),(3,'Risk Analytics'),(4,'Operations');

INSERT INTO Skill (Skill_Name, Skill_Category) VALUES
('Python','Programming'),('Java','Programming'),('SQL','Database'),('React','Frontend'),
('Node.js','Backend'),('Machine Learning','AI'),('Docker','DevOps'),
('Data Analysis','Analytics'),('Communication','Soft Skill'),('Project Management','Management');

INSERT INTO Candidate (Candidate_Name, Email, Phone, Experience_Years, Qualification, Date_of_Birth) VALUES
('Aarav Shetty','aarav@mail.example','9876500001',3.5,'B.E. Computer Science','2001-04-12'),
('Diya Nair','diya@mail.example','9876500002',2.0,'M.Tech AI','2000-08-21'),
('Rohan Kamath','rohan@mail.example','9876500003',1.0,'B.Sc IT','2002-01-30'),
('Sneha Pai','sneha@mail.example','9876500004',5.0,'MBA Finance','1998-11-05'),
('Karthik Rao','karthik@mail.example','9876500005',4.0,'B.E. Information Science','1999-06-17'),
('Meera Bhat','meera@mail.example','9876500006',6.5,'M.Sc Statistics','1997-03-09');

INSERT INTO Resume (Candidate_ID, Resume_File_Name, Resume_Text, Upload_Date) VALUES
(1,'aarav_cv.pdf','Backend engineer with 3 years building REST APIs in Java and Spring Boot, MySQL query optimisation and Docker based deployments.','2026-08-20'),
(1,'aarav_cv_v2.pdf','Backend engineer focused on microservices, Java, Spring Boot, SQL performance tuning, CI/CD pipelines and containerisation with Docker.','2026-09-01'),
(2,'diya_cv.pdf','Machine learning engineer experienced in Python, PyTorch, NLP and recommendation systems. Built semantic search using sentence embeddings.','2026-08-25'),
(3,'rohan_cv.pdf','Junior software developer with Java and SQL basics, completed internships on web applications and database design.','2026-08-28'),
(4,'sneha_cv.pdf','Finance and risk analyst skilled in SQL, Excel dashboards, credit risk modelling and stakeholder communication.','2026-08-30'),
(5,'karthik_cv.pdf','Full stack developer proficient in React, Next.js and Node.js, building responsive dashboards and REST APIs.','2026-09-02'),
(6,'meera_cv.pdf','Data engineer and statistician using Python, SQL and Docker to build ETL pipelines and analytical reports for clinical and energy data.','2026-09-03');

INSERT INTO Job (Company_ID, Dept_ID, Job_Title, Job_Description, Location, Salary, Job_Type, Posted_Date) VALUES
(1,1,'Backend Developer','Design and maintain Java microservices and REST APIs backed by MySQL, deployed with Docker.','Bengaluru',1200000,'Full-time','2026-08-15'),
(1,2,'Machine Learning Engineer','Build NLP and recommendation models in Python, deploy semantic search with embeddings.','Bengaluru',1800000,'Full-time','2026-08-18'),
(2,3,'Clinical Data Analyst','Analyse clinical trial datasets using SQL and Python and produce reports for researchers.','Mangaluru',900000,'Full-time','2026-08-20'),
(3,4,'Risk Analyst','Model credit risk, write SQL queries and present findings to business stakeholders.','Mumbai',1100000,'Full-time','2026-08-22'),
(1,1,'Frontend Developer','Create responsive dashboards using React and Node.js based APIs.','Remote',1000000,'Contract','2026-08-25'),
(4,5,'Energy Data Engineer','Build ETL pipelines for smart grid data using Python, SQL and Docker.','Pune',1300000,'Full-time','2026-08-28');

INSERT INTO Job_Skill (Job_ID, Skill_ID) SELECT 1,Skill_ID FROM Skill WHERE Skill_Name IN ('Java','SQL','Docker');
INSERT INTO Job_Skill (Job_ID, Skill_ID) SELECT 2,Skill_ID FROM Skill WHERE Skill_Name IN ('Python','Machine Learning','SQL');
INSERT INTO Job_Skill (Job_ID, Skill_ID) SELECT 3,Skill_ID FROM Skill WHERE Skill_Name IN ('SQL','Data Analysis','Python');
INSERT INTO Job_Skill (Job_ID, Skill_ID) SELECT 4,Skill_ID FROM Skill WHERE Skill_Name IN ('SQL','Data Analysis','Communication');
INSERT INTO Job_Skill (Job_ID, Skill_ID) SELECT 5,Skill_ID FROM Skill WHERE Skill_Name IN ('React','Node.js');
INSERT INTO Job_Skill (Job_ID, Skill_ID) SELECT 6,Skill_ID FROM Skill WHERE Skill_Name IN ('Python','SQL','Docker');

-- Skill IDs: Python1 Java2 SQL3 React4 Node.js5 ML6 Docker7 DataAnalysis8 Communication9 ProjMgmt10
INSERT INTO Candidate_Skill (Candidate_ID, Skill_ID, Proficiency_Level) VALUES
(1,2,'Advanced'),(1,3,'Advanced'),(1,7,'Intermediate'),
(2,1,'Expert'),(2,6,'Advanced'),(2,3,'Intermediate'),
(3,2,'Intermediate'),(3,3,'Intermediate'),(3,7,'Beginner'),
(4,3,'Advanced'),(4,8,'Advanced'),(4,9,'Advanced'),
(5,4,'Advanced'),(5,5,'Advanced'),
(6,1,'Advanced'),(6,3,'Advanced'),(6,7,'Intermediate'),(6,8,'Intermediate');

INSERT INTO Application (Candidate_ID, Job_ID, Application_Date) VALUES
(1,1,'2026-09-01'),(2,2,'2026-09-03'),(3,1,'2026-09-05'),(4,3,'2026-09-07'),
(5,4,'2026-09-10'),(1,5,'2026-09-12'),(6,6,'2026-09-15'),(2,1,'2026-09-16');

INSERT INTO Interview (Application_ID, Interviewer_Name, Interview_Date, Interview_Mode) VALUES
(1,'Priya Menon','2026-09-20 10:00:00','Online'),
(4,'Suresh Hegde','2026-09-22 14:30:00','Onsite');

-- UPDATE demos (trigger logs each change)
UPDATE Application SET Application_Status = 'Shortlisted' WHERE Application_ID = 2;
UPDATE Application SET Application_Status = 'Rejected'    WHERE Application_ID = 6;
