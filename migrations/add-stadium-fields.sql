-- Add stadium field to games table only
-- (dynasties table doesn't need it - we look it up from fbsTeams)
ALTER TABLE public.games
ADD COLUMN stadium text NULL;

-- Optional: Add comment to explain the column
COMMENT ON COLUMN public.games.stadium IS 'Stadium where the game was played';
