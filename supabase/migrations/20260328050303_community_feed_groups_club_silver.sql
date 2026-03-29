/*
  Community: feed_posts, reactions, poll votes, groups, club_silver_requests, es_club_silver on user_profiles
*/

-- Pasaporte: flag Club Silver (activación manual por admin tras verificar pago)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS es_club_silver boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN user_profiles.es_club_silver IS 'Club Silver: activado manualmente o futuro por integración de pagos';

-- Feed
CREATE TYPE feed_post_type AS ENUM ('announcement', 'poll', 'visual', 'activation');
CREATE TYPE feed_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE IF NOT EXISTS feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type feed_post_type NOT NULL DEFAULT 'announcement',
  title text NOT NULL,
  body text,
  link_url text,
  external_media_url text,
  challenge_id uuid REFERENCES challenges(id) ON DELETE SET NULL,
  poll_option_1 text,
  poll_option_2 text,
  poll_option_3 text,
  poll_closes_at timestamptz,
  poll_closed_manually boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  status feed_post_status NOT NULL DEFAULT 'draft',
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_posts_published ON feed_posts (status, published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_feed_posts_pinned ON feed_posts (is_pinned DESC NULLS LAST);

ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read published feed posts"
  ON feed_posts FOR SELECT
  TO authenticated
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

CREATE POLICY "Admins can manage feed posts"
  ON feed_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS feed_post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_feed_post_reactions_post ON feed_post_reactions (post_id);

ALTER TABLE feed_post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read reactions on visible posts"
  ON feed_post_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM feed_posts fp
      WHERE fp.id = post_id AND fp.status = 'published'
        AND (fp.published_at IS NULL OR fp.published_at <= now())
    )
  );

CREATE POLICY "Users can insert own reactions"
  ON feed_post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM feed_posts fp
      WHERE fp.id = post_id AND fp.status = 'published'
        AND (fp.published_at IS NULL OR fp.published_at <= now())
    )
  );

CREATE POLICY "Users can delete own reactions"
  ON feed_post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS feed_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  option_index smallint NOT NULL CHECK (option_index >= 1 AND option_index <= 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE feed_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read poll votes on visible polls"
  ON feed_poll_votes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM feed_posts fp
      WHERE fp.id = post_id AND fp.post_type = 'poll' AND fp.status = 'published'
        AND (fp.published_at IS NULL OR fp.published_at <= now())
    )
  );

CREATE POLICY "Users can insert own poll vote"
  ON feed_poll_votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM feed_posts fp
      WHERE fp.id = post_id AND fp.post_type = 'poll' AND fp.status = 'published'
        AND (fp.published_at IS NULL OR fp.published_at <= now())
        AND NOT fp.poll_closed_manually
        AND (fp.poll_closes_at IS NULL OR fp.poll_closes_at > now())
    )
  );

CREATE POLICY "Users can update own poll vote"
  ON feed_poll_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Groups (community_groups: avoid reserved word "groups")
CREATE TYPE group_access_mode AS ENUM ('open', 'closed', 'invitation', 'conditional');

CREATE TABLE IF NOT EXISTS community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  objective text,
  access_mode group_access_mode NOT NULL DEFAULT 'open',
  min_passport_level passport_level,
  requires_silver_club boolean NOT NULL DEFAULT false,
  facilitator_user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  facilitator_display_name text,
  max_members integer NOT NULL DEFAULT 80 CHECK (max_members > 0 AND max_members <= 1000),
  next_session_at timestamptz,
  next_session_label text,
  is_listed boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_groups_access ON community_groups (access_mode);

CREATE TABLE IF NOT EXISTS community_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  is_facilitator boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_group_members_user ON community_group_members (user_id);

ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view open listed groups"
  ON community_groups FOR SELECT
  TO authenticated
  USING (access_mode = 'open' AND is_listed = true);

CREATE POLICY "Members can view their groups"
  ON community_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_group_members m
      WHERE m.group_id = community_groups.id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all community groups"
  ON community_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage community groups"
  ON community_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read members of open listed groups"
  ON community_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_groups g
      WHERE g.id = community_group_members.group_id
        AND g.access_mode = 'open' AND g.is_listed = true
    )
  );

CREATE POLICY "Users can read own memberships"
  ON community_group_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Members can see co-members in same group"
  ON community_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_group_members m2
      WHERE m2.group_id = community_group_members.group_id AND m2.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all group members"
  ON community_group_members FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can join open groups under capacity"
  ON community_group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM community_groups g
      WHERE g.id = group_id AND g.access_mode = 'open'
        AND (
          SELECT COUNT(*)::int FROM community_group_members m WHERE m.group_id = g.id
        ) < g.max_members
    )
  );

-- Club Silver requests (manual flow)
CREATE TYPE club_silver_request_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS club_silver_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'monthly',
  status club_silver_request_status NOT NULL DEFAULT 'pending',
  user_notes text,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES user_profiles(id),
  reviewed_at timestamptz,
  admin_notes text
);

CREATE INDEX IF NOT EXISTS idx_club_silver_requests_status ON club_silver_requests (status);
CREATE INDEX IF NOT EXISTS idx_club_silver_requests_user ON club_silver_requests (user_id);

ALTER TABLE club_silver_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own club silver requests"
  ON club_silver_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own club silver requests"
  ON club_silver_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all club silver requests"
  ON club_silver_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update club silver requests"
  ON club_silver_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
