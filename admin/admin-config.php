<?php

declare(strict_types=1);

return [
    'admin_title' => 'Content Admin',
    'data_file' => dirname(__DIR__) . '/data/data.json',
    'template_file' => dirname(__DIR__) . '/data/data.admin-template.json',
    'session_name' => 'portfolio_admin',
    'session_key' => 'portfolio_admin_authenticated',
    'csrf_key' => 'portfolio_admin_csrf',
    'password_hash' => '$2y$10$bEuymoplvdrXJLn.upjYTOlRa.dxEuEyrZpI1yKKxF3RNYWBSPlfG',
    'default_password_notice' => 'change-me-admin-password',
];
