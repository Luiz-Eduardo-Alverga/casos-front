-- Opcional: executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria a permissão de edição de projetos SGP, se ainda não existir.
-- Em seguida, atribua `edit-project` aos papéis desejados na UI de Configurações.

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
  'edit-project',
  'Editar projeto SGP',
  20,
  'Salvar alterações da aba Abertura via PUT /sgp-cadastros/{id}.'
FROM permission_modules m
WHERE m.slug = 'projects'
ON CONFLICT (code) DO NOTHING;
