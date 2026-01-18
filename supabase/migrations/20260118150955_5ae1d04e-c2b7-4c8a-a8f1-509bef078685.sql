-- Create user testimonials table
CREATE TABLE public.user_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  author_name TEXT NOT NULL,
  country TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_testimonials ENABLE ROW LEVEL SECURITY;

-- Users can insert their own testimonials (only if they have purchases)
CREATE POLICY "Users with purchases can insert testimonials"
ON public.user_testimonials
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM purchases 
    WHERE purchases.user_id = auth.uid() 
    AND purchases.status = 'completed'
  )
);

-- Users can view their own testimonials
CREATE POLICY "Users can view their own testimonials"
ON public.user_testimonials
FOR SELECT
USING (auth.uid() = user_id);

-- Everyone can view approved testimonials
CREATE POLICY "Everyone can view approved testimonials"
ON public.user_testimonials
FOR SELECT
USING (is_approved = true);

-- Users can delete their own testimonials
CREATE POLICY "Users can delete their own testimonials"
ON public.user_testimonials
FOR DELETE
USING (auth.uid() = user_id);