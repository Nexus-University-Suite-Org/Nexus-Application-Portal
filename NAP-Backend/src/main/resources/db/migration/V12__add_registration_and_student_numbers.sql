ALTER TABLE applications ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50) UNIQUE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS student_number VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_applications_registration_number ON applications (registration_number);
CREATE INDEX IF NOT EXISTS idx_applications_student_number ON applications (student_number);
