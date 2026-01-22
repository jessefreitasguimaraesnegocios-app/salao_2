-- =====================================================
-- MEU SALÃO APP - FUNÇÕES ADICIONAIS PARA SUPABASE
-- =====================================================
-- Funções auxiliares, triggers e procedures adicionais
-- =====================================================

-- =====================================================
-- FUNÇÃO: Criar Transação com Split Automático
-- =====================================================
CREATE OR REPLACE FUNCTION create_transaction_with_split(
    p_business_id UUID,
    p_customer_id UUID,
    p_customer_name VARCHAR,
    p_amount DECIMAL,
    p_payment_method payment_method,
    p_items JSONB DEFAULT NULL,
    p_appointment_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_business_status business_status;
    v_mp_connected BOOLEAN;
BEGIN
    -- Verifica se o business existe e está ativo
    SELECT status, mp_connected INTO v_business_status, v_mp_connected
    FROM businesses
    WHERE id = p_business_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Business não encontrado';
    END IF;

    IF v_business_status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Business deve estar ativo para criar transação';
    END IF;

    IF v_mp_connected = FALSE THEN
        RAISE EXCEPTION 'Business deve estar conectado ao Mercado Pago';
    END IF;

    -- Cria a transação (o trigger calculará o split automaticamente)
    INSERT INTO transactions (
        business_id,
        customer_id,
        customer_name,
        amount,
        payment_method,
        items,
        appointment_id,
        status
    ) VALUES (
        p_business_id,
        p_customer_id,
        p_customer_name,
        p_amount,
        p_payment_method,
        p_items,
        p_appointment_id,
        'PENDING'
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Processar Pagamento e Atualizar Status
-- =====================================================
CREATE OR REPLACE FUNCTION process_payment(
    p_transaction_id UUID,
    p_mp_payment_id VARCHAR DEFAULT NULL,
    p_mp_transaction_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_business_id UUID;
BEGIN
    -- Atualiza a transação para PAID
    UPDATE transactions
    SET 
        status = 'PAID',
        mp_payment_id = p_mp_payment_id,
        mp_transaction_id = p_mp_transaction_id,
        updated_at = NOW()
    WHERE id = p_transaction_id
    RETURNING business_id INTO v_business_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transação não encontrada';
    END IF;

    -- O trigger update_product_stock será executado automaticamente

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Criar/Atualizar Assinatura
-- =====================================================
CREATE OR REPLACE FUNCTION upsert_subscription(
    p_business_id UUID,
    p_status subscription_status,
    p_amount DECIMAL,
    p_mp_subscription_id VARCHAR DEFAULT NULL,
    p_mp_payment_id VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_subscription_id UUID;
    v_period_start TIMESTAMPTZ;
    v_period_end TIMESTAMPTZ;
    v_next_billing TIMESTAMPTZ;
BEGIN
    v_period_start := NOW();
    v_period_end := v_period_start + INTERVAL '30 days';
    v_next_billing := v_period_end;

    INSERT INTO subscriptions (
        business_id,
        status,
        amount,
        current_period_start,
        current_period_end,
        next_billing_date,
        mp_subscription_id,
        mp_payment_id
    ) VALUES (
        p_business_id,
        p_status,
        p_amount,
        v_period_start,
        v_period_end,
        v_next_billing,
        p_mp_subscription_id,
        p_mp_payment_id
    )
    ON CONFLICT (business_id) 
    DO UPDATE SET
        status = EXCLUDED.status,
        amount = EXCLUDED.amount,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        next_billing_date = EXCLUDED.next_billing_date,
        mp_subscription_id = EXCLUDED.mp_subscription_id,
        mp_payment_id = EXCLUDED.mp_payment_id,
        updated_at = NOW()
    RETURNING id INTO v_subscription_id;

    RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Renovar Assinatura Automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION renew_subscription(
    p_business_id UUID,
    p_mp_payment_id VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription subscriptions%ROWTYPE;
BEGIN
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE business_id = p_business_id
    AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Assinatura ativa não encontrada';
    END IF;

    -- Atualiza para o próximo período
    UPDATE subscriptions
    SET 
        current_period_start = v_subscription.current_period_end,
        current_period_end = v_subscription.current_period_end + INTERVAL '30 days',
        next_billing_date = v_subscription.current_period_end + INTERVAL '30 days',
        mp_payment_id = p_mp_payment_id,
        updated_at = NOW()
    WHERE id = v_subscription.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Obter Estatísticas do Business
-- =====================================================
CREATE OR REPLACE FUNCTION get_business_stats(p_business_id UUID)
RETURNS TABLE (
    total_revenue DECIMAL,
    total_sales BIGINT,
    average_ticket DECIMAL,
    today_appointments BIGINT,
    active_products BIGINT,
    active_services BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(t.partner_net), 0) AS total_revenue,
        COUNT(t.id) AS total_sales,
        COALESCE(AVG(t.partner_net), 0) AS average_ticket,
        COUNT(a.id) FILTER (WHERE a.date = CURRENT_DATE AND a.status = 'CONFIRMED') AS today_appointments,
        COUNT(p.id) FILTER (WHERE p.is_active = TRUE) AS active_products,
        COUNT(s.id) FILTER (WHERE s.is_active = TRUE) AS active_services
    FROM businesses b
    LEFT JOIN transactions t ON t.business_id = b.id AND t.status = 'PAID'
    LEFT JOIN appointments a ON a.business_id = b.id
    LEFT JOIN products p ON p.business_id = b.id AND p.deleted_at IS NULL
    LEFT JOIN services s ON s.business_id = b.id AND s.deleted_at IS NULL
    WHERE b.id = p_business_id
    AND b.deleted_at IS NULL
    GROUP BY b.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Obter Próximos Agendamentos
-- =====================================================
CREATE OR REPLACE FUNCTION get_upcoming_appointments(
    p_business_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    customer_name VARCHAR,
    service_name VARCHAR,
    date DATE,
    appointment_time TIME,
    status appointment_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.customer_name,
        a.service_name,
        a.date,
        a.time AS appointment_time,
        a.status
    FROM appointments a
    WHERE a.business_id = p_business_id
    AND a.date >= CURRENT_DATE
    AND a.status IN ('PENDING', 'CONFIRMED')
    ORDER BY a.date ASC, a.time ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Verificar e Atualizar Assinaturas Expiradas
-- =====================================================
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Atualiza assinaturas expiradas
    UPDATE subscriptions
    SET status = 'expired'
    WHERE status = 'active'
    AND next_billing_date < NOW()
    AND mp_payment_id IS NULL; -- Não foi pago

    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- JOB: Verificar Assinaturas Expiradas (via pg_cron)
-- =====================================================
-- Descomente se tiver pg_cron instalado no Supabase
-- SELECT cron.schedule(
--     'check-expired-subscriptions',
--     '0 0 * * *', -- Diariamente à meia-noite
--     $$SELECT check_expired_subscriptions();$$
-- );

-- =====================================================
-- FUNÇÃO: Atualizar Tokens do Mercado Pago
-- =====================================================
CREATE OR REPLACE FUNCTION update_mp_tokens(
    p_business_id UUID,
    p_access_token TEXT,
    p_refresh_token TEXT,
    p_expires_in INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_token_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_expires_at := NOW() + (p_expires_in || ' seconds')::INTERVAL;

    INSERT INTO mercado_pago_tokens (
        business_id,
        access_token,
        refresh_token,
        expires_at
    ) VALUES (
        p_business_id,
        p_access_token,
        p_refresh_token,
        v_expires_at
    )
    ON CONFLICT (business_id)
    DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    RETURNING id INTO v_token_id;

    -- Atualiza mp_connected no business
    UPDATE businesses
    SET mp_connected = TRUE,
        updated_at = NOW()
    WHERE id = p_business_id;

    RETURN v_token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Refresh Token do Mercado Pago
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_mp_token(p_business_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_token mercado_pago_tokens%ROWTYPE;
BEGIN
    SELECT * INTO v_token
    FROM mercado_pago_tokens
    WHERE business_id = p_business_id
    AND expires_at > NOW();

    IF NOT FOUND THEN
        -- Token expirado ou não existe
        -- Aqui você chamaria a API do Mercado Pago para renovar
        -- Por enquanto, apenas retorna false
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Criar Agendamento com Validações
-- =====================================================
CREATE OR REPLACE FUNCTION create_appointment(
    p_business_id UUID,
    p_customer_id UUID,
    p_customer_name VARCHAR,
    p_customer_phone VARCHAR,
    p_service_id UUID,
    p_date DATE,
    p_time TIME,
    p_team_member_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_appointment_id UUID;
    v_service_price DECIMAL;
    v_service_name VARCHAR;
    v_business_status business_status;
BEGIN
    -- Verifica se business está ativo
    SELECT status INTO v_business_status
    FROM businesses
    WHERE id = p_business_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Business não encontrado';
    END IF;

    IF v_business_status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Business deve estar ativo para criar agendamento';
    END IF;

    -- Busca dados do serviço
    SELECT name, price INTO v_service_name, v_service_price
    FROM services
    WHERE id = p_service_id
    AND business_id = p_business_id
    AND is_active = TRUE
    AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Serviço não encontrado ou inativo';
    END IF;

    -- Verifica se já existe agendamento no mesmo horário
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE business_id = p_business_id
        AND date = p_date
        AND time = p_time
        AND status IN ('PENDING', 'CONFIRMED')
    ) THEN
        RAISE EXCEPTION 'Já existe um agendamento neste horário';
    END IF;

    -- Cria o agendamento
    INSERT INTO appointments (
        business_id,
        customer_id,
        customer_name,
        customer_phone,
        service_id,
        service_name,
        team_member_id,
        date,
        time,
        price,
        status
    ) VALUES (
        p_business_id,
        p_customer_id,
        p_customer_name,
        p_customer_phone,
        p_service_id,
        v_service_name,
        p_team_member_id,
        p_date,
        p_time,
        v_service_price,
        'PENDING'
    ) RETURNING id INTO v_appointment_id;

    RETURN v_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Cancelar Agendamento
-- =====================================================
CREATE OR REPLACE FUNCTION cancel_appointment(p_appointment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE appointments
    SET 
        status = 'CANCELLED',
        updated_at = NOW()
    WHERE id = p_appointment_id
    AND status IN ('PENDING', 'CONFIRMED');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agendamento não encontrado ou não pode ser cancelado';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Confirmar Agendamento
-- =====================================================
CREATE OR REPLACE FUNCTION confirm_appointment(p_appointment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE appointments
    SET 
        status = 'CONFIRMED',
        updated_at = NOW()
    WHERE id = p_appointment_id
    AND status = 'PENDING';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agendamento não encontrado ou já foi processado';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Completar Agendamento e Criar Transação
-- =====================================================
CREATE OR REPLACE FUNCTION complete_appointment(
    p_appointment_id UUID,
    p_payment_method payment_method
)
RETURNS UUID AS $$
DECLARE
    v_appointment appointments%ROWTYPE;
    v_transaction_id UUID;
BEGIN
    -- Busca o agendamento
    SELECT * INTO v_appointment
    FROM appointments
    WHERE id = p_appointment_id
    AND status = 'CONFIRMED';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agendamento não encontrado ou não está confirmado';
    END IF;

    -- Atualiza status do agendamento
    UPDATE appointments
    SET status = 'COMPLETED',
        updated_at = NOW()
    WHERE id = p_appointment_id;

    -- Cria transação automaticamente
    SELECT create_transaction_with_split(
        v_appointment.business_id,
        v_appointment.customer_id,
        v_appointment.customer_name,
        v_appointment.price,
        p_payment_method,
        jsonb_build_array(
            jsonb_build_object(
                'type', 'service',
                'service_id', v_appointment.service_id,
                'service_name', v_appointment.service_name,
                'quantity', 1,
                'price', v_appointment.price
            )
        ),
        p_appointment_id
    ) INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Obter Relatório de Transações
-- =====================================================
CREATE OR REPLACE FUNCTION get_transactions_report(
    p_business_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_amount DECIMAL,
    total_admin_fee DECIMAL,
    total_partner_net DECIMAL,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(t.amount), 0) AS total_amount,
        COALESCE(SUM(t.admin_fee), 0) AS total_admin_fee,
        COALESCE(SUM(t.partner_net), 0) AS total_partner_net,
        COUNT(t.id) AS transaction_count
    FROM transactions t
    WHERE t.status = 'PAID'
    AND (p_business_id IS NULL OR t.business_id = p_business_id)
    AND (p_start_date IS NULL OR DATE(t.created_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(t.created_at) <= p_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIM DAS FUNÇÕES
-- =====================================================
