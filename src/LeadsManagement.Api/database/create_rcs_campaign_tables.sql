-- ==============================================================================
-- RCS CAMPAIGNS & DELIVERY LOGS WITH OPERATOR & STATE TRACKING
-- ==============================================================================

CREATE TABLE IF NOT EXISTS rcs_campaigns (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id INT NOT NULL,                          -- OMNI Upstream Campaign ID (e.g., 8687)
    campaign_name VARCHAR(100) NOT NULL,
    bot_name VARCHAR(50) NOT NULL DEFAULT 'PBG INFO',
    template_name VARCHAR(100) NOT NULL DEFAULT 'pbg_account_status_u',
    service_type VARCHAR(20) NOT NULL DEFAULT 'RCS-T', -- 'RCS-T' (Transactional) or 'RCS-P' (Promotional)
    total_mobiles INT NOT NULL DEFAULT 1,
    mobile_number VARCHAR(20) NULL,                    -- Recipient Mobile (for single/quick send)
    operator VARCHAR(50) NULL,                         -- Telecom Company (e.g., Jio, Airtel, Vi, BSNL)
    circle VARCHAR(50) NULL,                           -- State / Telecom Circle (e.g., Delhi NCR, Maharashtra)
    delivered INT NOT NULL DEFAULT 0,
    read_count INT NOT NULL DEFAULT 0,
    failed INT NOT NULL DEFAULT 0,
    awaited INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Delivered',   -- 'Delivered', 'Read', 'Failed', 'Awaited'
    credits_deducted NUMERIC(10, 2) NOT NULL DEFAULT 1, -- Exact balance deducted
    reason VARCHAR(255) NULL,                          -- Carrier ACK / Failure description
    ip_address VARCHAR(50) NULL,                       -- Sender IP Address
    sent_via VARCHAR(20) NOT NULL DEFAULT 'Web Panel', -- 'Web Panel' or 'API'
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_rcs_campaigns_user_id ON rcs_campaigns(user_id);
CREATE INDEX IF NOT EXISTS ix_rcs_campaigns_campaign_id ON rcs_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS ix_rcs_campaigns_mobile_number ON rcs_campaigns(mobile_number);
CREATE INDEX IF NOT EXISTS ix_rcs_campaigns_operator ON rcs_campaigns(operator);
CREATE INDEX IF NOT EXISTS ix_rcs_campaigns_circle ON rcs_campaigns(circle);
CREATE INDEX IF NOT EXISTS ix_rcs_campaigns_created_at ON rcs_campaigns(created_at DESC);

CREATE TABLE IF NOT EXISTS rcs_delivery_logs (
    id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL,                          -- OMNI Campaign ID
    mobile_number VARCHAR(20) NOT NULL,
    operator VARCHAR(50) NULL,                         -- Telecom Company (Jio, Airtel, Vi, BSNL)
    circle VARCHAR(50) NULL,                           -- State / Telecom Circle (Delhi, Maharashtra, UP, etc.)
    status VARCHAR(20) NOT NULL DEFAULT 'DELIVERED',   -- 'DELIVERED', 'READ', 'FAILED', 'AWAITED'
    delivered_at TIMESTAMPTZ NULL,
    reason VARCHAR(255) NULL,
    ip_address VARCHAR(50) NULL
);

CREATE INDEX IF NOT EXISTS ix_rcs_delivery_logs_campaign_id ON rcs_delivery_logs(campaign_id);
CREATE INDEX IF NOT EXISTS ix_rcs_delivery_logs_mobile_number ON rcs_delivery_logs(mobile_number);
