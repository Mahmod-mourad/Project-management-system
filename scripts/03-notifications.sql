-- Notifications, and the triggers that write them.
--
-- Unchanged in intent from the original script, but it could never have run:
-- its triggers are declared on tasks and projects, and nothing created those
-- tables. It now runs after 02, which does.

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_tenant_user ON notifications(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Tell a user when a task lands on them.
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.assignee_id IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND OLD.assignee_id IS DISTINCT FROM NEW.assignee_id AND NEW.assignee_id IS NOT NULL) THEN

    INSERT INTO notifications (tenant_id, user_id, title, message, type, data)
    VALUES (
      NEW.tenant_id,
      NEW.assignee_id,
      'New task',
      'You have been assigned "' || NEW.title || '"',
      'info',
      jsonb_build_object('type', 'task_assigned', 'task_id', NEW.id, 'task_title', NEW.title)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_task_assignment ON tasks;
CREATE TRIGGER trigger_notify_task_assignment
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assignment();

-- Tell the team when a project changes state.
CREATE OR REPLACE FUNCTION notify_project_update()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (tenant_id, user_id, title, message, type, data)
    SELECT
      NEW.tenant_id,
      pm.user_id,
      'Project updated',
      'Project "' || NEW.name || '" moved to ' || NEW.status,
      'info',
      jsonb_build_object('type', 'project_update', 'project_id', NEW.id, 'project_name', NEW.name, 'new_status', NEW.status)
    FROM project_members pm
    WHERE pm.project_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_project_update ON projects;
CREATE TRIGGER trigger_notify_project_update
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_project_update();

-- See the note in 01: RLS on, no permissive policy.
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Supabase's PostgREST connects as service_role, which bypasses row level
-- security but still needs ordinary table privileges. Tables created by running
-- these scripts with psql do not pick up the default grants Supabase applies to
-- tables made through its own tooling, so without this every request answers
-- "permission denied for table ..." with a hint to grant exactly this.
--
-- Only service_role. anon and authenticated are the browser-facing roles, and
-- nothing in this application talks to Supabase from a browser.
--
-- Wrapped in a role check so these scripts also run against a plain PostgreSQL,
-- which is what CI applies them to and where service_role does not exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO service_role';
    EXECUTE 'GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role';
    EXECUTE 'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role';
  END IF;
END
$$;
