-- Add custom_title column to analysis_history for user-defined names
ALTER TABLE public.analysis_history
ADD COLUMN custom_title VARCHAR(40) DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.analysis_history.custom_title IS 'User-defined title for the analysis (max 40 characters)';