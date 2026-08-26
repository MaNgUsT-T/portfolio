<?php

declare(strict_types=1);

return [
    'admin_title' => 'Content Admin',
    'data_file' => dirname(__DIR__) . '/data/data.json',
    'template_file' => dirname(__DIR__) . '/data/data.admin-template.json',
    'session_name' => 'portfolio_admin',
    'session_key' => 'portfolio_admin_authenticated',
    'csrf_key' => 'portfolio_admin_csrf',
	'password_hash' => '$2a$12$e8ms7/.t0fEfnIqqYN6yRuCmkeJCn4jw1/648t1fw4jUc17x7kB5m',
    'default_password_notice' => 'change-me-admin-password',
];
