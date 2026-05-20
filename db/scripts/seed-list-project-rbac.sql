-- Opcional: executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria o módulo RBAC e a permissão de listagem de projetos SGP, se ainda não existirem.
-- Em seguida, atribua `list-project` aos papéis desejados na UI de Configurações.

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'projects',
  'Projetos SGP',
  'Listagem e consulta de cadastros de projetos (SGP).',
  210
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO permissions (module_id, code, label, sort_order, description)
SELECT
  m.id,
  'list-project',
  'Listar projetos SGP',
  0,
  'Acessar a tela Ver Projetos e consultar cadastros via API sgp-cadastros.'
FROM permission_modules m
WHERE m.slug = 'projects'
ON CONFLICT (code) DO NOTHING;
