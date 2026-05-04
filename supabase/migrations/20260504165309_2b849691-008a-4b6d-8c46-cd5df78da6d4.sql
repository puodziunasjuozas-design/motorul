CREATE TABLE public.market_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  mileage TEXT,
  fuel_type TEXT,
  transmission TEXT,
  asking_price NUMERIC,
  market_average NUMERIC,
  estimated_repair_cost NUMERIC,
  price_rating TEXT,
  source TEXT DEFAULT 'analysis',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_market_knowledge_make_model_year ON public.market_knowledge(vehicle_make, vehicle_model, vehicle_year);

ALTER TABLE public.market_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read market knowledge"
  ON public.market_knowledge
  FOR SELECT
  TO authenticated
  USING (true);