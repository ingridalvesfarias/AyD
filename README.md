# 💍 Alyne & Douglas | Site de Casamento

Site de casamento elegante, moderno e responsivo para Alyne & Douglas, desenvolvido para apresentar a história do casal, confirmar presença (RSVP), exibir mural de recados e oferecer uma lista de presentes simbólica com checkout integrado via InfinitePay e Pix.

## 🚀 Sobre o Projeto

Este projeto foi criado como um site de casamento interativo de alta performance. O foco principal é a experiência do usuário, oferecendo uma navegação fluida para os convidados, contagem regressiva em tempo real, confirmação de presença via WhatsApp e arrecadação de presentes em dinheiro direto na conta dos noivos.

### Destaques da Página:

- **Design Responsivo & Elegante**: Adaptado para mobile, tablet e desktop com suporte a alternância de temas (Dark/Light Mode).
- **Navegação Suave**: Menu otimizado com Scroll Spy para navegação contínua entre as seções da mesma página.
- **Seções Completas**:
  - **Hero**: Apresentação dos noivos com contagem regressiva em tempo real até o grande dia (12 de Setembro de 2026).
  - **O Casal**: História dos noivos, versículo inspirador e guia de dress code (looks femininos, masculinos e o que evitar).
  - **Padrinhos**: Grid interativo com os padrinhos e madrinhas do casamento.
  - **Recepção**: Localização completa do evento no Buffet Ana Conceito (com mapa interativo) e indicações de espaços de beleza parceiros.
  - **Lista de Presentes Simbólica**: Carrinho interativo com cálculo automático do valor total, integração com o **Checkout da InfinitePay** (Pix e Cartão de Crédito) e opção de **Chave Pix Direta com WhatsApp**.
  - **Confirmação de Presença (RSVP)**: Formulário interativo com envio da confirmação direto para o WhatsApp dos noivos.
  - **Mural de Recados**: Mural de carinho com salvamento local no navegador.

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Semântica estruturada e acessível.
- **CSS3**: Estilização visual personalizada, layout responsivo (Flexbox/Grid), variáveis CSS e temas claro e escuro.
- **JavaScript (Vanilla ES6+)**: Interatividade do carrinho de presentes, modais, contagem regressiva em tempo real e mural de recados.
- **Node.js & Vercel Serverless Functions**: Back-end hospedado na Vercel em `/api/checkout.js` e `/api/webhook.js` para comunicação com a API da InfinitePay.
- **InfinitePay API**: Processamento online de pagamentos em tempo real via Pix e Cartão de Crédito.

## 📋 Como Executar

Este é um projeto híbrido (estático + Vercel Serverless Functions).

### Teste Local

1. Clone este repositório:
   ```bash
   git clone https://github.com/ingridalvesfarias/AyD.git
   cd AyD
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o ambiente de desenvolvimento da Vercel:
   ```bash
   npx vercel dev
   ```

4. Abra `http://localhost:3000` no seu navegador.

### Hospedagem na Vercel

Para hospedar o projeto gratuitamente na Vercel:
1. Conecte este repositório à sua conta na Vercel.
2. Configure a variável de ambiente:
   - `INFINITE_TAG` = `labellaesteticaebeleza`
3. O deploy será realizado automaticamente e as Serverless Functions estarão prontas para produção.

## 🤝 Contribuição

Este template foi criado com carinho para celebrar a união de Alyne & Douglas. Sinta-se à vontade para expandir as funcionalidades, personalizar os estilos CSS ou adaptar para outros eventos.

Desenvolvido por **INDI.dev** (Ingrid Farias) para transformar momentos especiais em experiências digitais inesquecíveis.
