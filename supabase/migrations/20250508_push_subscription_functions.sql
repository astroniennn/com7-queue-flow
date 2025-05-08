
-- Create a function to upsert push subscriptions
CREATE OR REPLACE FUNCTION public.upsert_push_subscription(
  ticket_id_param TEXT,
  endpoint_param TEXT,
  p256dh_param TEXT,
  auth_param TEXT,
  subscription_data_param JSONB
) RETURNS void AS $$
BEGIN
  INSERT INTO public.push_subscriptions (
    ticket_id,
    endpoint,
    p256dh,
    auth,
    subscription_data
  ) VALUES (
    ticket_id_param,
    endpoint_param,
    p256dh_param,
    auth_param,
    subscription_data_param
  )
  ON CONFLICT (ticket_id)
  DO UPDATE SET
    endpoint = endpoint_param,
    p256dh = p256dh_param,
    auth = auth_param,
    subscription_data = subscription_data_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to delete push subscriptions
CREATE OR REPLACE FUNCTION public.delete_push_subscription(
  ticket_id_param TEXT
) RETURNS void AS $$
BEGIN
  DELETE FROM public.push_subscriptions
  WHERE ticket_id = ticket_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
