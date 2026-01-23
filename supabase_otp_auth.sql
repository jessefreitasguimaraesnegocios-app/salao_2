-- =====================================================
-- AUTENTICAÇÃO E PERFIS - MEU SALÃO APP
-- =====================================================
-- Este schema implementa autenticação com email e senha
-- para todos os tipos de usuário (Clientes, Estabelecimentos, Admins)
-- 
-- Todos os usuários podem se cadastrar e o trigger cria
-- o perfil automaticamente com o role especificado
-- =====================================================

-- =====================================================
-- TABELA: PROFILES (Perfis de Usuário)
-- =====================================================
-- Esta tabela armazena os perfis dos usuários autenticados
-- via Supabase Auth. O id referencia auth.users.id

-- Remover tabela se existir (CUIDADO: isso apaga dados!)
-- Descomente apenas se quiser recriar a tabela do zero
-- DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- =====================================================
-- FUNÇÃO: Criar perfil automaticamente após signup
-- =====================================================
-- Esta função é chamada pelo trigger quando um novo usuário
-- é criado no auth.users via OTP
-- Permite definir role via raw_user_meta_data->>'role'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
    user_name TEXT;
BEGIN
    -- Determinar role do usuário
    -- Pode ser definido via raw_user_meta_data->>'role' no signup
    -- Valores aceitos: 'CUSTOMER', 'BUSINESS_OWNER', 'SUPER_ADMIN'
    -- Se não especificado, padrão é 'CUSTOMER'
    user_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'CUSTOMER'  -- Padrão se não especificado
    );
    
    -- Determinar nome do usuário
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        CASE 
            WHEN user_role = 'SUPER_ADMIN' THEN 'Super Admin'
            WHEN user_role = 'BUSINESS_OWNER' THEN 'Proprietário'
            ELSE 'Cliente'
        END
    );
    
    -- Inserir perfil na tabela profiles para TODOS os tipos de usuário
    INSERT INTO public.profiles (id, role, email, phone, name)
    VALUES (
        NEW.id,
        user_role,
        COALESCE(NEW.email, NULL),
        COALESCE(NEW.phone, NULL),
        user_name
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Criar perfil após signup
-- =====================================================
-- Este trigger é disparado automaticamente quando um novo
-- usuário é criado em auth.users (via signup com email/senha)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: SELECT (Leitura)
-- =====================================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Clientes veem apenas seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Business owners veem seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins veem todos os perfis" ON profiles;

-- Cliente pode ver apenas seu próprio perfil
CREATE POLICY "Clientes veem apenas seu próprio perfil"
    ON profiles
    FOR SELECT
    USING (
        auth.uid() = id AND role = 'CUSTOMER'
    );

-- Business Owner pode ver seu próprio perfil
CREATE POLICY "Business owners veem seu próprio perfil"
    ON profiles
    FOR SELECT
    USING (
        auth.uid() = id AND role = 'BUSINESS_OWNER'
    );

-- Admin pode ver todos os perfis
CREATE POLICY "Admins veem todos os perfis"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- =====================================================
-- POLÍTICAS RLS: UPDATE (Atualização)
-- =====================================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Clientes atualizam apenas seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Business owners atualizam seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins atualizam todos os perfis" ON profiles;

-- Cliente pode atualizar apenas seu próprio perfil
CREATE POLICY "Clientes atualizam apenas seu próprio perfil"
    ON profiles
    FOR UPDATE
    USING (
        auth.uid() = id AND role = 'CUSTOMER'
    )
    WITH CHECK (
        auth.uid() = id AND role = 'CUSTOMER'
    );

-- Business Owner pode atualizar seu próprio perfil
CREATE POLICY "Business owners atualizam seu próprio perfil"
    ON profiles
    FOR UPDATE
    USING (
        auth.uid() = id AND role = 'BUSINESS_OWNER'
    )
    WITH CHECK (
        auth.uid() = id AND role = 'BUSINESS_OWNER'
    );

-- Admin pode atualizar todos os perfis
CREATE POLICY "Admins atualizam todos os perfis"
    ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- =====================================================
-- POLÍTICAS RLS: INSERT (Inserção)
-- =====================================================

-- Remover política existente (se houver)
DROP POLICY IF EXISTS "Apenas trigger pode inserir perfis" ON profiles;

-- Apenas o trigger pode inserir perfis (via SECURITY DEFINER)
-- Não permitimos inserção manual por segurança
CREATE POLICY "Apenas trigger pode inserir perfis"
    ON profiles
    FOR INSERT
    WITH CHECK (false); -- Bloqueia inserção manual

-- Permitir inserção apenas via função handle_new_user
-- (que usa SECURITY DEFINER e tem permissões de service role)

-- =====================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE profiles IS 'Perfis de usuários autenticados via Supabase Auth. Criados automaticamente via trigger após signup com email/senha.';
COMMENT ON COLUMN profiles.id IS 'ID do usuário em auth.users (FK)';
COMMENT ON COLUMN profiles.role IS 'Papel do usuário: CUSTOMER, BUSINESS_OWNER, ou SUPER_ADMIN';
COMMENT ON COLUMN profiles.phone IS 'Telefone do usuário (opcional)';
COMMENT ON COLUMN profiles.email IS 'Email do usuário (usado para login)';
COMMENT ON FUNCTION handle_new_user() IS 'Cria perfil automaticamente após signup, atribuindo role baseado em raw_user_meta_data->>role ou CUSTOMER por padrão';
