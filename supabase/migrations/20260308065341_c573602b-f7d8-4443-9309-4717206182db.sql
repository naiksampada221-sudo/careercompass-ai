-- Activity history table to store all user activities
CREATE TABLE public.activity_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('resume_analysis', 'ats_scan', 'skill_explorer')),
  title TEXT NOT NULL,
  summary TEXT,
  score INTEGER,
  result_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own history
CREATE POLICY "Users can view own history"
  ON public.activity_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can insert own history"
  ON public.activity_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own history
CREATE POLICY "Users can delete own history"
  ON public.activity_history FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_activity_history_user_id ON public.activity_history(user_id);
CREATE INDEX idx_activity_history_type ON public.activity_history(activity_type);
CREATE INDEX idx_activity_history_created ON public.activity_history(created_at DESC);