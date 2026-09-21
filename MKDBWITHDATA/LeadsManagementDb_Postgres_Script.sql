-- ==============================================================================
-- LEADS MANAGEMENT & MULTI-SERVICE PLATFORM DATABASE SCRIPT (POSTGRESQL)
-- PostgreSQL 14+ Compatible (Case-Insensitive Unquoted Identifiers)
-- Generated without Entity Framework Core
-- ==============================================================================

-- DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER
DROP TABLE IF EXISTS rcstransactionlogs CASCADE;
DROP TABLE IF EXISTS webhooklogs CASCADE;
DROP TABLE IF EXISTS leadrecords CASCADE;
DROP TABLE IF EXISTS campaignrecords CASCADE;
DROP TABLE IF EXISTS usermenupermissions CASCADE;
DROP TABLE IF EXISTS appmenus CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Also drop quoted tables if existed previously
DROP TABLE IF EXISTS "RcsTransactionLogs" CASCADE;
DROP TABLE IF EXISTS "WebhookLogs" CASCADE;
DROP TABLE IF EXISTS "LeadRecords" CASCADE;
DROP TABLE IF EXISTS "CampaignRecords" CASCADE;
DROP TABLE IF EXISTS "UserMenuPermissions" CASCADE;
DROP TABLE IF EXISTS "AppMenus" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- ==============================================================================
-- 1. TABLES CREATION
-- ==============================================================================

-- 1.1 USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    passwordhash VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    phonenumber VARCHAR(20) NOT NULL,
    role INT NOT NULL, -- 1=SuperAdmin, 2=Admin, 3=Reseller, 4=User
    parentuserid INT NULL REFERENCES users(id),
    voicecredits NUMERIC(18,2) NOT NULL DEFAULT 0,
    whatsappcredits NUMERIC(18,2) NOT NULL DEFAULT 0,
    rcscredits NUMERIC(18,2) NOT NULL DEFAULT 0,
    smscredits NUMERIC(18,2) NOT NULL DEFAULT 0,
    isactive BOOLEAN NOT NULL DEFAULT TRUE,
    createdat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastloginat TIMESTAMPTZ NULL
);

CREATE INDEX ix_users_role ON users(role);
CREATE INDEX ix_users_parentuserid ON users(parentuserid);

-- 1.2 APPMENUS TABLE
CREATE TABLE appmenus (
    id SERIAL PRIMARY KEY,
    servicecode VARCHAR(50) NOT NULL,
    menukey VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    routepath VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NULL,
    parentmenuid INT NULL REFERENCES appmenus(id),
    sortorder INT NOT NULL DEFAULT 0,
    isactive BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX ix_appmenus_servicecode ON appmenus(servicecode);
CREATE INDEX ix_appmenus_parentmenuid ON appmenus(parentmenuid);

-- 1.3 USERMENUPERMISSIONS TABLE
CREATE TABLE usermenupermissions (
    id SERIAL PRIMARY KEY,
    userid INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menuid INT NOT NULL REFERENCES appmenus(id) ON DELETE CASCADE,
    canview BOOLEAN NOT NULL DEFAULT TRUE,
    cancreate BOOLEAN NOT NULL DEFAULT FALSE,
    canedit BOOLEAN NOT NULL DEFAULT FALSE,
    candelete BOOLEAN NOT NULL DEFAULT FALSE,
    canexport BOOLEAN NOT NULL DEFAULT FALSE,
    assignedbyuserid INT NULL REFERENCES users(id),
    assignedat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usermenupermissions_user_menu UNIQUE (userid, menuid)
);

CREATE INDEX ix_usermenupermissions_userid ON usermenupermissions(userid);
CREATE INDEX ix_usermenupermissions_menuid ON usermenupermissions(menuid);

-- 1.4 CAMPAIGNRECORDS TABLE
CREATE TABLE campaignrecords (
    id SERIAL PRIMARY KEY,
    campaignname VARCHAR(100) NOT NULL,
    templateid INT NOT NULL DEFAULT 0,
    targetmobile VARCHAR(20) NOT NULL,
    cli VARCHAR(20) NULL,
    userid INT NULL REFERENCES users(id),
    requestpayload TEXT NULL,
    apiresponse TEXT NULL,
    dispatchstatus VARCHAR(50) NOT NULL DEFAULT 'Pending',
    dispatchedat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_campaignrecords_targetmobile ON campaignrecords(targetmobile);
CREATE INDEX ix_campaignrecords_dispatchedat ON campaignrecords(dispatchedat);

-- 1.5 LEADRECORDS TABLE
CREATE TABLE leadrecords (
    id SERIAL PRIMARY KEY,
    mobile VARCHAR(20) NOT NULL,
    customername VARCHAR(100) NULL,
    templateid INT NULL DEFAULT 0,
    leadstatus VARCHAR(200) NOT NULL DEFAULT 'New',
    callduration INT NOT NULL DEFAULT 0,
    presseddtmf VARCHAR(50) NULL,
    lasteventtype VARCHAR(50) NULL,
    userid INT NULL REFERENCES users(id),
    assignedtouserid INT NULL REFERENCES users(id),
    cli VARCHAR(20) NULL,
    notes VARCHAR(1000) NULL,
    customdata VARCHAR(500) NULL,
    createdat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_leadrecords_mobile ON leadrecords(mobile);
CREATE INDEX ix_leadrecords_leadstatus ON leadrecords(leadstatus);
CREATE INDEX ix_leadrecords_templateid ON leadrecords(templateid);
CREATE INDEX ix_leadrecords_updatedat ON leadrecords(updatedat);

-- 1.6 WEBHOOKLOGS TABLE
CREATE TABLE webhooklogs (
    id SERIAL PRIMARY KEY,
    mobile VARCHAR(20) NULL,
    templateid INT NULL,
    eventtype VARCHAR(50) NULL,
    pressedkey VARCHAR(50) NULL,
    duration INT NOT NULL DEFAULT 0,
    computedleadstatus VARCHAR(200) NULL,
    rawpayload TEXT NULL,
    receivedat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issuccess BOOLEAN NOT NULL DEFAULT TRUE,
    errormessage VARCHAR(500) NULL
);

CREATE INDEX ix_webhooklogs_mobile ON webhooklogs(mobile);
CREATE INDEX ix_webhooklogs_receivedat ON webhooklogs(receivedat);
CREATE INDEX ix_webhooklogs_templateid ON webhooklogs(templateid);

-- 1.7 RCSTRANSACTIONLOGS TABLE
CREATE TABLE rcstransactionlogs (
    id SERIAL PRIMARY KEY,
    transactioncode VARCHAR(50) NOT NULL,
    createdat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userid INT NOT NULL REFERENCES users(id),
    username VARCHAR(100) NOT NULL,
    performedbyuserid INT NULL,
    performedbyusername VARCHAR(100) NULL,
    servicetype VARCHAR(20) NOT NULL DEFAULT 'RCS',
    actiontype VARCHAR(50) NOT NULL DEFAULT 'Credit',
    credits NUMERIC(18,2) NOT NULL DEFAULT 0,
    pricepercredit NUMERIC(18,4) NOT NULL DEFAULT 0,
    totalamount NUMERIC(18,2) NOT NULL DEFAULT 0,
    notes VARCHAR(500) NULL,
    balanceafter NUMERIC(18,2) NOT NULL DEFAULT 0
);

CREATE INDEX ix_rcstransactionlogs_userid ON rcstransactionlogs(userid);

-- ==============================================================================
-- 2. SEED DATA
-- ==============================================================================

-- 2.1 SUPERADMIN USER
INSERT INTO users (
    username, email, passwordhash, fullname, phonenumber,
    role, parentuserid, voicecredits, whatsappcredits,
    rcscredits, smscredits, isactive, createdat, updatedat
)
VALUES (
    'Abhishaarod', 'Abhishaarod@rcsflow.io',
    '1vamnhZezWXosmOFtnAsFQ==:QoE4vlU2sxwsWP/JDcCyCHjlnfyqz5bjWKT0+x/IFH0=',
    'Abhishaarod', '9999900000',
    1, NULL, 100000, 100000, 100000, 100000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- 2.2 ROOT MENUS
INSERT INTO appmenus (servicecode, menukey, title, routepath, icon, parentmenuid, sortorder, isactive)
VALUES 
    ('DASHBOARD', 'DASHBOARD', 'Dashboard', '/dashboard', 'fa-tachometer-alt', NULL, 1, TRUE),
    ('VOICE', 'VOICE_OBD', 'Voice OBD Calls', '/voice', 'fa-phone-volume', NULL, 2, TRUE),
    ('WHATSAPP', 'WHATSAPP', 'WhatsApp Messaging', '/whatsapp', 'fab fa-whatsapp', NULL, 3, TRUE),
    ('RCS', 'RCS_MESSAGING', 'RCS Messaging', '/rcs', 'fa-comment-alt', NULL, 4, TRUE),
    ('SMS', 'SMS_GATEWAY', 'SMS Gateway', '/sms', 'fa-sms', NULL, 5, TRUE),
    ('LEADS_CRM', 'LEADS_CRM', 'Leads CRM', '/leads', 'fa-users-cog', NULL, 6, TRUE),
    ('USER_MANAGEMENT', 'USER_MANAGEMENT', 'Users & Resellers', '/users', 'fa-user-friends', NULL, 7, TRUE),
    ('REPORTS', 'REPORTS', 'Reports & Analytics', '/analytics', 'fa-chart-pie', NULL, 8, TRUE)
ON CONFLICT (menukey) DO UPDATE SET 
    title = EXCLUDED.title,
    routepath = EXCLUDED.routepath,
    icon = EXCLUDED.icon,
    sortorder = EXCLUDED.sortorder,
    isactive = EXCLUDED.isactive;

-- 2.3 SUBMENUS
DO $$
DECLARE
    v_voice_id INT;
    v_rcs_id INT;
    v_wa_id INT;
    v_sms_id INT;
    v_crm_id INT;
    v_user_id INT;
    v_rep_id INT;
BEGIN
    SELECT id INTO v_voice_id FROM appmenus WHERE menukey = 'VOICE_OBD';
    SELECT id INTO v_rcs_id FROM appmenus WHERE menukey = 'RCS_MESSAGING';
    SELECT id INTO v_wa_id FROM appmenus WHERE menukey = 'WHATSAPP';
    SELECT id INTO v_sms_id FROM appmenus WHERE menukey = 'SMS_GATEWAY';
    SELECT id INTO v_crm_id FROM appmenus WHERE menukey = 'LEADS_CRM';
    SELECT id INTO v_user_id FROM appmenus WHERE menukey = 'USER_MANAGEMENT';
    SELECT id INTO v_rep_id FROM appmenus WHERE menukey = 'REPORTS';

    INSERT INTO appmenus (servicecode, menukey, title, routepath, icon, parentmenuid, sortorder, isactive)
    VALUES
        -- Voice Submenus
        ('VOICE', 'VOICE_SINGLE_CALL', 'Single OBD Call Reports', '/voice/single-call', 'fa-phone', v_voice_id, 1, TRUE),
        ('VOICE', 'VOICE_BULK_OBD', 'Bulk OBD Call Reports', '/voice/bulk-call', 'fa-broadcast-tower', v_voice_id, 2, TRUE),
        ('VOICE', 'VOICE_T0_REPORT', 'Template 0: Simple Campaign Reports', '/voice/template-0', 'fa-file-alt', v_voice_id, 3, TRUE),
        ('VOICE', 'VOICE_T1_REPORT', 'Template 1: DTMF Campaign Reports', '/voice/template-1', 'fa-keyboard', v_voice_id, 4, TRUE),
        ('VOICE', 'VOICE_T2_REPORT', 'Template 2: Call Patch Reports', '/voice/template-2', 'fa-headset', v_voice_id, 5, TRUE),
        ('VOICE', 'VOICE_T3_REPORT', 'Template 3: Custom IVR Reports', '/voice/template-3', 'fa-sitemap', v_voice_id, 6, TRUE),
        ('VOICE', 'VOICE_T4_REPORT', 'Template 4: Nextar Multi-Level IVR Reports', '/voice/template-4', 'fa-layer-group', v_voice_id, 7, TRUE),
        ('VOICE', 'VOICE_T5_REPORT', 'Template 5: OTP Verification Reports', '/voice/template-5', 'fa-key', v_voice_id, 8, TRUE),
        ('VOICE', 'VOICE_T7_REPORT', 'Template 7: TTS Simple IVR Reports', '/voice/template-7', 'fa-robot', v_voice_id, 9, TRUE),
        ('VOICE', 'VOICE_T8_REPORT', 'Template 8: TTS DTMF Campaign Reports', '/voice/template-8', 'fa-microphone', v_voice_id, 10, TRUE),
        ('VOICE', 'VOICE_T9_REPORT', 'Template 9: TTS Call Patch Reports', '/voice/template-9', 'fa-user-astronaut', v_voice_id, 11, TRUE),
        ('VOICE', 'VOICE_CALL_LOGS', 'Voice Call Logs (Audit Feed)', '/voice/logs', 'fa-history', v_voice_id, 12, TRUE),

        -- RCS Submenus
        ('RCS', 'RCS_DASHBOARD', 'RCS Overview & Balance Ledger', '/rcs/dashboard', 'fa-wallet', v_rcs_id, 1, TRUE),
        ('RCS', 'RCS_CAMPAIGNS', 'RCS Campaigns', '/rcs/campaigns', 'fa-bullhorn', v_rcs_id, 2, TRUE),
        ('RCS', 'RCS_TEMPLATES', 'Manage Templates', '/rcs/templates', 'fa-layer-group', v_rcs_id, 3, TRUE),
        ('RCS', 'RCS_BOTS', 'RCS Bots', '/rcs/bots', 'Bot', v_rcs_id, 4, TRUE),
        ('RCS', 'RCS_REPORTS', 'RCS Delivery Reports', '/rcs/reports', 'fa-chart-line', v_rcs_id, 5, TRUE),
        ('RCS', 'RCS_DLR_DOWNLOAD', 'DLR Export & Downloads', '/rcs/dlr-export', 'Download', v_rcs_id, 6, TRUE),

        -- WhatsApp Submenus
        ('WHATSAPP', 'WHATSAPP_BROADCAST', 'WhatsApp Broadcast', '/whatsapp/broadcast', 'fa-paper-plane', v_wa_id, 1, TRUE),
        ('WHATSAPP', 'WHATSAPP_TEMPLATES', 'Message Templates', '/whatsapp/templates', 'fa-file-alt', v_wa_id, 2, TRUE),
        ('WHATSAPP', 'WHATSAPP_REPORTS', 'WhatsApp Reports', '/whatsapp/reports', 'fa-chart-line', v_wa_id, 3, TRUE),

        -- SMS Submenus
        ('SMS', 'SMS_QUICK_SEND', 'Quick SMS', '/sms/send', 'fa-envelope', v_sms_id, 1, TRUE),
        ('SMS', 'SMS_BULK_SEND', 'Bulk SMS Campaign', '/sms/bulk', 'fa-mail-bulk', v_sms_id, 2, TRUE),
        ('SMS', 'SMS_DLT_TEMPLATES', 'DLT Templates', '/sms/templates', 'fa-stamp', v_sms_id, 3, TRUE),

        -- Leads CRM Submenus
        ('LEADS_CRM', 'LEADS_ALL', 'All Leads', '/leads/all', 'fa-list', v_crm_id, 1, TRUE),
        ('LEADS_CRM', 'LEADS_HOT', 'Super Hot Leads', '/leads/hot', 'fa-fire', v_crm_id, 2, TRUE),
        ('LEADS_CRM', 'LEADS_EXPORT', 'Export Leads (CSV)', '/leads/export', 'fa-file-excel', v_crm_id, 3, TRUE),

        -- User Management Submenus
        ('USER_MANAGEMENT', 'USERS_LIST', 'Subordinates List', '/users/list', 'fa-users', v_user_id, 1, TRUE),
        ('USER_MANAGEMENT', 'USERS_CREATE', 'Create User / Reseller', '/users/create', 'fa-user-plus', v_user_id, 2, TRUE),
        ('USER_MANAGEMENT', 'MENUS_MANAGE', 'Dynamic Menu Management', '/users/menu-management', 'fa-bars', v_user_id, 3, TRUE),

        -- Reports Submenus
        ('REPORTS', 'REPORTS_OVERVIEW', 'Campaign Overview', '/analytics/overview', 'fa-chart-bar', v_rep_id, 1, TRUE),
        ('REPORTS', 'REPORTS_WEBHOOK_LOGS', 'Live Webhook Logs', '/analytics/webhook-logs', 'fa-stream', v_rep_id, 2, TRUE)
    ON CONFLICT (menukey) DO UPDATE SET 
        title = EXCLUDED.title,
        routepath = EXCLUDED.routepath,
        icon = EXCLUDED.icon,
        parentmenuid = EXCLUDED.parentmenuid,
        sortorder = EXCLUDED.sortorder,
        isactive = EXCLUDED.isactive;
END $$;

-- 2.4 SUPERADMIN PERMISSIONS (Full Access)
INSERT INTO usermenupermissions (userid, menuid, canview, cancreate, canedit, candelete, canexport, assignedbyuserid, assignedat)
SELECT 
    u.id, 
    m.id, 
    TRUE, TRUE, TRUE, TRUE, TRUE, 
    u.id, 
    CURRENT_TIMESTAMP
FROM users u
CROSS JOIN appmenus m
WHERE u.username = 'Abhishaarod'
ON CONFLICT (userid, menuid) DO UPDATE SET 
    canview = TRUE,
    cancreate = TRUE,
    canedit = TRUE,
    candelete = TRUE,
    canexport = TRUE;

-- ==============================================================================
-- 3. RCS BOTS & TEMPLATES TABLES AND SEEDS
-- ==============================================================================

-- 3.1 RCS BOTS TABLE
CREATE TABLE IF NOT EXISTS rcs_bots (
    id SERIAL PRIMARY KEY,
    bot_id VARCHAR(100) UNIQUE NOT NULL,
    bot_name VARCHAR(200) NOT NULL,
    message_type VARCHAR(50) DEFAULT 'Transactional',
    brand_name VARCHAR(200),
    logo_url TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Verified',
    webhook_url TEXT,
    color VARCHAR(20) DEFAULT '#0a66c2',
    contact_phone VARCHAR(50),
    contact_email VARCHAR(150),
    website_url TEXT,
    terms_url TEXT,
    privacy_url TEXT,
    contact_person VARCHAR(150),
    contact_designation VARCHAR(150),
    dlt_entity_id VARCHAR(100),
    gst_url TEXT,
    pan_url TEXT,
    banner_url TEXT,
    user_id INT DEFAULT 1,
    created_date VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_rcs_bots_bot_id ON rcs_bots(bot_id);
CREATE INDEX IF NOT EXISTS ix_rcs_bots_status ON rcs_bots(status);

-- 3.2 RCS TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS rcs_templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(100) UNIQUE NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    template_type VARCHAR(50) DEFAULT 'PlainText',
    bot_id VARCHAR(100) NOT NULL,
    bot_name VARCHAR(200),
    vendor_template_id VARCHAR(100),
    template_status VARCHAR(50) DEFAULT 'Active',
    entity_id VARCHAR(100),
    sender_id VARCHAR(50),
    sms_template_id VARCHAR(100),
    sms_text TEXT,
    card_title VARCHAR(250),
    card_description TEXT,
    media_url TEXT,
    button_label VARCHAR(100),
    button_url TEXT,
    buttons_json TEXT,
    cards_json TEXT,
    user_id INT DEFAULT 1,
    created_date VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_rcs_templates_template_id ON rcs_templates(template_id);
CREATE INDEX IF NOT EXISTS ix_rcs_templates_bot_id ON rcs_templates(bot_id);
CREATE INDEX IF NOT EXISTS ix_rcs_templates_status ON rcs_templates(template_status);

-- 3.3 SEED RCS BOTS
INSERT INTO rcs_bots (
    bot_id, bot_name, message_type, brand_name, description, status,
    color, contact_phone, contact_email, website_url, dlt_entity_id, user_id, created_date
)
VALUES (
    '3c4fa9a066274cd2', 'PBG INFO', 'Transactional', 'PBG INFO TECH PVT LTD',
    'Official Google-Verified Brand Bot for PBG Account Updates & Service Alerts', 'Verified',
    '#0a66c2', '+919868040206', 'support@rcsflow.io', 'https://rcsflow.io', '1201161304403738311', 1, '2026-09-18 10:00'
)
ON CONFLICT (bot_id) DO UPDATE SET 
    bot_name = EXCLUDED.bot_name,
    status = EXCLUDED.status,
    dlt_entity_id = EXCLUDED.dlt_entity_id;

-- 3.4 SEED APPROVED RCS TEMPLATES
INSERT INTO rcs_templates (
    template_id, template_name, template_type, bot_id, bot_name, vendor_template_id,
    template_status, entity_id, sender_id, sms_template_id, sms_text,
    card_title, card_description, media_url, button_label, buttons_json, user_id, created_date
)
VALUES 
(
    'YCSLPB_vg', 'pbg_account_status_u', 'PlainText', '3c4fa9a066274cd2', 'PBG INFO', 'YCSLPB_vg',
    'Active', '1201161304403738311', 'PBGACC', '1207161545678901235',
    'Dear User, your PBG account status has been updated. Please log in to your dashboard to review your current details.',
    'PBG Account Status Update',
    'Dear Customer, your PBG account status has been updated. Please log in to your portal to check your statements.',
    NULL, 'Check Status',
    '[{"type":"OpenUrl","title":"Check Status","url":"https://pbginfo.in/status"},{"type":"Dial","title":"Support Call","phoneNumber":"+919868040206"}]',
    1, '2026-09-18 10:00'
),
(
    'pbg_promo_card_01', 'PBG_Special_Offer_Card', 'RichCard', '3c4fa9a066274cd2', 'PBG INFO', 'pbg_promo_card_01',
    'Active', '1201161304403738311', 'PBGACC', '1207161545678901236',
    'Exclusive 50% cashback on all recharges this week. Claim now at https://pbginfo.in/offer',
    'Exclusive 50% Cashback on All Services!',
    'Recharge your account today and enjoy instant high-priority routing and 50% bonus credits.',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    'Claim Offer',
    '[{"type":"OpenUrl","title":"Claim Offer","url":"https://pbginfo.in/offer"},{"type":"Reply","title":"Interested","postbackData":"OPT_IN_OFFER"}]',
    1, '2026-09-18 10:00'
),
(
    'pbg_otp_alert_02', 'PBG_OTP_Verification_Alert', 'PlainText', '3c4fa9a066274cd2', 'PBG INFO', 'pbg_otp_alert_02',
    'Active', '1201161304403738311', 'PBGACC', '1207161545678901237',
    'Your PBG verification OTP is {#var#}. Valid for 10 minutes. Do not share with anyone.',
    'PBG OTP Security Alert',
    'Your PBG Verification OTP is {#var#}. Valid for 10 minutes. Do not share with anyone.',
    NULL, 'Copy OTP',
    '[{"type":"Reply","title":"Copy OTP","postbackData":"COPY_OTP"}]',
    1, '2026-09-18 10:00'
)
ON CONFLICT (template_id) DO UPDATE SET 
    template_name = EXCLUDED.template_name,
    template_type = EXCLUDED.template_type,
    template_status = EXCLUDED.template_status,
    card_title = EXCLUDED.card_title,
    card_description = EXCLUDED.card_description,
    buttons_json = EXCLUDED.buttons_json;

