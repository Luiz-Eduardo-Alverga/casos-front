# Documentação (módulo) — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: `PADRAO_DOCUMENTACAO`, consolidado em
2026-11-17.

1. **Markdown escrito por usuário nunca é renderizado sem sanitização.** Uma implementação só:
   `components/docs/shared/markdown-view.tsx`, sempre com `remark-gfm` e `rehype-sanitize`.
   **Por quê:** o conteúdo vem de qualquer usuário com `create-doc`/`edit-doc` e é lido por todos;
   sem sanitizar, é XSS.

2. **Anexos de documento usam o mesmo bucket de anexos dos casos, com path `docs/{docId}/…`;
   metadados em `doc_attachments`.** Excluir o documento remove os anexos do storage.

3. **Tags persistidas normalizadas: minúsculo, sem acento, com hífen.** **Por quê:** evita tags
   duplicadas que só diferem na grafia.

4. **Filtros vivem na query string e fazem parte da chave `["docs", filtros]`.** **Por quê:** link
   compartilhável e cache por combinação de filtros.

5. **Histórico e anexos só buscam dados quando a aba está ativa.**

6. **Vínculos legados guardam `entityId` como texto e `entityLabel` como cache.** **Por quê:** as
   entidades vêm de origens diferentes (legado e Postgres), com ids de tipos diferentes.

7. **Permissões próprias:** `list-doc`, `create-doc` (também duplicar), `edit-doc` (também status
   e anexos), `delete-doc`, `manage-doc-category`. Listagem vazia só mostra CTA com `create-doc`.
