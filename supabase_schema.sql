-- =====================================================
-- MEU SALÃO APP - SCHEMA COMPLETO PARA SUPABASE
-- =====================================================
-- Este schema implementa todas as funcionalidades do app
-- incluindo split automático de pagamentos, assinaturas,
-- integração com Mercado Pago e segurança completa.
-- =====================================================

-- =====================================================
-- EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS E TIPOS
-- =====================================================

-- Enum para roles de usuário
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'BUSINESS_OWNER', 'SUPER_ADMIN');

-- Enum para tipo de negócio
CREATE TYPE business_type AS ENUM ('BARBERSHOP', 'SALON');

-- Enum para status de negócio
CREATE TYPE business_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- Enum para status de transação
CREATE TYPE transaction_status AS ENUM ('PAID', 'PENDING', 'REFUNDED');

-- Enum para método de pagamento
CREATE TYPE payment_method AS ENUM ('pix', 'credit_card');

-- Enum para status de agendamento
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- Enum para status de membro da equipe
CREATE TYPE team_member_status AS ENUM ('ACTIVE', 'INACTIVE');

-- Enum para status de assinatura
CREATE TYPE subscription_status AS ENUM ('active', 'pending', 'expired', 'cancelled');

-- =====================================================
-- TABELA: USERS (Usuários)
-- =====================================================
-- Nota: business_id será adicionado após criar a tabela businesses
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    business_id UUID, -- Foreign key será adicionada depois
    avatar TEXT,
    password_hash TEXT, -- Hash da senha (usar bcrypt)
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_password_change TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_business_id ON users(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- =====================================================
-- TABELA: BUSINESSES (Estabelecimentos)
-- =====================================================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type business_type NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    revenue_split DECIMAL(5,2) NOT NULL DEFAULT 10.00 CHECK (revenue_split >= 0 AND revenue_split <= 100),
    monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 149.90 CHECK (monthly_fee >= 0),
    status business_status NOT NULL DEFAULT 'PENDING',
    description TEXT,
    logo TEXT,
    cover_image TEXT,
    mp_connected BOOLEAN DEFAULT FALSE,
    mp_merchant_id VARCHAR(255), -- ID do merchant no Mercado Pago
    address TEXT,
    opening_hours JSONB, -- Array de objetos OpeningHour
    notifications JSONB DEFAULT '{
        "email_appointments": true,
        "email_marketing": false,
        "whatsapp_reminders": true,
        "low_stock_alerts": true,
        "weekly_reports": true
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para businesses
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_businesses_status ON businesses(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_businesses_type ON businesses(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_businesses_mp_connected ON businesses(mp_connected) WHERE deleted_at IS NULL;

-- Adicionar foreign key de users.business_id após criar businesses
ALTER TABLE users 
ADD CONSTRAINT fk_users_business_id 
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;

-- =====================================================
-- TABELA: MERCADO_PAGO_TOKENS (Tokens OAuth do Mercado Pago)
-- =====================================================
CREATE TABLE mercado_pago_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL, -- Criptografado em produção
    refresh_token TEXT NOT NULL, -- Criptografado em produção
    expires_at TIMESTAMPTZ NOT NULL,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para tokens
CREATE INDEX idx_mp_tokens_business_id ON mercado_pago_tokens(business_id);
CREATE INDEX idx_mp_tokens_expires_at ON mercado_pago_tokens(expires_at);

-- =====================================================
-- TABELA: SUBSCRIPTIONS (Assinaturas Mensais)
-- =====================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    status subscription_status NOT NULL DEFAULT 'pending',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    next_billing_date TIMESTAMPTZ NOT NULL,
    mp_subscription_id VARCHAR(255), -- ID da assinatura no Mercado Pago
    mp_payment_id VARCHAR(255), -- ID do último pagamento
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para subscriptions
CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date) WHERE status = 'active';

-- =====================================================
-- TABELA: PRODUCTS (Produtos)
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image TEXT,
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para products
CREATE INDEX idx_products_business_id ON products(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_products_is_active ON products(is_active) WHERE deleted_at IS NULL;

-- =====================================================
-- TABELA: SERVICES (Serviços)
-- =====================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0), -- em minutos
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para services
CREATE INDEX idx_services_business_id ON services(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_is_active ON services(is_active) WHERE deleted_at IS NULL;

-- =====================================================
-- TABELA: TEAM_MEMBERS (Membros da Equipe)
-- =====================================================
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    specialties TEXT,
    avatar TEXT,
    status team_member_status DEFAULT 'ACTIVE',
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices para team_members
CREATE INDEX idx_team_members_business_id ON team_members(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_members_status ON team_members(status) WHERE deleted_at IS NULL;

-- =====================================================
-- TABELA: APPOINTMENTS (Agendamentos)
-- =====================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    service_name VARCHAR(255) NOT NULL,
    team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status appointment_status DEFAULT 'PENDING',
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para appointments
CREATE INDEX idx_appointments_business_id ON appointments(business_id);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_business_date ON appointments(business_id, date, status);

-- =====================================================
-- TABELA: TRANSACTIONS (Transações com Split Automático)
-- =====================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    admin_fee DECIMAL(10,2) NOT NULL CHECK (admin_fee >= 0),
    partner_net DECIMAL(10,2) NOT NULL CHECK (partner_net >= 0),
    revenue_split_percentage DECIMAL(5,2) NOT NULL, -- Percentual usado no momento da transação
    status transaction_status DEFAULT 'PENDING',
    payment_method payment_method NOT NULL,
    mp_payment_id VARCHAR(255), -- ID do pagamento no Mercado Pago
    mp_transaction_id VARCHAR(255), -- ID da transação no Mercado Pago
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    items JSONB, -- Array de produtos/serviços comprados
    metadata JSONB, -- Dados adicionais
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para transactions
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_mp_payment_id ON transactions(mp_payment_id) WHERE mp_payment_id IS NOT NULL;

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mp_tokens_updated_at BEFORE UPDATE ON mercado_pago_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO: Calcular Split Automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_split(
    p_amount DECIMAL,
    p_revenue_split_percentage DECIMAL
)
RETURNS TABLE (
    admin_fee DECIMAL,
    partner_net DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND((p_amount * p_revenue_split_percentage / 100)::numeric, 2)::DECIMAL AS admin_fee,
        ROUND((p_amount * (100 - p_revenue_split_percentage) / 100)::numeric, 2)::DECIMAL AS partner_net;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- TRIGGER: Calcular Split ao Criar Transação
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_transaction_split()
RETURNS TRIGGER AS $$
DECLARE
    v_revenue_split DECIMAL;
    v_split_result RECORD;
BEGIN
    -- Busca o revenue_split do business no momento da transação
    SELECT revenue_split INTO v_revenue_split
    FROM businesses
    WHERE id = NEW.business_id AND deleted_at IS NULL;

    -- Se não encontrar, usa 10% como padrão
    IF v_revenue_split IS NULL THEN
        v_revenue_split := 10.00;
    END IF;

    -- Calcula o split
    SELECT * INTO v_split_result
    FROM calculate_split(NEW.amount, v_revenue_split);

    -- Atualiza os valores calculados
    NEW.admin_fee := v_split_result.admin_fee;
    NEW.partner_net := v_split_result.partner_net;
    NEW.revenue_split_percentage := v_revenue_split;

    -- Validação: admin_fee + partner_net deve ser igual a amount (com tolerância de 0.01)
    IF ABS((NEW.admin_fee + NEW.partner_net) - NEW.amount) > 0.01 THEN
        RAISE EXCEPTION 'Erro no cálculo do split: admin_fee + partner_net não é igual a amount';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_split
    BEFORE INSERT OR UPDATE OF amount, business_id ON transactions
    FOR EACH ROW
    WHEN (NEW.amount IS NOT NULL AND NEW.business_id IS NOT NULL)
    EXECUTE FUNCTION calculate_transaction_split();

-- =====================================================
-- FUNÇÃO: Verificar se Business está Ativo
-- =====================================================
CREATE OR REPLACE FUNCTION check_business_active()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM businesses 
        WHERE id = NEW.business_id 
        AND status = 'ACTIVE' 
        AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Business deve estar ativo para realizar esta operação';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar verificação em transações e agendamentos
CREATE TRIGGER check_business_active_transactions
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_business_active();

CREATE TRIGGER check_business_active_appointments
    BEFORE INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION check_business_active();

-- =====================================================
-- FUNÇÃO: Atualizar Estoque ao Criar Transação
-- =====================================================
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    item JSONB;
    product_id UUID;
    quantity INTEGER;
    should_update BOOLEAN := FALSE;
BEGIN
    -- Verifica se deve atualizar estoque
    -- Em INSERT: se status é PAID
    -- Em UPDATE: se mudou de não-PAID para PAID
    IF TG_OP = 'INSERT' THEN
        should_update := (NEW.status = 'PAID');
    ELSIF TG_OP = 'UPDATE' THEN
        should_update := (NEW.status = 'PAID' AND (OLD.status IS NULL OR OLD.status != 'PAID'));
    END IF;

    -- Se deve atualizar e tem items
    IF should_update AND NEW.items IS NOT NULL THEN
        -- Itera sobre os items (produtos)
        FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
        LOOP
            product_id := (item->>'product_id')::UUID;
            quantity := (item->>'quantity')::INTEGER;

            IF product_id IS NOT NULL AND quantity IS NOT NULL THEN
                -- Atualiza o estoque
                UPDATE products
                SET stock = GREATEST(0, stock - quantity),
                    updated_at = NOW()
                WHERE id = product_id
                AND business_id = NEW.business_id
                AND deleted_at IS NULL;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
    AFTER INSERT OR UPDATE OF status ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercado_pago_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: USERS
-- =====================================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Super Admin pode ver todos os usuários
CREATE POLICY "Super Admin can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'SUPER_ADMIN'
            AND deleted_at IS NULL
        )
    );

-- Super Admin pode gerenciar usuários
CREATE POLICY "Super Admin can manage users"
    ON users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'SUPER_ADMIN'
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- POLÍTICAS RLS: BUSINESSES
-- =====================================================

-- Qualquer um pode ver businesses ativos (para clientes explorarem)
CREATE POLICY "Anyone can view active businesses"
    ON businesses FOR SELECT
    USING (status = 'ACTIVE' AND deleted_at IS NULL);

-- Proprietário pode ver e editar seu próprio business
CREATE POLICY "Owner can manage own business"
    ON businesses FOR ALL
    USING (
        owner_id = auth.uid()
        AND deleted_at IS NULL
    );

-- Super Admin pode ver e gerenciar todos os businesses
CREATE POLICY "Super Admin can manage all businesses"
    ON businesses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'SUPER_ADMIN'
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- POLÍTICAS RLS: MERCADO_PAGO_TOKENS
-- =====================================================

-- Apenas o proprietário pode ver seus tokens
CREATE POLICY "Owner can view own MP tokens"
    ON mercado_pago_tokens FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = mercado_pago_tokens.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- Apenas o proprietário pode gerenciar seus tokens
CREATE POLICY "Owner can manage own MP tokens"
    ON mercado_pago_tokens FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = mercado_pago_tokens.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- POLÍTICAS RLS: SUBSCRIPTIONS
-- =====================================================

-- Proprietário pode ver sua assinatura
CREATE POLICY "Owner can view own subscription"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = subscriptions.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- Super Admin pode ver todas as assinaturas
CREATE POLICY "Super Admin can view all subscriptions"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'SUPER_ADMIN'
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- POLÍTICAS RLS: PRODUCTS
-- =====================================================

-- Qualquer um pode ver produtos ativos de businesses ativos
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (
        is_active = TRUE
        AND deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM businesses
            WHERE id = products.business_id
            AND status = 'ACTIVE'
            AND deleted_at IS NULL
        )
    );

-- Proprietário pode gerenciar produtos do seu business
CREATE POLICY "Owner can manage own products"
    ON products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = products.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- POLÍTICAS RLS: SERVICES
-- =====================================================

-- Qualquer um pode ver serviços ativos de businesses ativos
CREATE POLICY "Anyone can view active services"
    ON services FOR SELECT
    USING (
        is_active = TRUE
        AND deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM businesses
            WHERE id = services.business_id
            AND status = 'ACTIVE'
            AND deleted_at IS NULL
        )
    );

-- Proprietário pode gerenciar serviços do seu business
CREATE POLICY "Owner can manage own services"
    ON services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = services.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- POLÍTICAS RLS: TEAM_MEMBERS
-- =====================================================

-- Qualquer um pode ver membros ativos de businesses ativos
CREATE POLICY "Anyone can view active team members"
    ON team_members FOR SELECT
    USING (
        status = 'ACTIVE'
        AND deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM businesses
            WHERE id = team_members.business_id
            AND status = 'ACTIVE'
            AND deleted_at IS NULL
        )
    );

-- Proprietário pode gerenciar membros do seu business
CREATE POLICY "Owner can manage own team members"
    ON team_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = team_members.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- POLÍTICAS RLS: APPOINTMENTS
-- =====================================================

-- Cliente pode ver seus próprios agendamentos
CREATE POLICY "Customer can view own appointments"
    ON appointments FOR SELECT
    USING (customer_id = auth.uid());

-- Proprietário pode ver agendamentos do seu business
CREATE POLICY "Owner can view business appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = appointments.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- Cliente pode criar agendamentos
CREATE POLICY "Customer can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        customer_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM businesses
            WHERE id = appointments.business_id
            AND status = 'ACTIVE'
            AND deleted_at IS NULL
        )
    );

-- Proprietário pode atualizar agendamentos do seu business
CREATE POLICY "Owner can update business appointments"
    ON appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = appointments.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- POLÍTICAS RLS: TRANSACTIONS
-- =====================================================

-- Cliente pode ver suas próprias transações
CREATE POLICY "Customer can view own transactions"
    ON transactions FOR SELECT
    USING (customer_id = auth.uid());

-- Proprietário pode ver transações do seu business
CREATE POLICY "Owner can view business transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM businesses
            WHERE id = transactions.business_id
            AND owner_id = auth.uid()
            AND deleted_at IS NULL
        )
    );

-- Cliente pode criar transações (checkout)
CREATE POLICY "Customer can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        customer_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM businesses
            WHERE id = transactions.business_id
            AND status = 'ACTIVE'
            AND mp_connected = TRUE
            AND deleted_at IS NULL
        )
    );

-- Super Admin pode ver todas as transações
CREATE POLICY "Super Admin can view all transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'SUPER_ADMIN'
            AND deleted_at IS NULL
        )
    );

-- =====================================================
-- FUNÇÕES AUXILIARES PARA API
-- =====================================================

-- Função para obter business do usuário atual
CREATE OR REPLACE FUNCTION get_user_business()
RETURNS UUID AS $$
DECLARE
    v_business_id UUID;
BEGIN
    SELECT business_id INTO v_business_id
    FROM users
    WHERE id = auth.uid()
    AND deleted_at IS NULL;
    
    RETURN v_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'SUPER_ADMIN'
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é owner do business
CREATE OR REPLACE FUNCTION is_business_owner(p_business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM businesses
        WHERE id = p_business_id
        AND owner_id = auth.uid()
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para dashboard do admin (receitas consolidadas)
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'ACTIVE') AS active_businesses,
    COUNT(DISTINCT t.id) AS total_transactions,
    COALESCE(SUM(t.amount), 0) AS total_volume,
    COALESCE(SUM(t.admin_fee), 0) AS total_admin_fees,
    COALESCE(SUM(s.amount), 0) AS total_subscription_revenue,
    COALESCE(SUM(t.admin_fee), 0) + COALESCE(SUM(s.amount), 0) AS total_platform_revenue
FROM businesses b
LEFT JOIN transactions t ON t.business_id = b.id AND t.status = 'PAID'
LEFT JOIN subscriptions s ON s.business_id = b.id AND s.status = 'active'
WHERE b.deleted_at IS NULL;

-- View para dashboard do owner (métricas do negócio)
CREATE OR REPLACE VIEW owner_dashboard_stats AS
SELECT 
    b.id AS business_id,
    COUNT(DISTINCT t.id) AS total_sales,
    COALESCE(SUM(t.partner_net), 0) AS total_revenue,
    COALESCE(AVG(t.partner_net), 0) AS average_ticket,
    COUNT(DISTINCT a.id) FILTER (WHERE a.date = CURRENT_DATE AND a.status = 'CONFIRMED') AS today_appointments
FROM businesses b
LEFT JOIN transactions t ON t.business_id = b.id AND t.status = 'PAID'
LEFT JOIN appointments a ON a.business_id = b.id
WHERE b.deleted_at IS NULL
GROUP BY b.id;

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir usuário Super Admin padrão
-- NOTA: A senha deve ser hashada com bcrypt antes de inserir
-- Exemplo: senha "admin123" -> hash bcrypt
INSERT INTO users (id, email, name, role, password_hash) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@meusalaoapp.com', 'Super Admin', 'SUPER_ADMIN', '$2a$10$placeholder_hash_here')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE users IS 'Usuários do sistema (clientes, proprietários, admin)';
COMMENT ON TABLE businesses IS 'Estabelecimentos (salões e barbearias)';
COMMENT ON TABLE transactions IS 'Transações com split automático de pagamentos';
COMMENT ON TABLE subscriptions IS 'Assinaturas mensais dos estabelecimentos';
COMMENT ON TABLE mercado_pago_tokens IS 'Tokens OAuth do Mercado Pago (criptografados)';
COMMENT ON FUNCTION calculate_split IS 'Calcula automaticamente o split de uma transação';
COMMENT ON FUNCTION calculate_transaction_split IS 'Trigger que calcula split ao criar/atualizar transação';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
