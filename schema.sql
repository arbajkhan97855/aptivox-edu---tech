-- ================================================================
-- APTIVOX EDUCATION & TECHNOLOGY - ONLINE EXAMINATION SYSTEM
-- Complete Normalized MySQL Database Architecture
-- Institute: APTIVOX EDUCATION & TECHNOLOGY (9785589164)
-- ================================================================

CREATE DATABASE IF NOT EXISTS `aptivox_exam_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `aptivox_exam_db`;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'EXAM_COORDINATOR', 'INSTRUCTOR') DEFAULT 'SUPER_ADMIN',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `course_image` VARCHAR(255),
  `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 3. Batches Table
CREATE TABLE IF NOT EXISTS `batches` (
  `id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `timings` VARCHAR(100) NOT NULL,
  `status` ENUM('ACTIVE', 'COMPLETED') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Students Table
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `father_name` VARCHAR(150),
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `mobile` VARCHAR(20),
  `dob` DATE,
  `address` TEXT,
  `course_id` VARCHAR(50) NOT NULL,
  `batch` VARCHAR(100),
  `enrollment_date` DATE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `profile_image` LONGTEXT,
  `status` ENUM('ACTIVE', 'DEACTIVATED') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `image` VARCHAR(255),
  `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Topics Table
CREATE TABLE IF NOT EXISTS `topics` (
  `id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Test Levels Table
CREATE TABLE IF NOT EXISTS `test_levels` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 8. Exam Papers Table
CREATE TABLE IF NOT EXISTS `exam_papers` (
  `id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `topic_id` VARCHAR(50) NOT NULL,
  `level_id` VARCHAR(50) NOT NULL,
  `paper_number` INT NOT NULL DEFAULT 1,
  `title` VARCHAR(255) NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 60,
  `total_questions` INT NOT NULL DEFAULT 50,
  `total_marks` DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  `passing_marks` DECIMAL(6,2) NOT NULL DEFAULT 40.00,
  `negative_marking` DECIMAL(4,2) NOT NULL DEFAULT 0.50,
  `randomize` BOOLEAN DEFAULT TRUE,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'PUBLISHED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`level_id`) REFERENCES `test_levels`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 9. Question Bank Table
CREATE TABLE IF NOT EXISTS `questions` (
  `id` VARCHAR(50) NOT NULL,
  `paper_id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50),
  `topic_id` VARCHAR(50),
  `level_id` VARCHAR(50),
  `question_text` TEXT NOT NULL,
  `question_image` VARCHAR(255),
  `option_a` TEXT NOT NULL,
  `option_b` TEXT NOT NULL,
  `option_c` TEXT NOT NULL,
  `option_d` TEXT NOT NULL,
  `correct_answer` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `marks` DECIMAL(4,2) DEFAULT 2.00,
  `negative_marks` DECIMAL(4,2) DEFAULT 0.50,
  `explanation` TEXT,
  `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`paper_id`) REFERENCES `exam_papers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Exam Attempts Table (One-Time Execution Tracking)
CREATE TABLE IF NOT EXISTS `exam_attempts` (
  `id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `exam_id` VARCHAR(50) NOT NULL,
  `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'VIOLATED', 'RE_EXAM_REQUIRED', 'COMPLETED') DEFAULT 'NOT_STARTED',
  `started_at` DATETIME NOT NULL,
  `submitted_at` DATETIME,
  `time_taken_seconds` INT DEFAULT 0,
  `score` DECIMAL(6,2) DEFAULT 0.00,
  `total_marks` DECIMAL(6,2) DEFAULT 100.00,
  `percentage` DECIMAL(5,2) DEFAULT 0.00,
  `passed` BOOLEAN DEFAULT FALSE,
  `correct_count` INT DEFAULT 0,
  `wrong_count` INT DEFAULT 0,
  `unanswered_count` INT DEFAULT 0,
  `violation_count` INT DEFAULT 0,
  `camera_status` VARCHAR(50) DEFAULT 'ACTIVE',
  `re_exam_required` BOOLEAN DEFAULT FALSE,
  `ip_address` VARCHAR(45),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`exam_id`) REFERENCES `exam_papers`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 11. Exam Answers Table
CREATE TABLE IF NOT EXISTS `exam_answers` (
  `id` VARCHAR(50) NOT NULL,
  `attempt_id` VARCHAR(50) NOT NULL,
  `question_id` VARCHAR(50) NOT NULL,
  `selected_option` ENUM('A', 'B', 'C', 'D'),
  `is_marked_for_review` BOOLEAN DEFAULT FALSE,
  `answered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Exam Violations Table
CREATE TABLE IF NOT EXISTS `exam_violations` (
  `id` VARCHAR(50) NOT NULL,
  `attempt_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `exam_id` VARCHAR(50) NOT NULL,
  `violation_type` VARCHAR(100) NOT NULL,
  `details` TEXT,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Re-Exam Requests Table
CREATE TABLE IF NOT EXISTS `re_exam_requests` (
  `id` VARCHAR(50) NOT NULL,
  `attempt_id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(50) NOT NULL,
  `exam_id` VARCHAR(50) NOT NULL,
  `reason` TEXT,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  `requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by` VARCHAR(50),
  `reviewed_at` DATETIME,
  `admin_remarks` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Study Notes Repository Table
CREATE TABLE IF NOT EXISTS `notes` (
  `id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50),
  `topic_id` VARCHAR(50),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `pdf_url` LONGTEXT NOT NULL,
  `cover_image` VARCHAR(255),
  `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  `download_count` INT DEFAULT 0,
  `uploaded_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(50) NOT NULL,
  `recipient_type` ENUM('ADMIN', 'STUDENT') NOT NULL,
  `student_id` VARCHAR(50),
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `read_status` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 16. Institute Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `institute_name` VARCHAR(255) NOT NULL,
  `tagline` VARCHAR(255) NOT NULL,
  `address` TEXT NOT NULL,
  `contact` VARCHAR(50) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `passing_percentage` INT DEFAULT 40,
  `default_exam_duration` INT DEFAULT 60,
  `camera_required` BOOLEAN DEFAULT TRUE,
  `fullscreen_required` BOOLEAN DEFAULT TRUE,
  `re_exam_policy` VARCHAR(100) DEFAULT 'STRICT_ADMIN_APPROVAL'
) ENGINE=InnoDB;

-- ================================================================
-- INITIAL SEED STATEMENTS
-- ================================================================

-- Default Admin Account: aptivoxeducation@gmail.com / aptivox123
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`) VALUES
('admin_1', 'Aptivox Director / Admin', 'aptivoxeducation@gmail.com', '$2a$10$fV27wG7V6n197t8uU2m1veX0O6fS32l5v5M1hT50k8e4E7L1s0GgO', 'SUPER_ADMIN')
ON DUPLICATE KEY UPDATE `email`=`email`;

-- Test Levels
INSERT INTO `test_levels` (`id`, `name`) VALUES
('l1', 'Basic Test'),
('l2', 'Medium Test'),
('l3', 'Advanced Test')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Institute Settings
INSERT INTO `settings` (`id`, `institute_name`, `tagline`, `address`, `contact`, `email`, `passing_percentage`, `default_exam_duration`, `camera_required`, `fullscreen_required`, `re_exam_policy`) VALUES
(1, 'APTIVOX EDUCATION & TECHNOLOGY', 'Learn Today. Achieve Tomorrow.', '', '9785589164', 'aptivoxeducation@gmail.com', 40, 60, 1, 1, 'STRICT_ADMIN_APPROVAL')
ON DUPLICATE KEY UPDATE `institute_name`=`institute_name`;
