-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: studenthub
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB
CREATE DATABASE IF NOT EXISTS `studenthub` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `studenthub`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `target_entity` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_date` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'SYSTEM_INIT','database',0,'Database tables and schemas successfully seeded.','127.0.0.1','2026-10-13 13:35:30'),(2,1,'APPROVE_BONAFIDE','student',1,'Approved bonafide certificate request for 25IT049.','127.0.0.1','2026-10-13 13:35:30'),(3,1,'UPDATE_ATTENDANCE','student',1,'Updated attendance ledger to 92.50% for 25IT049.','127.0.0.1','2026-10-13 13:35:30'),(4,3,'USER_REGISTER','users',3,'Student self-registered with roll 25IT155 (25it155@charusat.edu.in)','::1','2026-10-13 14:11:20'),(5,4,'USER_REGISTER','users',4,'Student self-registered with roll 25IT789 (teststudent789@charusat.edu.in)','::1','2026-10-14 04:41:50'),(6,5,'USER_REGISTER','users',5,'Student self-registered with roll 25IT099 (test25it099@charusat.edu.in)','::1','2026-10-14 14:27:33'),(7,6,'USER_REGISTER','users',6,'Student self-registered with roll 25IT057 (25it057@charusat.edu.in)','::1','2026-10-14 14:33:26');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(32) NOT NULL,
  `full_name` varchar(128) NOT NULL,
  `email` varchar(128) NOT NULL,
  `phone` varchar(32) DEFAULT '',
  `subject` varchar(128) NOT NULL,
  `category` varchar(64) DEFAULT 'General',
  `message` text NOT NULL,
  `ip_address` varchar(45) DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_id` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'TKT-20261014-9DC58','Tirth Ladani','25it049@charusat.edu.in','9876543210','Audit Verification','Technical','Automated verification test from audit suite.','::1','2026-10-14 18:25:24'),(2,'TKT-20261014-7F7B9','Tirth Ladani','25it049@charusat.edu.in','9876543210','Pre-Deployment Verification','Technical','Automated verification test message from deployment audit.','::1','2026-10-14 18:34:00'),(3,'TKT-20261014-3E443','Tirth Ladani','25it049@charusat.edu.in','9876543210','Pre-Deployment Verification','Technical','Automated verification test message from deployment audit.','::1','2026-10-14 18:40:16'),(4,'TKT-20261016-7C283','Tirth Ladani','25it049@charusat.edu.in','9876543210','Deployment Readiness Check','Technical Support','Automated end-to-end inquiry verification testing contact form processing with CSRF.','::1','2026-10-16 06:45:25');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `category` enum('tech','career','workshop','sports','cultural') NOT NULL,
  `category_label` varchar(100) NOT NULL,
  `event_date` date NOT NULL,
  `event_time` varchar(100) NOT NULL,
  `location` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `seats_total` int(10) unsigned NOT NULL DEFAULT 100,
  `seats_left` int(10) unsigned NOT NULL DEFAULT 100,
  `fee` varchar(50) DEFAULT 'Free',
  `organizer` varchar(150) NOT NULL,
  `status` varchar(50) DEFAULT 'Registration Open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_evt_category` (`category`),
  KEY `idx_evt_date` (`event_date`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'36-Hour National Campus Hackathon','tech','Technical Hackathon','2026-08-17','09:00 AM onwards (36h continuous)','Innovation Lab & Cloud Arena, Block D','Build production-ready prototypes addressing smart governance, healthcare AI, and sustainable energy with industry mentoring.',NULL,120,42,'Free','CSPIT & DEPSTAR Coding Society','Registration Open','2026-10-13 13:35:30'),(2,'Amazon & Google Campus Placement Drive','career','Placement Drive','2026-08-19','10:00 AM - 05:00 PM','Central Auditorium & Online Assessment Labs','On-campus recruitment and technical interviews for Final Year and Pre-Final Year students across Software Engineering roles.',NULL,200,18,'Free','CHARUSAT Career Development Cell (CDPC)','Mandatory Registration','2026-10-13 13:35:30'),(3,'Full-Stack Cloud & Kubernetes Deep-Dive','workshop','Hands-on Workshop','2026-08-22','01:30 PM - 05:30 PM','Lab 304, IT Department','Comprehensive practical session on microservices architecture, Docker containerization, CI/CD pipelines, and cloud cluster deployment.',NULL,60,8,'₹150 (Includes Certificate)','DevOps & Cloud Student Chapter','Filling Fast','2026-10-13 13:35:30'),(4,'CHARUSAT Inter-College Cricket Premier League','sports','Sports League','2026-08-25','07:30 AM onwards','University Sports Complex Grounds','Annual 20-over tournament featuring 16 department teams competing for the Vice-Chancellor Trophy.',NULL,16,2,'Free for Spectators','Department of Physical Education','Fixtures Announced','2026-10-13 13:35:30'),(5,'Vrund — Annual Cultural Gala & Musical Night','cultural','Cultural Gala','2026-08-28','06:00 PM - 10:30 PM','Open Air Amphitheatre','A vibrant celebration of campus talent featuring classical and fusion dance, battle of bands, theatrical acts, and food carnival.',NULL,1500,340,'Free Entry (Valid ID required)','CHARUSAT Cultural Youth Council','Passes Available','2026-10-13 13:35:30'),(6,'Generative AI & LLM Systems Bootcamp','tech','Technical Symposium','2026-09-02','10:00 AM - 04:00 PM','Seminar Hall 2, CSPIT','Explore Transformer models, RAG pipelines, model fine-tuning with PyTorch, and deploying agentic systems at scale.',NULL,90,25,'₹200','Artificial Intelligence Guild','Registration Open','2026-10-13 13:35:30'),(7,'Resume Polish & Mock Interview Marathon','career','Career Guidance','2026-09-06','02:00 PM - 06:00 PM','CDPC Interview Rooms','One-on-one resume feedback with corporate recruiters and mock behavioural HR interview drill sessions.',NULL,80,14,'Free','CHARUSAT CDPC','Registration Open','2026-10-13 13:35:30'),(8,'Cybersecurity & Ethical Hacking Hands-on','workshop','Hands-on Workshop','2026-09-10','09:30 AM - 03:30 PM','Computer Center Lab 1','Hands-on capture-the-flag (CTF) challenges covering network packet inspection, web app vulnerability scanning, and defense.',NULL,70,11,'₹100','Cyber Defense Club','Registration Open','2026-10-13 13:35:30');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ref_id` varchar(32) NOT NULL,
  `rating` tinyint(4) NOT NULL DEFAULT 5,
  `feedback_type` varchar(64) DEFAULT 'suggestion',
  `topics` varchar(255) DEFAULT '',
  `student_name` varchar(128) DEFAULT '',
  `enrolment` varchar(32) DEFAULT '',
  `email` varchar(128) DEFAULT '',
  `department` varchar(128) DEFAULT '',
  `is_anonymous` tinyint(1) DEFAULT 0,
  `comments` text NOT NULL,
  `ip_address` varchar(45) DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ref_id` (`ref_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,'SH-FB-2026-B875',5,'suggestion','general','Diagnostic Student','25IT001','','Information Technology',0,'Automated diagnostic test: Portal is lightning fast!','::1','2026-10-14 14:59:05'),(2,'SH-FB-2026-E94B',5,'compliment','general','Tirth','25IT049','','Information Technology',0,'Redesigned feedback page works flawlessly with cyber-glassmorphism visuals and rapid council logging.','::1','2026-10-14 15:09:04'),(3,'SH-FB-2026-9593',5,'portal','ui, speed','Tirth Ladani','25IT049','25it049@charusat.edu.in','Information Technology',0,'Automated diagnostic feedback test. System running smoothly.','::1','2026-10-14 18:20:41'),(4,'SH-FB-2026-6B14',5,'portal','ui, dashboard, performance','Tirth Ladani','25IT049','25it049@charusat.edu.in','Information Technology',0,'Verification test for deployment audit. System validated.','::1','2026-10-14 18:33:59'),(5,'SH-FB-2026-56F2',5,'portal','ui, dashboard, performance','Tirth Ladani','25IT049','25it049@charusat.edu.in','Information Technology',0,'Verification test for deployment audit. System validated.','::1','2026-10-14 18:40:15'),(6,'SH-FB-2026-4B84',5,'praise','general','Tirth Ladani','25IT049','25it049@charusat.edu.in','Information Technology',0,'Automated test verification: Backend connectivity and database persistence operating at peak performance!','::1','2026-10-16 06:45:14');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `roll_no` varchar(20) NOT NULL,
  `ticket_code` varchar(50) NOT NULL,
  `payment_reference` varchar(100) DEFAULT 'FREE_PASS',
  `status` enum('Confirmed','Waitlisted','Cancelled') DEFAULT 'Confirmed',
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_code` (`ticket_code`),
  KEY `fk_reg_event` (`event_id`),
  KEY `fk_reg_student` (`student_id`),
  CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reg_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `roll_no` varchar(20) NOT NULL,
  `email` varchar(120) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `gender` enum('Male','Female','Other') DEFAULT 'Male',
  `department` varchar(100) NOT NULL,
  `institute` varchar(50) DEFAULT 'CSPIT',
  `programme` varchar(80) DEFAULT 'B.Tech Information Technology',
  `academic_year` varchar(50) DEFAULT '3rd Year (Semester 5 & 6)',
  `semester` tinyint(4) DEFAULT 5,
  `cgpa` decimal(4,2) DEFAULT 8.00,
  `sgpa` decimal(4,2) DEFAULT 8.00,
  `attendance` decimal(5,2) DEFAULT 85.00,
  `status` enum('Active','Pending Review','Probation','Alumni') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `roll_no` (`roll_no`),
  KEY `idx_dept` (`department`),
  KEY `idx_status` (`status`),
  KEY `fk_students_user` (`user_id`),
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,2,'Tirth Ladani','25IT049','25it049@charusat.edu.in','+91 98765 43210','Male','Information Technology','CSPIT','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,8.64,8.85,92.50,'Active','2026-10-13 13:35:30'),(2,NULL,'Aarav Sharma','25IT012','25it012@charusat.edu.in','+91 98251 12345','Male','Information Technology','CSPIT','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,9.12,9.30,96.00,'Active','2026-10-13 13:35:30'),(3,NULL,'Diya Patel','25CE034','25ce034@charusat.edu.in','+91 97123 45678','Female','Computer Engineering','CSPIT','B.Tech Computer Engineering','3rd Year (Semester 5 & 6)',5,8.90,9.05,89.20,'Active','2026-10-13 13:35:30'),(4,NULL,'Kavya Joshi','25CE078','25ce078@charusat.edu.in','+91 99099 87654','Female','Computer Engineering','DEPSTAR','B.Tech Computer Engineering','3rd Year (Semester 5 & 6)',5,7.85,8.10,84.50,'Active','2026-10-13 13:35:30'),(5,NULL,'Rohan Mehta','25EC015','25ec015@charusat.edu.in','+91 98980 11223','Male','Electronics & Communication','CSPIT','B.Tech Electronics & Communication','3rd Year (Semester 5 & 6)',5,8.42,8.50,91.00,'Active','2026-10-13 13:35:30'),(6,NULL,'Ananya Desai','25ME021','25me021@charusat.edu.in','+91 94260 99887','Female','Mechanical Engineering','CSPIT','B.Tech Mechanical Engineering','3rd Year (Semester 5 & 6)',5,7.95,8.20,88.00,'Active','2026-10-13 13:35:30'),(7,NULL,'Siddharth Shah','25CL009','25cl009@charusat.edu.in','+91 97240 55443','Male','Civil Engineering','CSPIT','B.Tech Civil Engineering','3rd Year (Semester 5 & 6)',5,8.15,8.00,86.50,'Active','2026-10-13 13:35:30'),(8,NULL,'Pooja Trivedi','25IT088','25it088@charusat.edu.in','+91 98240 66778','Female','Information Technology','DEPSTAR','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,8.75,8.90,94.00,'Active','2026-10-13 13:35:30'),(9,NULL,'Manan Vora','25CE102','25ce102@charusat.edu.in','+91 99790 33445','Male','Computer Engineering','CSPIT','B.Tech Computer Engineering','3rd Year (Semester 5 & 6)',5,9.45,9.60,98.20,'Active','2026-10-13 13:35:30'),(10,NULL,'Isha Bhatt','25IT063','25it063@charusat.edu.in','+91 98791 22334','Female','Information Technology','CSPIT','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,8.30,8.45,87.00,'Active','2026-10-13 13:35:30'),(11,NULL,'Varun Prajapati','25EC044','25ec044@charusat.edu.in','+91 99250 88990','Male','Electronics & Communication','CSPIT','B.Tech Electronics & Communication','3rd Year (Semester 5 & 6)',5,7.60,7.75,78.50,'Pending Review','2026-10-13 13:35:30'),(12,NULL,'Neha Soni','25ME049','25me049@charusat.edu.in','+91 94080 77665','Female','Mechanical Engineering','CSPIT','B.Tech Mechanical Engineering','3rd Year (Semester 5 & 6)',5,8.55,8.70,93.40,'Active','2026-10-13 13:35:30'),(13,NULL,'Jaydeep Solanki','25CL032','25cl032@charusat.edu.in','+91 97140 11998','Male','Civil Engineering','CSPIT','B.Tech Civil Engineering','3rd Year (Semester 5 & 6)',5,7.40,7.30,76.00,'Probation','2026-10-13 13:35:30'),(14,NULL,'Riya Panchal','25IT110','25it110@charusat.edu.in','+91 98254 44556','Female','Information Technology','DEPSTAR','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,9.20,9.35,95.80,'Active','2026-10-13 13:35:30'),(15,NULL,'Parth Thakkar','25CE145','25ce145@charusat.edu.in','+91 99092 66778','Male','Computer Engineering','CSPIT','B.Tech Computer Engineering','3rd Year (Semester 5 & 6)',5,8.80,8.95,90.00,'Active','2026-10-13 13:35:30'),(16,NULL,'Khushi Gajjar','25IT005','25it005@charusat.edu.in','+91 98795 33221','Female','Information Technology','CSPIT','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,8.95,9.15,92.00,'Active','2026-10-13 13:35:30'),(17,NULL,'Aayush Parikh','25EC062','25ec062@charusat.edu.in','+91 98250 33441','Male','Electronics & Communication','CSPIT','B.Tech Electronics & Communication','3rd Year (Semester 5 & 6)',5,8.10,8.25,89.00,'Active','2026-10-13 13:35:30'),(18,NULL,'Tanvi Dave','25CE167','25ce167@charusat.edu.in','+91 99098 77654','Female','Computer Engineering','CSPIT','B.Tech Computer Engineering','3rd Year (Semester 5 & 6)',5,8.65,8.70,91.50,'Active','2026-10-13 13:35:30'),(19,NULL,'Harsh Raval','25ME077','25me077@charusat.edu.in','+91 94270 22331','Male','Mechanical Engineering','CSPIT','B.Tech Mechanical Engineering','3rd Year (Semester 5 & 6)',5,7.70,7.80,82.00,'Active','2026-10-13 13:35:30'),(20,NULL,'Maitri Kothari','25IT142','25it142@charusat.edu.in','+91 98982 44551','Female','Information Technology','CSPIT','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,9.35,9.40,97.00,'Active','2026-10-13 13:35:30'),(21,3,'Kavya Patel','25IT155','25it155@charusat.edu.in','9876543210','Female','Information Technology','CSPIT','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,8.50,8.50,90.00,'Active','2026-10-13 14:11:20'),(22,4,'Test Student','25IT789','teststudent789@charusat.edu.in','9876543210','Male','Information Technology','CSPIT','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,8.50,8.50,90.00,'Active','2026-10-14 04:41:50'),(24,6,'Tilak Padsumbiya','25IT057','25it057@charusat.edu.in','9876543210','Male','Information Technology','CSPIT','B.Tech Information Technology','3rd Year (Semester 5 & 6)',5,8.50,8.50,90.00,'Active','2026-10-14 14:33:26');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roll_no` varchar(20) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','admin') NOT NULL DEFAULT 'student',
  `status` enum('Active','Pending','Suspended') NOT NULL DEFAULT 'Active',
  `last_login` datetime DEFAULT NULL,
  `remember_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `roll_no` (`roll_no`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ADMIN01','admin@charusat.edu.in','/m4a9Z3Isy8J7V1zUOHmwIc.HICi','admin','Active','2026-10-16 10:15:15',NULL,'2026-10-13 13:35:30'),(2,'25IT049','25it049@charusat.edu.in','.0v.IgIJn0tb0Dph/.hJr8kg0igFJEI6','student','Active','2026-10-16 10:15:14',NULL,'2026-10-13 13:35:30'),(3,'25IT155','25it155@charusat.edu.in','$2y$10$VIevU6DnQE76uW3sV7bLLusuv/Tlqz0X5pxOKn3EHeANGCI5rRTZ.','student','Active',NULL,NULL,'2026-10-13 14:11:20'),(4,'25IT789','teststudent789@charusat.edu.in','$2y$10$NqkYSWUF4i/roAineUnrdOMx.j0GDAi.quW/m14sZrulb5yGLnc4S','student','Active',NULL,NULL,'2026-10-14 04:41:50'),(6,'25IT057','25it057@charusat.edu.in','$2y$10$AEzObtNGG2w/3qtkEJ2tv.EoInworfT6jOSePKyhb2OmnkjNIv/f.','student','Active','2026-10-14 21:40:42',NULL,'2026-10-14 14:33:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-16 10:16:07

-- =============================================================================
-- STORED PROCEDURE (Fulfills Practical 8 Advanced Extension)
-- Aggregates total students, average CGPA, and attendance by department.
-- =============================================================================
DROP PROCEDURE IF EXISTS sp_GetDepartmentMetrics;
DELIMITER //
CREATE PROCEDURE sp_GetDepartmentMetrics(IN target_dept VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci)
BEGIN
    IF target_dept = 'all' OR target_dept = '' OR target_dept IS NULL THEN
        SELECT 
            department,
            COUNT(*) AS total_students,
            ROUND(AVG(cgpa), 2) AS average_cgpa,
            ROUND(AVG(attendance), 2) AS average_attendance,
            SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active_students
        FROM students
        GROUP BY department;
    ELSE
        SELECT 
            department,
            COUNT(*) AS total_students,
            ROUND(AVG(cgpa), 2) AS average_cgpa,
            ROUND(AVG(attendance), 2) AS average_attendance,
            SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active_students
        FROM students
        WHERE department = target_dept
        GROUP BY department;
    END IF;
END //
DELIMITER ;
