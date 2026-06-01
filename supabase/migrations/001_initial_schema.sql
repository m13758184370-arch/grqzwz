-- Initial schema for AI Resume app

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Industries
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name_zh VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    icon VARCHAR(64),
    prompt_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(128),
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_users_session_id ON users(session_id);

-- Resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    industry_id UUID REFERENCES industries(id) NOT NULL,
    raw_data JSONB NOT NULL,
    generated_sections JSONB,
    generated_full_text TEXT,
    pdf_url TEXT,
    status VARCHAR(32) DEFAULT 'draft',
    position_level VARCHAR(32),
    target_company_type VARCHAR(64),
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_industry_id ON resumes(industry_id);
CREATE INDEX idx_resumes_status ON resumes(status);

-- Interview Question Sets
CREATE TABLE interview_question_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    industry_id UUID REFERENCES industries(id) NOT NULL,
    position_level VARCHAR(32),
    role_type VARCHAR(64),
    company_type VARCHAR(64),
    questions JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_interview_user_id ON interview_question_sets(user_id);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_no VARCHAR(32) UNIQUE NOT NULL,
    product_type VARCHAR(32) NOT NULL,
    product_id UUID,
    industry_id UUID REFERENCES industries(id),
    amount_cents INTEGER NOT NULL,
    payment_method VARCHAR(32),
    payment_status VARCHAR(32) DEFAULT 'pending',
    qr_code_url TEXT,
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
