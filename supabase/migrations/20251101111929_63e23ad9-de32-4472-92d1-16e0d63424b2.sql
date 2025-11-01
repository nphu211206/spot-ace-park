-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix search_path for update_available_spots function
CREATE OR REPLACE FUNCTION public.update_available_spots()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed') THEN
    UPDATE public.parking_lots
    SET available_spots = available_spots - 1
    WHERE id = NEW.parking_lot_id AND available_spots > 0;
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'completed')) OR
        (TG_OP = 'DELETE' AND OLD.status = 'confirmed') THEN
    UPDATE public.parking_lots
    SET available_spots = available_spots + 1
    WHERE id = COALESCE(NEW.parking_lot_id, OLD.parking_lot_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;