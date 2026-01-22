-- =====================================================
-- MEU SALÃO APP - EXEMPLOS DE USO E QUERIES ÚTEIS
-- =====================================================
-- Exemplos práticos de como usar as funções e tabelas
-- =====================================================

-- =====================================================
-- EXEMPLO 1: Criar um Business Completo
-- =====================================================

-- 1. Criar usuário owner
INSERT INTO users (email, name, role, password_hash) 
VALUES ('joao@barbearia.com', 'João Proprietário', 'BUSINESS_OWNER', '$2a$10$hash_aqui')
RETURNING id;

-- 2. Criar business
INSERT INTO businesses (
    name,
    type,
    owner_id,
    revenue_split,
    monthly_fee,
    status,
    description,
    address,
    opening_hours
) VALUES (
    'Barbearia Vintage',
    'BARBERSHOP',
    'uuid-do-owner-aqui',
    10.00,
    149.90,
    'ACTIVE',
    'A melhor barbearia clássica da região',
    'Rua das Flores, 123',
    '[
        {"day": "Segunda-feira", "open": "09:00", "close": "18:00", "is_closed": true},
        {"day": "Terça-feira", "open": "09:00", "close": "19:00", "is_closed": false}
    ]'::jsonb
) RETURNING id;

-- =====================================================
-- EXEMPLO 2: Conectar ao Mercado Pago
-- =====================================================

-- Após obter tokens do OAuth, salvar:
SELECT update_mp_tokens(
    'business-uuid',
    'access_token_aqui',
    'refresh_token_aqui',
    21600 -- 6 horas em segundos
);

-- =====================================================
-- EXEMPLO 3: Criar Assinatura
-- =====================================================

SELECT upsert_subscription(
    'business-uuid',
    'active',
    149.90,
    'mp_subscription_id',
    'mp_payment_id'
);

-- =====================================================
-- EXEMPLO 4: Criar Transação (Checkout)
-- =====================================================

-- Criar transação com split automático
SELECT create_transaction_with_split(
    'business-uuid',
    'customer-uuid',
    'Maria Cliente',
    95.90,
    'pix',
    '[
        {
            "type": "product",
            "product_id": "product-uuid",
            "product_name": "Pomada Modeladora",
            "quantity": 2,
            "price": 45.90
        }
    ]'::jsonb,
    NULL -- appointment_id se for agendamento
);

-- Processar pagamento após confirmação do MP
SELECT process_payment(
    'transaction-uuid',
    'mp_payment_id_12345',
    'mp_transaction_id_67890'
);

-- =====================================================
-- EXEMPLO 5: Criar Agendamento
-- =====================================================

SELECT create_appointment(
    'business-uuid',
    'customer-uuid',
    'Maria Cliente',
    '11999999999',
    'service-uuid',
    'team-member-uuid', -- opcional
    '2025-01-20',
    '14:30'
);

-- Confirmar agendamento
SELECT confirm_appointment('appointment-uuid');

-- Completar agendamento e criar transação
SELECT complete_appointment('appointment-uuid', 'pix');

-- =====================================================
-- EXEMPLO 6: Queries Úteis para Dashboards
-- =====================================================

-- Receita total do business
SELECT 
    COALESCE(SUM(partner_net), 0) AS total_revenue,
    COUNT(*) AS total_sales
FROM transactions
WHERE business_id = 'business-uuid'
AND status = 'PAID';

-- Próximos agendamentos de hoje
SELECT * FROM get_upcoming_appointments('business-uuid', 10)
WHERE date = CURRENT_DATE
ORDER BY time;

-- Estatísticas completas
SELECT * FROM get_business_stats('business-uuid');

-- Relatório de transações (últimos 30 dias)
SELECT * FROM get_transactions_report(
    'business-uuid',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE
);

-- =====================================================
-- EXEMPLO 7: Admin - Relatório Consolidado
-- =====================================================

-- Receita total da plataforma
SELECT * FROM admin_dashboard_stats;

-- Top 10 businesses por receita
SELECT 
    b.name,
    b.type,
    COUNT(t.id) AS total_transactions,
    COALESCE(SUM(t.amount), 0) AS total_volume,
    COALESCE(SUM(t.admin_fee), 0) AS platform_revenue
FROM businesses b
LEFT JOIN transactions t ON t.business_id = b.id AND t.status = 'PAID'
WHERE b.status = 'ACTIVE'
AND b.deleted_at IS NULL
GROUP BY b.id, b.name, b.type
ORDER BY platform_revenue DESC
LIMIT 10;

-- =====================================================
-- EXEMPLO 8: Verificar Assinaturas Vencidas
-- =====================================================

-- Listar assinaturas que precisam renovação
SELECT 
    s.id,
    b.name AS business_name,
    s.next_billing_date,
    s.status
FROM subscriptions s
JOIN businesses b ON b.id = s.business_id
WHERE s.status = 'active'
AND s.next_billing_date < NOW() + INTERVAL '3 days'
AND b.deleted_at IS NULL;

-- =====================================================
-- EXEMPLO 9: Atualizar Estoque Manualmente
-- =====================================================

UPDATE products
SET stock = stock + 10
WHERE id = 'product-uuid'
AND business_id = 'business-uuid';

-- =====================================================
-- EXEMPLO 10: Buscar Transações com Detalhes
-- =====================================================

SELECT 
    t.id,
    t.created_at,
    b.name AS business_name,
    t.customer_name,
    t.amount,
    t.admin_fee,
    t.partner_net,
    t.revenue_split_percentage,
    t.status,
    t.payment_method
FROM transactions t
JOIN businesses b ON b.id = t.business_id
WHERE t.status = 'PAID'
ORDER BY t.created_at DESC
LIMIT 50;

-- =====================================================
-- EXEMPLO 11: Verificar Tokens Expirados
-- =====================================================

SELECT 
    b.name AS business_name,
    mpt.expires_at,
    CASE 
        WHEN mpt.expires_at < NOW() THEN 'Expirado'
        WHEN mpt.expires_at < NOW() + INTERVAL '1 hour' THEN 'Expirando em breve'
        ELSE 'Válido'
    END AS token_status
FROM mercado_pago_tokens mpt
JOIN businesses b ON b.id = mpt.business_id
WHERE b.deleted_at IS NULL
ORDER BY mpt.expires_at;

-- =====================================================
-- EXEMPLO 12: Relatório de Split por Período
-- =====================================================

SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount,
    SUM(admin_fee) AS total_admin_fee,
    SUM(partner_net) AS total_partner_net,
    AVG(revenue_split_percentage) AS avg_split_percentage
FROM transactions
WHERE status = 'PAID'
AND created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- =====================================================
-- EXEMPLO 13: Produtos com Estoque Baixo
-- =====================================================

SELECT 
    p.name,
    p.stock,
    b.name AS business_name,
    p.category
FROM products p
JOIN businesses b ON b.id = p.business_id
WHERE p.stock <= 5
AND p.is_active = TRUE
AND p.deleted_at IS NULL
AND b.status = 'ACTIVE'
AND b.deleted_at IS NULL
ORDER BY p.stock ASC;

-- =====================================================
-- EXEMPLO 14: Agendamentos do Dia
-- =====================================================

SELECT 
    a.time,
    a.customer_name,
    a.service_name,
    a.status,
    tm.name AS team_member_name
FROM appointments a
LEFT JOIN team_members tm ON tm.id = a.team_member_id
WHERE a.business_id = 'business-uuid'
AND a.date = CURRENT_DATE
AND a.status IN ('PENDING', 'CONFIRMED')
ORDER BY a.time;

-- =====================================================
-- EXEMPLO 15: Cancelar Transação (Reembolso)
-- =====================================================

-- Atualizar status para REFUNDED
UPDATE transactions
SET 
    status = 'REFUNDED',
    updated_at = NOW()
WHERE id = 'transaction-uuid'
AND status = 'PAID';

-- Reverter estoque (se necessário)
-- Nota: Você pode criar uma função específica para isso

-- =====================================================
-- FIM DOS EXEMPLOS
-- =====================================================
