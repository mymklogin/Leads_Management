BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rcspromotionalcredits NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bulksmspromotionalcredits NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapppromotionalcredits NUMERIC(18,2) NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS rcstransactionlogs (
    id SERIAL PRIMARY KEY, transactioncode VARCHAR(50) NOT NULL UNIQUE,
    createdat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userid INT NOT NULL, username VARCHAR(100) NOT NULL,
    performedbyuserid INT NULL, performedbyusername VARCHAR(100) NULL,
    servicetype VARCHAR(50) NOT NULL, actiontype VARCHAR(50) NOT NULL,
    credits NUMERIC(18,2) NOT NULL, pricepercredit NUMERIC(18,4) NOT NULL,
    totalamount NUMERIC(18,2) NOT NULL, notes VARCHAR(500), balanceafter NUMERIC(18,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_rcstransactionlogs_userid ON rcstransactionlogs(userid);
CREATE INDEX IF NOT EXISTS ix_rcstransactionlogs_createdat ON rcstransactionlogs(createdat DESC);
COMMIT;
