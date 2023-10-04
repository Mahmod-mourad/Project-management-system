-- Initialize production database with all required tables
-- Run this script after creating multi-tenant schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create RLS policies for tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (id IN (SELECT tenant_id FROM auth.users WHERE auth.uid() = id));

-- Create RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Create RLS policies for other tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies are isolated by tenant"
  ON companies FOR ALL
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are isolated by tenant"
  ON products FOR ALL
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales are isolated by tenant"
  ON sales FOR ALL
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Invoices are isolated by tenant"
  ON invoices FOR ALL
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees are isolated by tenant"
  ON employees FOR ALL
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Create indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_sales_tenant_id ON sales(tenant_id);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);

-- Initialize subscription plans
INSERT INTO subscription_plans (name, description, price, features, max_users, max_storage_gb, status) VALUES
  ('Starter', 'الخطة الأساسية للشركات الناشئة', 99, '["users_management", "basic_reports", "support_email"]', 5, 10, 'active'),
  ('Professional', 'الخطة الاحترافية للشركات المتوسطة', 299, '["users_management", "advanced_reports", "api_access", "priority_support"]', 50, 100, 'active'),
  ('Enterprise', 'الخطة المؤسسية للشركات الكبيرة', 999, '["unlimited_users", "custom_reports", "api_access", "priority_support", "dedicated_account_manager"]', NULL, NULL, 'active')
ON CONFLICT (name) DO NOTHING;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_tenant_id (tenant_id),
  INDEX idx_audit_user_id (user_id),
  INDEX idx_audit_created_at (created_at)
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their tenant"
  ON audit_logs FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_tenant_id (tenant_id)
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to updated_at columns
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
