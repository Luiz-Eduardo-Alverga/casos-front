-- Opcional: executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria o módulo RBAC e a permissão de auditoria de todos os usuários, se ainda não existirem.
-- Em seguida, atribua `audit-all-users` aos papéis desejados na UI de Configurações.

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'audit',
  'Auditoria',
  'Auditoria de horas dos colaboradores.',
  220
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO permissions (module_id, code, label, sort_order, description)
SELECT
  m.id,
  'audit-all-users',
  'Auditar todos os usuários',
  0,
  'Permite selecionar projeto e colaborador na auditoria de horas.'
FROM permission_modules m
WHERE m.slug = 'audit'
ON CONFLICT (code) DO NOTHING;
