# Site de Casamento — Alyne & Douglas

Site estático (HTML, CSS e JavaScript puro) com integração de pagamentos via
**Checkout da InfinitePay**, rodando como **Vercel Functions** (sem Express e
sem servidor externo).

## O que foi alterado

O site em si (design, seções, contagem regressiva, RSVP, mural de recados,
carrinho de presentes etc.) **não foi modificado**. A única mudança de
funcionamento foi no botão final de pagamento:

- **Antes:** ao finalizar o carrinho, o site abria o WhatsApp dos noivos
  pedindo o comprovante do Pix ou solicitando um link de pagamento no cartão.
- **Agora:** ao finalizar o carrinho, o site chama a API interna
  `/api/checkout`, que cria um Checkout na InfinitePay e devolve uma URL de
  pagamento. O convidado é redirecionado para essa URL e paga com **Pix ou
  Cartão** diretamente no ambiente seguro da InfinitePay. O dinheiro cai
  direto na conta dos noivos.

### Regra de negócio mantida

A lista de presentes continua **puramente simbólica**:

- Os presentes **não** desaparecem, **não** são marcados como vendidos e
  **não** ficam indisponíveis.
- Não há estoque, banco de dados ou qualquer lógica de bloqueio.
- Se 50 pessoas presentearem a mesma Air Fryer, todas as 50 compras são
  processadas normalmente — o site apenas gera um Checkout novo a cada clique.

## Estrutura do projeto

```
/api
  checkout.js     → cria o Checkout na InfinitePay a partir do carrinho
  webhook.js       → recebe a confirmação automática de pagamento
index.html
script.js
style.css
package.json
.env.example
README.md
```

## Como funciona o fluxo de pagamento

1. O convidado escolhe um ou vários presentes; o carrinho (guardado no
   `localStorage`, como já era) soma o valor total.
2. Ao clicar em **"Finalizar Presente"**, o `script.js` chama:
   ```js
   const resposta = await fetch('/api/checkout', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ items, total, description })
   });
   const dados = await resposta.json();
   ```
3. `/api/checkout.js`:
   - Valida os itens, valores, quantidades e o total recebido.
   - Converte os valores de reais para **centavos** (exigência da InfinitePay).
   - Faz uma requisição `POST` para
     `https://api.checkout.infinitepay.io/links` com o `handle` (InfiniteTag)
     do casal e os itens do pedido.
   - Devolve `{ url, order_nsu }` para o frontend.
4. O frontend redireciona o navegador:
   ```js
   window.location = dados.url;
   ```
5. O convidado paga com Pix ou Cartão na página da InfinitePay e, ao concluir,
   pode retornar ao site pela `redirect_url` configurada.
6. Quando o pagamento é confirmado, a InfinitePay envia uma notificação
   `POST` para `/api/webhook.js`, que apenas registra o evento nos logs da
   Vercel (não há banco de dados nem alteração de disponibilidade de
   presentes).

## Auditoria contra a documentação oficial

A integração foi conferida campo a campo contra a documentação oficial da
InfinitePay, em três fontes independentes (todas com o mesmo exemplo de
request/response):

- Documentação interativa: <https://www.infinitepay.io/checkout-documentacao>
- Página do produto: <https://www.infinitepay.io/checkout>
- Central de Ajuda: <https://ajuda.infinitepay.io/pt-BR/articles/10766888-como-usar-o-checkout-da-infinitepay>

| Item                                   | Documentação oficial                                                              | Implementado em `api/checkout.js` / `api/webhook.js` |
| --------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Endpoint de criação do link              | `POST https://api.checkout.infinitepay.io/links`                                    | ✅ idêntico                                             |
| Campo `handle`                          | Obrigatório, InfiniteTag sem `$`                                                     | ✅ idêntico (via `INFINITEPAY_HANDLE`)                  |
| Campo `items[].quantity`                | Obrigatório, número                                                                  | ✅ idêntico                                             |
| Campo `items[].price`                   | Obrigatório, número **em centavos**                                                  | ✅ idêntico (`toCents`)                                 |
| Campo `items[].description`             | Obrigatório, string                                                                  | ✅ idêntico (sem truncamento artificial)                |
| Campo `order_nsu`                       | Opcional — se omitido, a InfinitePay gera um valor aleatório                         | ✅ enviado (gerado por nós, para rastreio)              |
| Campo `redirect_url`                    | Opcional                                                                             | ✅ enviado (com fallback configurável)                  |
| Campo `webhook_url`                     | Opcional                                                                             | ✅ enviado (com fallback configurável)                  |
| Campos `customer` / `address`           | Opcionais                                                                            | Não enviados (o site não coleta esses dados)            |
| Resposta de sucesso                     | `{ "url": "https://checkout.infinitepay.com.br/..." }`                              | ✅ idêntico                                             |
| Payload do webhook                      | `invoice_slug, amount, paid_amount, installments, capture_method, transaction_nsu, order_nsu, receipt_url, items` | ✅ idêntico (mesmos nomes de campo)                     |
| Resposta esperada ao webhook (sucesso)  | `200 OK` + `{ "success": true, "message": null }`                                    | ✅ idêntico                                             |
| Resposta esperada ao webhook (erro)     | `400 Bad Request` + `{ "success": false, "message": "..." }`                         | ✅ idêntico                                             |

Nenhum nome de endpoint ou de campo foi presumido: todos vêm literalmente dos
exemplos de `curl`/JSON publicados nessas páginas. Endpoints não usados pelo
site (ex.: `POST /payment_check`, para consulta manual de status) não foram
implementados por não fazerem parte do fluxo solicitado (o site usa apenas
webhook para confirmação).

## Configuração

### 1. Obtenha sua InfiniteTag (`handle`)

No App InfinitePay ou no painel web, copie sua InfiniteTag **sem o símbolo
`$`** no início.

### 2. Configure as variáveis de ambiente

Copie `.env.example` para `.env` (uso local) e/ou cadastre as mesmas
variáveis no painel da Vercel em
**Project → Settings → Environment Variables**:

| Variável                     | Obrigatória | Descrição                                                                 |
| ---------------------------- | ----------- | -------------------------------------------------------------------------- |
| `INFINITEPAY_HANDLE`         | Sim         | InfiniteTag do casal, sem o `$`.                                           |
| `SITE_URL`                   | Não         | URL pública do site. Se ausente, é detectada pelo host da requisição.      |
| `INFINITEPAY_REDIRECT_URL`   | Não         | Para onde o convidado volta após pagar. Padrão: `${SITE_URL}/?pagamento=sucesso`. |
| `INFINITEPAY_WEBHOOK_URL`    | Não         | URL que recebe a confirmação de pagamento. Padrão: `${SITE_URL}/api/webhook`. |

### 3. Deploy na Vercel

```bash
# Instale a CLI da Vercel, se ainda não tiver
npm i -g vercel

# Rode localmente (com Vercel Functions incluídas)
vercel dev

# Faça o deploy
vercel --prod
```

Como o projeto usa apenas HTML/CSS/JS puro + Vercel Functions nativas, não há
`build step` nem dependências de terceiros a instalar — o `package.json`
existe apenas para configurar o projeto como módulo ES (`"type": "module"`)
e o script `dev` de conveniência.

## Testando a integração

1. Rode `vercel dev` na raiz do projeto.
2. Abra o site, adicione presentes ao carrinho e clique em
   **"Finalizar Presente"**.
3. O modal mostrará "Preparando seu checkout seguro..." enquanto a API
   cria o link, e em seguida redirecionará para a InfinitePay.
4. Em caso de erro (ex.: `INFINITEPAY_HANDLE` não configurado, falha de
   rede, etc.), o modal exibe uma mensagem amigável e um botão
   **"Tentar novamente"**.

## Observações de segurança e boas práticas aplicadas

- **Validação no servidor:** a API nunca confia cegamente no valor total
  enviado pelo cliente — ela recalcula a soma dos itens e compara com o
  total recebido antes de criar o checkout.
- **Sem segredos expostos:** nenhuma chave de API é necessária no frontend;
  toda a comunicação com a InfinitePay acontece no backend (Vercel Function).
- **Tratamento de erros:** falhas de rede, respostas inesperadas da
  InfinitePay e payloads inválidos são tratados e comunicados ao usuário
  de forma clara, sem quebrar a experiência do site.
- **Sem duplicação:** a lógica de carrinho (soma, formatação de moeda,
  `localStorage`) permanece exatamente como estava — apenas o destino final
  do botão de pagamento foi trocado.
