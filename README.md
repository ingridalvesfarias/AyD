# Site de Casamento de Alyne & Douglas 💍

Este repositório contém o site oficial do casamento de **Alyne & Douglas** (12 de Setembro de 2026), equipado com confirmação de presença (RSVP), mural de recados e uma **lista de presentes simbólica integrada ao Checkout da InfinitePay**.

---

## 🛠️ Tecnologias Utilizadas

- **Front-end**: HTML5, CSS3 Vanilla (Design responsivo e Dark/Light Mode), JavaScript ES6+.
- **Back-end**: Vercel Serverless Functions (Node.js).
- **Processador de Pagamento**: [InfinitePay Checkout API](https://www.infinitepay.io/checkout).
- **Hospedagem**: Vercel.

---

## 💡 Como Funciona o Checkout de Presentes

1. **Seleção de Presentes**: O convidado escolhe um ou mais presentes na lista e adiciona ao carrinho.
2. **Cálculo de Total**: O carrinho calcula automaticamente o valor total dos presentes em R$.
3. **Chamada Serverless (`/api/checkout`)**: Ao clicar em *"Finalizar Presente"*, o JavaScript envia a lista de itens para a Serverless Function hospedada na Vercel.
4. **Integração InfinitePay**: A APIServerless faz uma chamada HTTPS para `https://api.checkout.infinitepay.io/links` com a InfiniteTag dos noivos (`labellaesteticaebeleza`) e converte os valores para centavos.
5. **Redirecionamento**: A API devolve a URL única do checkout e o front-end redireciona o convidado para a tela segura da InfinitePay.
6. **Pagamento Direto**: O convidado realiza o pagamento via Pix ou Cartão de Crédito e o valor cai diretamente na conta dos noivos.

> ℹ️ **Importante**: A lista de presentes é **100% simbólica**. Não há controle de estoque, banco de dados ou bloqueio de itens. Múltiplos convidados podem presentear o mesmo item quantas vezes quiserem.

---

## 📁 Estrutura de Arquivos

```text
/
├── api/
│   ├── checkout.js    # Vercel Function: Gera link de pagamento InfinitePay
│   └── webhook.js     # Vercel Function: Recebe notificações de status da transação
├── assets/            # Imagens dos noivos, padrinhos e recursos estáticos
├── img/               # Imagens ilustrativas dos presentes da lista
├── .env.example       # Exemplo de variáveis de ambiente
├── index.html         # Estrutura HTML5 da aplicação
├── package.json       # Dependências e scripts de desenvolvimento
├── README.md          # Documentação do projeto
├── script.js          # Lógica principal front-end e comunicação com a API
└── style.css          # Estilização visual completa (Tema claro e escuro)
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou configure no painel da Vercel) com base no `.env.example`:

```env
# InfiniteTag cadastrada no App da InfinitePay (sem o símbolo $)
INFINITE_TAG=labellaesteticaebeleza

# URL base da sua aplicação publicada na Vercel
APP_URL=https://seu-site.vercel.app
```

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js versão 18 ou superior instalada.
- CLI da Vercel (`npm i -g vercel`).

### Passo a Passo

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute o ambiente local da Vercel:
   ```bash
   vercel dev
   ```

3. Acesse no seu navegador a URL exibida no terminal (geralmente `http://localhost:3000`).

---

## 🌐 Implantação (Deploy na Vercel)

1. Faça o push do código para o seu repositório Git (GitHub / GitLab / Bitbucket).
2. Importe o projeto no dashboard da **Vercel**.
3. Em **Environment Variables**, adicione:
   - `INFINITE_TAG` = `labellaesteticaebeleza`
   - `APP_URL` = `https://seu-dominio-customizado.com.br` (ou a URL gerada pela Vercel).
4. Clique em **Deploy**. A Vercel detectará automaticamente as funções em `/api/*.js` e disponibilizará a aplicação pronta para produção.
