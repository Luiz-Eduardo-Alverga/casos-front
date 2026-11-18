-- Executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria o módulo RBAC de Avisos e a permissão de envio, se ainda não existirem.
-- Em seguida, atribua `create-aviso` aos papéis desejados na UI de Configurações.
-- A tela /avisos (leitura) continua sem permissão própria (docs/avisos/decisoes.md #8).

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'notices',
  'Avisos',
  'Envio de avisos (comunicados) para usuários do Softflow.',
  260
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO permissions (module_id, code, label, sort_order, description)
SELECT
  m.id,
  'create-aviso',
  'Enviar aviso',
  0,
  'Acessar /avisos/novo e enviar comunicados via POST /api/comunicados.'
FROM permission_modules m
WHERE m.slug = 'notices'
ON CONFLICT (code) DO NOTHING;
