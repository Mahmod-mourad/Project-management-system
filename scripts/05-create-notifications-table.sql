-- Create notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_tenant_user_isolation" ON notifications
  FOR ALL USING (
    tenant_id::text = current_setting('app.current_tenant', true) AND
    user_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX idx_notifications_tenant_user ON notifications(tenant_id, user_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Function to automatically notify on task assignment
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if assignee_id is being set or changed
  IF (TG_OP = 'INSERT' AND NEW.assignee_id IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND OLD.assignee_id IS DISTINCT FROM NEW.assignee_id AND NEW.assignee_id IS NOT NULL) THEN
    
    INSERT INTO notifications (tenant_id, user_id, title, message, type, data)
    VALUES (
      NEW.tenant_id,
      NEW.assignee_id,
      'مهمة جديدة',
      'تم تعيين مهمة "' || NEW.title || '" لك',
      'info',
      jsonb_build_object('type', 'task_assigned', 'task_id', NEW.id, 'task_title', NEW.title)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task assignment notifications
DROP TRIGGER IF EXISTS trigger_notify_task_assignment ON tasks;
CREATE TRIGGER trigger_notify_task_assignment
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assignment();

-- Function to notify on project updates
CREATE OR REPLACE FUNCTION notify_project_update()
RETURNS TRIGGER AS $$
DECLARE
  member_record RECORD;
BEGIN
  -- Notify all project members on status change
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    FOR member_record IN 
      SELECT pm.user_id 
      FROM project_members pm 
      WHERE pm.project_id = NEW.id
    LOOP
      INSERT INTO notifications (tenant_id, user_id, title, message, type, data)
      VALUES (
        NEW.tenant_id,
        member_record.user_id,
        'تحديث المشروع',
        'تم تغيير حالة مشروع "' || NEW.name || '" إلى ' || NEW.status,
        'info',
        jsonb_build_object('type', 'project_update', 'project_id', NEW.id, 'project_name', NEW.name, 'new_status', NEW.status)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project update notifications
DROP TRIGGER IF EXISTS trigger_notify_project_update ON projects;
CREATE TRIGGER trigger_notify_project_update
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_project_update();
