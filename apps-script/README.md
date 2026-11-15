# Backend do RSVP (Google Sheets + Apps Script)

Custo zero. As respostas do RSVP e os recados dos presentes caem numa planilha do Google.

1. Crie uma planilha no Google Sheets (ex.: "Casamento — respostas").
2. Menu **Extensões › Apps Script**. Apague o conteúdo e cole o arquivo [`Code.gs`](./Code.gs).
   - Opcional: preencha `NOTIFY_EMAIL` para receber um e-mail a cada envio.
3. **Implantar › Nova implantação** › tipo **App da Web**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Autorize o acesso quando pedido e copie a **URL do app da Web** (termina em `/exec`).
5. Cole a URL em `appsScriptUrl` no arquivo `src/config.ts`, faça commit e push.

As abas **RSVP** e **Presentes** são criadas automaticamente no primeiro envio.

- A coluna **Possível duplicado** marca quando alguém confirma com um nome que já existe
  (ignorando acentos e maiúsculas) — nada é rejeitado, vocês decidem.
- Na aba **Presentes**, a coluna **Conferido no extrato?** é para vocês marcarem ao ver o Pix chegar.
- Ao alterar o `Code.gs`, use **Implantar › Gerenciar implantações › Editar › Nova versão**
  para manter a mesma URL.
