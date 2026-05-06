-- Opcional: executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria o módulo RBAC e as permissões de anexos de caso, se ainda não existirem.
-- Em seguida, atribua as permissões aos papéis desejados na UI de Configurações.

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'case-attachments',
  'Anexos de Caso',
  'Upload e gestão de arquivos anexados aos casos (Storage + metadados locais).',
  200
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
    ('list-case-attachment', 'Listar anexos de caso', 0, 'Listar e obter URL de download de anexos.'),
    ('create-case-attachment', 'Anexar arquivos ao caso', 1, 'Gerar URL de upload e registrar anexo após envio.'),
    ('delete-case-attachment', 'Remover anexos de caso', 2, 'Excluir anexo do storage e dos metadados.')
) AS v(code, label, sort_order, description)
WHERE m.slug = 'case-attachments'
ON CONFLICT (code) DO NOTHING;
