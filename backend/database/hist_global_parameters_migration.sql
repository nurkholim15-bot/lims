-- Migration script to add audit fields to global_parameters and create hist_global_parameters table

-- 1. Add audit fields to global_parameters
ALTER TABLE global_parameters
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN created_user VARCHAR(30),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN updated_user VARCHAR(30),
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deleted_user VARCHAR(30);

-- 2. Create history table hist_global_parameters
CREATE TABLE hist_global_parameters (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gp_id BIGINT,
    param_key VARCHAR(100),
    param_value VARCHAR(100),
    description VARCHAR(225),
    created_at TIMESTAMP WITH TIME ZONE,
    created_user VARCHAR(30),
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_user VARCHAR(30),
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_user VARCHAR(30)
);

-- 3. Create index on gp_id
CREATE INDEX idx_hist_global_parameters_gp_id ON hist_global_parameters(gp_id);
