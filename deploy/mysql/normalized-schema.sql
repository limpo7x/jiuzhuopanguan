-- Normalized schema draft for jiuzhuopanguan.
-- Keep app_store during migration; move high-frequency business data here first.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  phone VARCHAR(32) NULL,
  wechat_open_id VARCHAR(128) NULL,
  wechat_union_id VARCHAR(128) NULL,
  name VARCHAR(128) NOT NULL DEFAULT '',
  avatar_url VARCHAR(512) NOT NULL DEFAULT '',
  identity_tag VARCHAR(128) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_phone (phone),
  UNIQUE KEY uk_users_wechat_open_id (wechat_open_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wine_sessions (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  invite_code VARCHAR(32) NOT NULL,
  host_profile_id VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL DEFAULT '',
  template VARCHAR(128) NOT NULL DEFAULT '',
  player_count INT NOT NULL DEFAULT 2,
  state VARCHAR(64) NOT NULL DEFAULT '',
  status VARCHAR(64) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_wine_sessions_invite_code (invite_code),
  KEY idx_wine_sessions_host_profile_id (host_profile_id),
  KEY idx_wine_sessions_state (state)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wine_session_members (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  profile_id VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL DEFAULT '',
  avatar_url VARCHAR(512) NOT NULL DEFAULT '',
  is_host TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL DEFAULT '',
  debt_count INT NOT NULL DEFAULT 0,
  drink_count INT NOT NULL DEFAULT 0,
  cleared_count INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_session_member (session_id, profile_id),
  KEY idx_session_members_profile_id (profile_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wine_reports (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  title VARCHAR(128) NOT NULL DEFAULT '',
  scene VARCHAR(64) NOT NULL DEFAULT '',
  share_rate DECIMAL(6, 2) NOT NULL DEFAULT 0,
  replay_rate DECIMAL(6, 2) NOT NULL DEFAULT 0,
  payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_wine_reports_session_id (session_id),
  KEY idx_wine_reports_created_at (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS points_ledger (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(64) NOT NULL,
  delta INT NOT NULL DEFAULT 0,
  kind VARCHAR(64) NOT NULL DEFAULT '',
  source_id VARCHAR(128) NOT NULL DEFAULT '',
  title VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_points_ledger_profile_id_created_at (profile_id, created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS friendships (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  owner_id VARCHAR(64) NOT NULL,
  friend_id VARCHAR(64) NOT NULL,
  alias VARCHAR(128) NOT NULL DEFAULT '',
  meta VARCHAR(255) NOT NULL DEFAULT '',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_friendships_owner_friend (owner_id, friend_id),
  KEY idx_friendships_friend_id (friend_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(64) NOT NULL,
  profile_id VARCHAR(64) NOT NULL DEFAULT '',
  report_id VARCHAR(64) NOT NULL DEFAULT '',
  asset_id VARCHAR(64) NOT NULL DEFAULT '',
  meta_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_analytics_type_created_at (type, created_at),
  KEY idx_analytics_profile_created_at (profile_id, created_at),
  KEY idx_analytics_report_id (report_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
