-- Opcional: executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria o módulo RBAC e as permissões de Produtos, se ainda não existirem.
-- Em seguida, atribua as permissões aos papéis desejados na UI de Configurações.

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'products',
  'Produtos',
  'Cadastro de linhas de software Softcom (produto, versões, módulos, checklist e scripts).',
  220
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
    ('list-product', 'Listar produtos', 0, 'Acessar a tela Produtos e consultar cadastros via API /api/produtos.'),
    ('create-product', 'Cadastrar produto', 1, 'Acessar a tela de novo produto e criar cadastro via POST /api/produtos.'),
    ('edit-product', 'Editar produto', 2, 'Alterar produto, versões, módulos, checklist e scripts via fachada /api/produtos.'),
    ('delete-product', 'Excluir produto', 3, 'Excluir versões, módulos, itens de checklist e scripts de um produto.')
) AS v(code, label, sort_order, description)
WHERE m.slug = 'products'
ON CONFLICT (code) DO NOTHING;
