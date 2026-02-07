-- Add UPDATE policy for analysis_history so users can rename their analyses
CREATE POLICY "Users can update their own analyses" 
ON public.analysis_history 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);