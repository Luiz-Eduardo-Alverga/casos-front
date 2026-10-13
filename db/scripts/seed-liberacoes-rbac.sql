-- Executar no SQL Editor do Supabase (ou via cliente SQL) após deploy.
-- Cria o módulo RBAC e as permissões de Liberações, se ainda não existirem.
-- Em seguida, atribua as permissões aos papéis desejados na UI de Configurações.

INSERT INTO permission_modules (slug, name, description, sort_order)
VALUES (
  'releases',
  'Liberações',
  'Registro de liberação: versões piloto e final, casos da versão e checklist.',
  240
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
    ('list-release', 'Listar liberações', 0, 'Acessar a tela Liberações e consultar o registro, os casos da versão e o checklist.'),
    ('create-release', 'Cadastrar liberação', 1, 'Criar uma nova liberação.'),
    ('edit-release', 'Editar liberação', 2, 'Alterar a liberação, versões, checklist e concluir a liberação.'),
    ('delete-release', 'Excluir liberação', 3, 'Excluir uma liberação.')
) AS v(code, label, sort_order, description)
WHERE m.slug = 'releases'
ON CONFLICT (code) DO NOTHING;
