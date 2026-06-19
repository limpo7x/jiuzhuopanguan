CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `wechat_open_id` VARCHAR(128) NULL,
  `wechat_union_id` VARCHAR(128) NULL,
  `phone` VARCHAR(32) NULL,
  `name` VARCHAR(128) NULL,
  `avatar_url` TEXT NULL,
  `signature` VARCHAR(255) NULL,
  `identity_tag` VARCHAR(64) NULL,
  `login_count` INT NOT NULL DEFAULT 0,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `uk_users_wechat_open_id` (`wechat_open_id`),
  KEY `idx_users_phone` (`phone`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_sessions` (
  `token_hash` CHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  KEY `idx_user_sessions_user_id` (`user_id`),
  KEY `idx_user_sessions_expires_at` (`expires_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_login_logs` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NULL,
  `wechat_open_id` VARCHAR(128) NULL,
  `phone` VARCHAR(32) NULL,
  `source` VARCHAR(64) NULL,
  `login_at` DATETIME NULL,
  KEY `idx_user_login_logs_user_id` (`user_id`),
  KEY `idx_user_login_logs_login_at` (`login_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `friendships` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `owner_id` VARCHAR(64) NOT NULL,
  `friend_id` VARCHAR(64) NOT NULL,
  `alias` VARCHAR(128) NULL,
  `meta_json` JSON NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `uk_friendships_owner_friend` (`owner_id`, `friend_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `poke_threads` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `sender_id` VARCHAR(64) NULL,
  `receiver_id` VARCHAR(64) NULL,
  `status` VARCHAR(32) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  KEY `idx_poke_threads_sender_receiver` (`sender_id`, `receiver_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wine_sessions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `invite_code` VARCHAR(32) NULL,
  `host_profile_id` VARCHAR(64) NULL,
  `name` VARCHAR(128) NULL,
  `template_id` VARCHAR(64) NULL,
  `template_name` VARCHAR(128) NULL,
  `player_count` INT NOT NULL DEFAULT 0,
  `state` VARCHAR(64) NULL,
  `status` VARCHAR(64) NULL,
  `source` VARCHAR(64) NULL,
  `started_at` DATETIME NULL,
  `ended_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `uk_wine_sessions_invite_code` (`invite_code`),
  KEY `idx_wine_sessions_host_created` (`host_profile_id`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wine_session_members` (
  `id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `profile_id` VARCHAR(64) NULL,
  `name` VARCHAR(128) NULL,
  `avatar_url` TEXT NULL,
  `phone` VARCHAR(32) NULL,
  `is_host` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(64) NULL,
  `debt_count` INT NOT NULL DEFAULT 0,
  `drink_count` INT NOT NULL DEFAULT 0,
  `cleared_count` INT NOT NULL DEFAULT 0,
  `meta_json` JSON NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  KEY `idx_wine_session_members_session_profile` (`session_id`, `profile_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wine_reports` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `session_id` VARCHAR(64) NULL,
  `profile_id` VARCHAR(64) NULL,
  `template_name` VARCHAR(128) NULL,
  `title` VARCHAR(255) NULL,
  `scene` VARCHAR(64) NULL,
  `highlight1` VARCHAR(255) NULL,
  `highlight2` VARCHAR(255) NULL,
  `highlight3` VARCHAR(255) NULL,
  `view_count` INT NOT NULL DEFAULT 0,
  `share_count` INT NOT NULL DEFAULT 0,
  `replay_count` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(64) NULL,
  `created_at` DATETIME NULL,
  KEY `idx_wine_reports_session_id` (`session_id`),
  KEY `idx_wine_reports_profile_created` (`profile_id`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `moment_records` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `client_draft_id` VARCHAR(128) NULL,
  `session_id` VARCHAR(64) NOT NULL,
  `uploader_profile_id` VARCHAR(64) NOT NULL,
  `uploader_name` VARCHAR(128) NULL,
  `uploader_avatar_url` TEXT NULL,
  `node_type` VARCHAR(32) NOT NULL,
  `media_type` VARCHAR(32) NOT NULL DEFAULT 'image',
  `image_url` TEXT NULL,
  `video_url` TEXT NULL,
  `cover_image_url` TEXT NULL,
  `duration` INT NOT NULL DEFAULT 0,
  `caption` TEXT NULL,
  `tags_json` JSON NULL,
  `visibility` VARCHAR(32) NOT NULL DEFAULT 'session',
  `visible_profile_ids_json` JSON NULL,
  `timeline_title` VARCHAR(255) NULL,
  `is_timeline_placeholder` TINYINT(1) NOT NULL DEFAULT 0,
  `usage_consent_json` JSON NULL,
  `completion_status` VARCHAR(32) NOT NULL DEFAULT 'draft',
  `review_status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `secondary_review_status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `ranking_eligible` TINYINT(1) NOT NULL DEFAULT 0,
  `reward_eligible` TINYINT(1) NOT NULL DEFAULT 0,
  `removed_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `uk_moment_records_session_uploader_draft` (`session_id`, `uploader_profile_id`, `client_draft_id`),
  KEY `idx_moment_records_session_created` (`session_id`, `created_at`),
  KEY `idx_moment_records_uploader_created` (`uploader_profile_id`, `created_at`),
  KEY `idx_moment_records_review` (`review_status`, `secondary_review_status`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `session_events` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `client_event_id` VARCHAR(128) NULL,
  `session_id` VARCHAR(64) NOT NULL,
  `event_type` VARCHAR(32) NOT NULL,
  `operator_profile_id` VARCHAR(64) NOT NULL,
  `operator_name` VARCHAR(128) NULL,
  `target_profile_id` VARCHAR(64) NULL,
  `target_name` VARCHAR(128) NULL,
  `score_delta` INT NOT NULL DEFAULT 0,
  `caption` TEXT NULL,
  `sync_status` VARCHAR(32) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `uk_session_events_session_operator_client` (`session_id`, `operator_profile_id`, `client_event_id`),
  KEY `idx_session_events_session_created` (`session_id`, `created_at`),
  KEY `idx_session_events_operator_created` (`operator_profile_id`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `session_briefs` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NULL,
  `cover_mode` VARCHAR(64) NULL,
  `opening_moment_ids_json` JSON NULL,
  `closing_moment_ids_json` JSON NULL,
  `timeline_node_ids_json` JSON NULL,
  `share_image_task_id` VARCHAR(64) NULL,
  `share_image_status` VARCHAR(32) NULL,
  `incomplete_moment_count` INT NOT NULL DEFAULT 0,
  `ranking_eligible` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `uk_session_briefs_session` (`session_id`),
  KEY `idx_session_briefs_created` (`created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `share_image_tasks` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `brief_id` VARCHAR(64) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `layout_mode` VARCHAR(64) NOT NULL DEFAULT 'timeline',
  `selected_node_ids_json` JSON NULL,
  `image_url` TEXT NULL,
  `failure_reason` TEXT NULL,
  `retry_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NULL,
  `started_at` DATETIME NULL,
  `finished_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  KEY `idx_share_image_tasks_brief_status` (`brief_id`, `status`),
  KEY `idx_share_image_tasks_session_created` (`session_id`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `moment_reports` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `moment_id` VARCHAR(64) NOT NULL,
  `session_id` VARCHAR(64) NULL,
  `reporter_profile_id` VARCHAR(64) NULL,
  `reason` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `handled_by` VARCHAR(64) NULL,
  `handled_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  KEY `idx_moment_reports_moment_status` (`moment_id`, `status`),
  KEY `idx_moment_reports_created` (`created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `moment_nominations` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `client_nomination_id` VARCHAR(128) NULL,
  `moment_id` VARCHAR(64) NOT NULL,
  `session_id` VARCHAR(64) NOT NULL,
  `profile_id` VARCHAR(64) NOT NULL,
  `profile_name` VARCHAR(128) NULL,
  `category` VARCHAR(64) NOT NULL,
  `points_spent` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(32) NOT NULL DEFAULT 'active',
  `refunded_at` DATETIME NULL,
  `refund_reason` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  KEY `idx_moment_nominations_category_created` (`category`, `created_at`),
  KEY `idx_moment_nominations_profile_created` (`profile_id`, `created_at`),
  KEY `idx_moment_nominations_moment` (`moment_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ranking_reward_rules` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `category` VARCHAR(64) NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `rank_start` INT NOT NULL DEFAULT 1,
  `rank_end` INT NOT NULL DEFAULT 1,
  `points` INT NOT NULL DEFAULT 0,
  `tiers_json` JSON NULL,
  `effective_at` DATETIME NULL,
  `reason` TEXT NULL,
  `updated_at` DATETIME NULL,
  KEY `idx_ranking_reward_rules_category_enabled` (`category`, `enabled`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ranking_reward_payouts` (
  `id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `source_id` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `moment_id` VARCHAR(64) NOT NULL,
  `session_id` VARCHAR(64) NULL,
  `profile_id` VARCHAR(64) NOT NULL,
  `profile_name` VARCHAR(128) NULL,
  `rank` INT NOT NULL DEFAULT 1,
  `points` INT NOT NULL DEFAULT 0,
  `rule_id` VARCHAR(64) NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'granted',
  `operator` VARCHAR(128) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `uk_ranking_reward_payouts_source` (`source_id`),
  KEY `idx_ranking_reward_payouts_category_date` (`category`, `date`),
  KEY `idx_ranking_reward_payouts_profile_created` (`profile_id`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `points_tasks` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title` VARCHAR(128) NULL,
  `value` INT NOT NULL DEFAULT 0,
  `icon_class` VARCHAR(128) NULL,
  `status` VARCHAR(32) NULL,
  `sort_order` INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `points_rewards` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title` VARCHAR(128) NULL,
  `subtitle` VARCHAR(255) NULL,
  `cost` INT NOT NULL DEFAULT 0,
  `icon_class` VARCHAR(128) NULL,
  `status` VARCHAR(32) NULL,
  `sort_order` INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_commerce_states` (
  `profile_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `points` INT NOT NULL DEFAULT 0,
  `membership_active` TINYINT(1) NOT NULL DEFAULT 0,
  `membership_plan_id` VARCHAR(64) NULL,
  `membership_expires_at` DATETIME NULL,
  `updated_at` DATETIME NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `points_ledger` (
  `id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `profile_id` VARCHAR(64) NOT NULL,
  `delta` INT NOT NULL DEFAULT 0,
  `kind` VARCHAR(64) NULL,
  `source_id` VARCHAR(128) NULL,
  `title` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  KEY `idx_points_ledger_profile_created` (`profile_id`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `points_task_claims` (
  `id` VARCHAR(160) NOT NULL PRIMARY KEY,
  `profile_id` VARCHAR(64) NOT NULL,
  `task_id` VARCHAR(64) NOT NULL,
  `source_id` VARCHAR(128) NULL,
  `claimed_at` DATETIME NULL,
  KEY `idx_points_task_claims_profile_task` (`profile_id`, `task_id`, `claimed_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reward_redemptions` (
  `id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `profile_id` VARCHAR(64) NOT NULL,
  `reward_id` VARCHAR(64) NULL,
  `title` VARCHAR(128) NULL,
  `cost` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `membership_orders` (
  `id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `profile_id` VARCHAR(64) NOT NULL,
  `plan_id` VARCHAR(64) NULL,
  `created_at` DATETIME NULL,
  `expires_at` DATETIME NULL,
  `status` VARCHAR(32) NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `template_filters` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(128) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(32) NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `templates` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `filter_id` VARCHAR(64) NULL,
  `title` VARCHAR(128) NULL,
  `meta` TEXT NULL,
  `cost` INT NOT NULL DEFAULT 0,
  `image_url` TEXT NULL,
  `status` VARCHAR(32) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  KEY `idx_templates_filter_sort` (`filter_id`, `sort_order`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `question_bank` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `content` TEXT NULL,
  `type` VARCHAR(64) NULL,
  `difficulty` VARCHAR(64) NULL,
  `template` VARCHAR(128) NULL,
  `risk_level` VARCHAR(64) NULL,
  `status` VARCHAR(64) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `share_assets` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(128) NULL,
  `asset_type` VARCHAR(64) NULL,
  `scene` VARCHAR(64) NULL,
  `image_url` TEXT NULL,
  `open_count` INT NOT NULL DEFAULT 0,
  `return_count` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(64) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tools_catalog` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(128) NULL,
  `category` VARCHAR(64) NULL,
  `target` VARCHAR(128) NULL,
  `image_url` TEXT NULL,
  `usage_count` INT NOT NULL DEFAULT 0,
  `favorite_count` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(64) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_hot` VARCHAR(16) NULL,
  `placement` VARCHAR(32) NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `membership_plans` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(128) NULL,
  `price` VARCHAR(64) NULL,
  `duration` VARCHAR(64) NULL,
  `conversion_rate` VARCHAR(64) NULL,
  `renew_rate` VARCHAR(64) NULL,
  `status` VARCHAR(64) NULL,
  `sort_order` INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `membership_benefits` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(128) NULL,
  `scope` VARCHAR(128) NULL,
  `status` VARCHAR(64) NULL,
  `note` TEXT NULL,
  `sort_order` INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `username` VARCHAR(64) NOT NULL,
  `password_hash` CHAR(64) NOT NULL,
  `name` VARCHAR(128) NULL,
  `role_id` VARCHAR(64) NULL,
  `status` VARCHAR(32) NULL,
  `last_login_at` DATETIME NULL,
  UNIQUE KEY `uk_admin_users_username` (`username`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(128) NULL,
  `scope` VARCHAR(128) NULL,
  `permissions_json` JSON NULL,
  `status` VARCHAR(32) NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `token_hash` CHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME NULL,
  `created_at` DATETIME NULL,
  KEY `idx_admin_sessions_user_id` (`user_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_operation_logs` (
  `id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `operator_id` VARCHAR(64) NULL,
  `action` VARCHAR(128) NULL,
  `target_type` VARCHAR(64) NULL,
  `target_id` VARCHAR(128) NULL,
  `detail` TEXT NULL,
  `created_at` DATETIME NULL,
  KEY `idx_admin_operation_logs_created_at` (`created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `type` VARCHAR(64) NULL,
  `profile_id` VARCHAR(64) NULL,
  `report_id` VARCHAR(64) NULL,
  `asset_id` VARCHAR(64) NULL,
  `tool_id` VARCHAR(64) NULL,
  `meta_json` JSON NULL,
  `created_at` DATETIME NULL,
  KEY `idx_analytics_events_type_profile_created` (`type`, `profile_id`, `created_at`),
  KEY `idx_analytics_events_report_created` (`report_id`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `assets` (
  `id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `category` VARCHAR(64) NULL,
  `file_name` VARCHAR(255) NULL,
  `url` TEXT NULL,
  `mime_type` VARCHAR(128) NULL,
  `size` INT NOT NULL DEFAULT 0,
  `source` VARCHAR(64) NULL,
  `created_at` DATETIME NULL,
  KEY `idx_assets_category_created` (`category`, `created_at`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
