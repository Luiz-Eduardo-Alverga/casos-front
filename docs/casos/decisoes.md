# Casos — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: `CONTEXTO_SOFTFLOW` e `PADRAO_CASOS`,
consolidados em 2026-11-17.

1. **Caso nunca é chamado de "ticket" na UI.** Ticket existe só no contexto de cliente, como aba à
   parte. Report não é "bug". **Por quê:** é o vocabulário do time; misturar confunde com os
   tickets de suporte dos clientes.

2. **Report e caso compartilham o backend `projeto-casos`; a diferença é `tipo_abertura = REPORT`
   e os campos de análise/SLA.** Edição de report reutiliza a tela de caso com layout próprio.

3. **Casos, Reports, Projetos e Liberações não são reimplementados do zero:** proposta nova encaixa
   no que existe.

4. **Quando um arquivo vira pasta, o caminho antigo fica como arquivo ponte (re-export)** para não
   quebrar imports (seção "Caminhos legados" do README).

5. **Número de caso aceita até 6 dígitos nas relações** (commit `46e65cb`).
