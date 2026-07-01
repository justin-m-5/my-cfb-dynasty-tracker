-- Add stadium field to games table
ALTER TABLE public.games
ADD COLUMN stadium text NULL;

-- Add stadium field to dynasties table
ALTER TABLE public.dynasties
ADD COLUMN stadium text NULL;

-- Optional: Add comments to explain the columns
COMMENT ON COLUMN public.games.stadium IS 'Stadium where the game was played';
COMMENT ON COLUMN public.dynasties.stadium IS 'Home stadium for this dynasty team';
