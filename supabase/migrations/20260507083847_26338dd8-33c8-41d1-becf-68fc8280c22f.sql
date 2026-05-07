
-- Update testimonial INSERT policy: require purchase + at least one analysis or consultation
DROP POLICY IF EXISTS "Users with purchases can insert testimonials" ON public.user_testimonials;
CREATE POLICY "Users with activity can insert testimonials"
ON public.user_testimonials
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.purchases WHERE user_id = auth.uid() AND status = 'completed')
  AND (
    EXISTS (SELECT 1 FROM public.analysis_history WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.chat_conversations WHERE user_id = auth.uid())
  )
);

-- Admin can update / delete testimonials (approve/reject)
CREATE POLICY "Admins can update testimonials"
ON public.user_testimonials
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete testimonials"
ON public.user_testimonials
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- auto_analyses table
CREATE TYPE public.auto_analysis_status AS ENUM ('pending', 'good', 'bad');

CREATE TABLE public.auto_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_url TEXT NOT NULL,
  source TEXT NOT NULL,
  scraped_data JSONB DEFAULT '{}'::jsonb,
  analysis_data JSONB DEFAULT '{}'::jsonb,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  current_price NUMERIC,
  review_status public.auto_analysis_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auto_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view auto analyses"
ON public.auto_analyses FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert auto analyses"
ON public.auto_analyses FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update auto analyses"
ON public.auto_analyses FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete auto analyses"
ON public.auto_analyses FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_auto_analyses_updated_at
BEFORE UPDATE ON public.auto_analyses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_auto_analyses_status ON public.auto_analyses(review_status, created_at DESC);
