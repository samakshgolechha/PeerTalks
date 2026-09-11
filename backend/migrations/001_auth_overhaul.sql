-- ============================================================
-- Migration 001: Auth Overhaul
-- Adds email, phone, password_hash, auth_provider, provider_id,
-- email_verified, failed_login_attempts, account_locked_until,
-- and last_seen columns to the USERS table.
--
-- This migration is NON-DESTRUCTIVE: it only adds new columns.
-- Existing users with plaintext passwords will continue to work
-- via backward-compatible login logic in server.js.
--
-- Run with: mysql -u root -p PeerTalks < backend/migrations/001_auth_overhaul.sql
-- ============================================================

USE PeerTalks;

-- Add email column (unique, nullable for legacy users)
ALTER TABLE USERS ADD COLUMN email VARCHAR(255) UNIQUE DEFAULT NULL AFTER password;

-- Add phone column
ALTER TABLE USERS ADD COLUMN phone VARCHAR(30) DEFAULT NULL AFTER email;

-- Add bcrypt password hash column (new registrations use this)
ALTER TABLE USERS ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL AFTER phone;

-- Auth provider for OAuth support (Phase 6)
ALTER TABLE USERS ADD COLUMN auth_provider ENUM('local','google','github') DEFAULT 'local' AFTER password_hash;

-- Provider-specific user ID for OAuth
ALTER TABLE USERS ADD COLUMN provider_id VARCHAR(255) DEFAULT NULL AFTER auth_provider;

-- Email verification flag
ALTER TABLE USERS ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER provider_id;

-- Failed login attempts counter (for account locking in Phase 5)
ALTER TABLE USERS ADD COLUMN failed_login_attempts INT DEFAULT 0 AFTER email_verified;

-- Account lockout timestamp (NULL = not locked)
ALTER TABLE USERS ADD COLUMN account_locked_until DATETIME DEFAULT NULL AFTER failed_login_attempts;

-- Last seen timestamp (may already exist via ALTER; use IF NOT EXISTS logic)
-- MySQL doesn't support IF NOT EXISTS for columns, so we use a procedure:
DROP PROCEDURE IF EXISTS add_last_seen_if_missing;
DELIMITER //
CREATE PROCEDURE add_last_seen_if_missing()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'PeerTalks'
          AND TABLE_NAME = 'USERS'
          AND COLUMN_NAME = 'last_seen'
    ) THEN
        ALTER TABLE USERS ADD COLUMN last_seen DATETIME DEFAULT NULL AFTER account_locked_until;
    END IF;
END //
DELIMITER ;
CALL add_last_seen_if_missing();
DROP PROCEDURE IF EXISTS add_last_seen_if_missing;
