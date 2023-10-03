-- Initialize subscription plans if they don't exist
INSERT INTO subscription_plans (name, description, price, features, max_users, max_storage_gb) VALUES
('Starter', 'الخطة الأساسية للشركات الناشئة', 99, '["users_management", "basic_reports", "support_email"]', 5, 10),
('Professional', 'الخطة الاحترافية للشركات المتوسطة', 299, '["users_management", "advanced_reports", "api_access", "priority_support"]', 50, 100),
('Enterprise', 'الخطة المؤسسية للشركات الكبيرة', 999, '["unlimited_users", "custom_reports", "api_access", "priority_support", "dedicated_account_manager"]', NULL, NULL)
ON CONFLICT (name) DO NOTHING;
