-- Executar no SQL Editor do Supabase após aplicar a migração do módulo.
-- As permissões devem ser atribuídas aos papéis pela UI de Perfis de acesso.

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'docs',
  'Documentação',
  'Base de conhecimento técnico e de processos do Softflow.',
  210
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
    ('list-doc', 'Listar documentos', 0, 'Listar e visualizar documentos.'),
    ('create-doc', 'Criar documento', 1, 'Criar documentos na base de conhecimento.'),
    ('edit-doc', 'Editar documento', 2, 'Editar e publicar documentos.'),
    ('delete-doc', 'Excluir documento', 3, 'Excluir documentos da base de conhecimento.'),
    ('manage-doc-category', 'Gerenciar categorias', 4, 'Criar categorias de documentação.')
) AS v(code, label, sort_order, description)
WHERE m.slug = 'docs'
ON CONFLICT (code) DO NOTHING;
