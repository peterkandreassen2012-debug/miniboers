-- Create table for user PINs
CREATE TABLE IF NOT EXISTS public.user_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

-- Create policies for user_pins
CREATE POLICY "Users can view their own PIN"
ON public.user_pins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PIN"
ON public.user_pins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PIN"
ON public.user_pins
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_pins_updated_at
BEFORE UPDATE ON public.user_pins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();