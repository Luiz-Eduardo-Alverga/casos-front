-- Opcional: executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria a permissão de cadastro de projetos SGP, se ainda não existir.
-- Em seguida, atribua `create-project` aos papéis desejados na UI de Configurações.

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
  'create-project',
  'Cadastrar projeto SGP',
  10,
  'Acessar a tela de novo projeto e criar cadastro via API sgp-cadastros/sgp-usuarios.'
FROM permission_modules m
WHERE m.slug = 'projects'
ON CONFLICT (code) DO NOTHING;
