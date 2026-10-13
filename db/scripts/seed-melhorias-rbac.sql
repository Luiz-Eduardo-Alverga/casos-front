-- Executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria o módulo RBAC e as permissões de Melhorias, se ainda não existirem.
-- Em seguida, atribua as permissões aos papéis desejados na UI de Configurações.

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'improvements',
  'Melhorias',
  'Ideias e melhorias do painel, com avaliação por produto, setor e período.',
  250
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO permissions (module_id, code, label, sort_order, description)
SELECT
  m.id,
  v.code,
  v.label,
  v.sort_order,
  v.description
FROM permission_modules m
CROSS JOIN (
  VALUES
    ('list-improvement', 'Listar melhorias', 0, 'Acessar a tela Melhorias e consultar as ideias via GET /api/painel-ideias.'),
    ('edit-improvement', 'Avaliar melhoria', 1, 'Avaliar ou reavaliar uma melhoria via PATCH /api/painel-ideias/{id}.')
) AS v(code, label, sort_order, description)
WHERE m.slug = 'improvements'
ON CONFLICT (code) DO NOTHING;
