-- Opcional: executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria o módulo RBAC e a permissão de ver indicadores de todos os colaboradores, se ainda não existirem.
-- Em seguida, atribua `list-indicadores-all` aos papéis desejados na UI de Configurações.

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'indicadores',
  'Indicadores',
  'Premiação e metas dos colaboradores.',
  230
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO permissions (module_id, code, label, sort_order, description)
SELECT
  m.id,
  'list-indicadores-all',
  'Ver indicadores de todos os colaboradores',
  0,
  'Exibe o filtro de colaborador na tela de Indicadores e permite consultar indicadores de outros usuários.'
FROM permission_modules m
WHERE m.slug = 'indicadores'
ON CONFLICT (code) DO NOTHING;
