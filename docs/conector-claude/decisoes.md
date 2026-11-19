# Conector do Claude — decisões travadas

Não reabrir sem o usuário decidir de novo. Origem: chat de planejamento da abertura de casos pelo
Claude, 2026-11-19, com protótipo em [`prototipo/`](prototipo/).

1. **A abertura pelo Claude é um conector MCP do próprio Softflow (`/api/mcp`), não um link
   pré-preenchido para `/casos/novo`.** **Por quê:** o usuário quer abrir o caso sem sair do chat.
   O link ainda obrigaria a abrir a plataforma, e o Claude na nuvem não alcança a API do Softflow
   por outro caminho que não seja um conector. É também a "integração por API" que a skill
   `planejar-softcom` já prevê no passo 7.

2. **Escopo da primeira entrega: abrir e consultar caso.** Reports, edição, status, anexos e
   produção ficam de fora. **Por quê:** escolha do usuário. O fluxo que dói é o do PO no fim do
   planejamento, que abre caso. Report tem SLA, cliente e responsável de suporte, e merece
   planejamento próprio.

3. **O Softflow é o servidor de autorização (OAuth 2.1 com DCR e PKCE) e o servidor MCP.** A API
   Soft Flow não muda. **Por quê:** é o que o Claude exige de um conector remoto com login por
   pessoa, e o Softflow já é o BFF que conhece o login e as permissões. Pedir mudança no legado
   atrasaria a entrega.

4. **Só os endereços de retorno do Claude são aceitos** (`https://claude.ai/api/mcp/auth_callback`
   e `https://claude.com/api/mcp/auth_callback`), por igualdade exata, no registro e na
   autorização. **Por quê:** o conector é só para o Claude. Aceitar qualquer endereço
   abriria espaço para um site de terceiros pedir acesso em nome de alguém da squad.

5. **Não há permissão nova para conectar.** Qualquer pessoa logada conecta; cada ferramenta usa
   as permissões que a pessoa já tem (`create-case` para preparar e abrir, `list-case` para
   consultar), recalculadas no servidor a cada chamada. Sem `create-case`, a tela de autorização
   avisa que o Claude só vai consultar. **Por quê:** o usuário quer o conector para toda a squad.
   Repetir no conector o RBAC que já existe evita duas regras para a mesma ação.

6. **Abrir caso é sempre em dois passos: prévia, depois abertura pelo código da prévia.** O caso
   é criado exatamente com o payload da prévia; o código vale 15 minutos e é de uso único (usar
   de novo devolve o mesmo caso, sem criar outro). **Por quê:** garante que a pessoa viu e
   confirmou no chat o que vai ser criado, e evita caso duplicado se o Claude repetir a chamada.

7. **O conector usa um token Soft Flow próprio, obtido no "Permitir acesso" a partir da sessão do
   navegador, guardado cifrado e renovado pelo servidor.** O Softflow nunca recebe nem guarda a
   senha. **Por quê:** é o único jeito de agir em nome da pessoa sem mudar o legado. Separar do
   cookie evita que o conector dependa da sessão do navegador. Sujeito às perguntas 1 a 3 do
   README sobre o comportamento do `POST /auth/refresh`.

8. **Caso aberto pelo conector leva em Informações adicionais a linha "Aberto pelo Claude
   (conector Softflow) por <nome>."** **Por quê:** o legado não tem campo de origem do canal, e
   quem atende o caso precisa saber que ele veio do chat (e de quem), sem depender de log do
   servidor.

9. **A tela de autorização usa o layout do login (fora do shell) e o CTA amarelo "Permitir
   acesso".** **Por quê:** a pessoa chega ali vinda do Claude, muitas vezes logo depois do login.
   O amarelo de marca é permitido nas superfícies de login, e o shell do dashboard nessa tela
   confundiria (menu clicável no meio de um fluxo de autorização).

10. **A conexão aparece e é desfeita no menu do usuário (item "Claude" → modal "Conexão com o
    Claude"), não numa página de Configurações.** **Por quê:** Configurações hoje é de admin
    (usuários, perfis, prompts). A conexão é pessoal, como "Notificações no Discord", que já mora
    nesse menu.

11. **Uma conexão ativa por pessoa.** Conectar de novo revoga a anterior. **Por quê:** a pessoa
    usa uma conta do Claude, e uma conexão só deixa o modal e a revogação
    simples.

12. **Cada pessoa adiciona o conector na própria conta do Claude (Pro ou Max), como conector
    personalizado pelo endereço `https://softflow.softcom.services/api/mcp`.** (Domínio revogado pela decisão #13.) Não há Owner nem
    configuração central. **Por quê:** a squad usa contas pessoais do Claude, não um plano
    Team/Enterprise (informado pelo usuário em 2026-11-19). O servidor e o login são os mesmos
    nos dois cenários; só muda quem cadastra o endereço. Por isso o modal "sem conexão" mostra o
    endereço com botão de copiar como passo principal. No plano Free cabe um só conector
    personalizado.

13. **O endereço canônico do conector é `https://softflow.hostsoftcom.cloud/api/mcp`.** O domínio
    vem da variável `SOFTFLOW_PUBLIC_URL`, não fica fixo no código. Atualiza o domínio citado na
    decisão #12, que continua valendo no resto. **Por quê:** o usuário informou em 2026-11-19 que
    `softflow.hostsoftcom.cloud` é o endereço atual e `softflow.softcom.services` é o antigo. O
    Claude exige que o `resource` dos metadados seja exatamente o endereço cadastrado, então só um
    domínio vale. Resposta da P3.
