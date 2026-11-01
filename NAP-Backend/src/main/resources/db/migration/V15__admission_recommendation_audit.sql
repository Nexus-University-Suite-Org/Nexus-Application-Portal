-- Preserve the model's recommendation separately from the decision of record.
-- Older rows remain NULL because the model outcome was not previously retained.
ALTER TABLE admission_decisions ADD COLUMN IF NOT EXISTS model_recommendation VARCHAR(20);
ALTER TABLE admission_decisions ADD COLUMN IF NOT EXISTS reasons_json TEXT;
