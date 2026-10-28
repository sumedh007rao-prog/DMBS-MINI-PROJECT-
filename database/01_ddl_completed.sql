CREATE DATABASE CorporateRecruitmentDB;

USE CorporateRecruitmentDB;

CREATE TABLE Company (
    Company_ID INT AUTO_INCREMENT,
    Company_Name VARCHAR(100) NOT NULL,
    Industry VARCHAR(50),
    Location VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    
    CONSTRAINT PK_Company PRIMARY KEY (Company_ID)
);

CREATE TABLE Candidate (
    Candidate_ID INT AUTO_INCREMENT,
    Candidate_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(15) UNIQUE,
    Experience_Years DECIMAL(4,1) DEFAULT 0,
    Qualification VARCHAR(100),
    
    CONSTRAINT PK_Candidate PRIMARY KEY (Candidate_ID),
    CONSTRAINT CHK_Experience CHECK (Experience_Years >= 0)
);

CREATE TABLE Job (
    Job_ID INT AUTO_INCREMENT,
    Company_ID INT NOT NULL,
    Job_Title VARCHAR(100) NOT NULL,
    Job_Description TEXT,
    Location VARCHAR(100),
    Salary DECIMAL(10,2),
    Job_Type VARCHAR(30),
    
    CONSTRAINT PK_Job PRIMARY KEY (Job_ID),
    
    CONSTRAINT FK_Job_Company
        FOREIGN KEY (Company_ID)
        REFERENCES Company(Company_ID),
        
    CONSTRAINT CHK_Salary CHECK (Salary >= 0)
);


CREATE TABLE Resume (
    Resume_ID INT AUTO_INCREMENT,
    Candidate_ID INT NOT NULL,
    Resume_File_Name VARCHAR(150) NOT NULL,
    Resume_Text TEXT,
    Upload_Date DATE NOT NULL,
    
    CONSTRAINT PK_Resume PRIMARY KEY (Resume_ID),
    
    CONSTRAINT FK_Resume_Candidate
        FOREIGN KEY (Candidate_ID)
        REFERENCES Candidate(Candidate_ID)
        ON DELETE CASCADE
);

CREATE TABLE Skill (
    Skill_ID INT AUTO_INCREMENT,
    Skill_Name VARCHAR(50) NOT NULL UNIQUE,
    Skill_Category VARCHAR(50),
    
    CONSTRAINT PK_Skill PRIMARY KEY (Skill_ID)
);

CREATE TABLE Candidate_Skill (
    Candidate_ID INT,
    Skill_ID INT,
    Proficiency_Level VARCHAR(30),
    
    CONSTRAINT PK_Candidate_Skill
        PRIMARY KEY (Candidate_ID, Skill_ID),
        
    CONSTRAINT FK_CS_Candidate
        FOREIGN KEY (Candidate_ID)
        REFERENCES Candidate(Candidate_ID)
        ON DELETE CASCADE,
        
    CONSTRAINT FK_CS_Skill
        FOREIGN KEY (Skill_ID)
        REFERENCES Skill(Skill_ID)
        ON DELETE CASCADE
);

CREATE TABLE Application (
    Application_ID INT AUTO_INCREMENT,
    Candidate_ID INT NOT NULL,
    Job_ID INT NOT NULL,
    Application_Date DATE NOT NULL,
    Application_Status VARCHAR(30) DEFAULT 'Applied',
    
    CONSTRAINT PK_Application
        PRIMARY KEY (Application_ID),
        
    CONSTRAINT FK_Application_Candidate
        FOREIGN KEY (Candidate_ID)
        REFERENCES Candidate(Candidate_ID),
        
    CONSTRAINT FK_Application_Job
        FOREIGN KEY (Job_ID)
        REFERENCES Job(Job_ID),
        
    CONSTRAINT UQ_Candidate_Job
        UNIQUE (Candidate_ID, Job_ID)
);


ALTER TABLE Candidate
ADD Date_of_Birth DATE;

ALTER TABLE Candidate
ADD CONSTRAINT CHK_Phone
CHECK (Phone IS NULL OR CHAR_LENGTH(Phone) >= 10);

CREATE TABLE Temporary_Data (
    Temp_ID INT,
    Temp_Name VARCHAR(50)
);

DROP TABLE Temporary_Data;
show tables
