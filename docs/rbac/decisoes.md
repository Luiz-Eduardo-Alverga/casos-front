# RBAC — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: `RBAC_PERMISSOES` e regras do Cursor,
consolidadas em 2026-11-17.

1. **Toda permissão é checada em duas camadas: o front esconde navegação e ações e bloqueia a URL;
   o backend valida no endpoint e responde 403.** **Por quê:** o front sozinho é contornável
   chamando a API direto; o backend sozinho deixa o usuário ver botões que falham.

2. **Rotas sensíveis de `/api/db` usam `withPermission`, não só `withSession`.**

3. **Ação sem permissão some; não fica desabilitada.** Página usa `RequirePermission`; ação usa
   `hasPermission`. Sidebar esconde grupos que ficam vazios.

4. **Código de permissão no formato `acao-recurso`** (ex.: `list-case`, `edit-product`), agrupado
   em módulos (`permission_modules`) só para a matriz da UI.

5. **Permissões efetivas vêm sempre do join papel → permissão.** Usuário novo pode ficar sem papel
   (lista vazia) até alguém atribuir.

6. **Hierarquia de perfis (`hierarchyLevel`, menor = mais autoridade) limita delegação:** quem
   está no nível N só gerencia perfis e usuários de nível estritamente maior que N, nunca altera o
   próprio perfil e só concede permissões que já tem (matriz híbrida). **Por quê:** impedir
   escalada de privilégio por quem administra perfis.

7. **Permissão nova acompanha um seed SQL em `db/scripts/seed-*-rbac.sql`** (padrão seguido até
   hoje para projetos, produtos, liberações, melhorias, anexos e documentação).
