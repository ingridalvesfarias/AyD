/**
 * /api/checkout.js
 * ------------------------------------------------------------------
 * Vercel Serverless Function (Node.js) responsável por criar um
 * Checkout na InfinitePay a partir do carrinho de presentes montado
 * no frontend.
 *
 * Não usa Express: segue o formato nativo de "Vercel Functions"
 * (module com export default recebendo req/res).
 *
 * Fluxo desta rota:
 *   1. Recebe do frontend: { items, total, description }
 *   2. Valida o payload (itens, valores, quantidades e total).
 *   3. Monta a requisição no formato exigido pela InfinitePay
 *      (preços em centavos) e cria o link de pagamento via API.
 *   4. Devolve para o frontend a URL do Checkout, para redirecionamento.
 *
 * ------------------------------------------------------------------
 * Contrato oficial da API "Checkout Integrado" da InfinitePay
 * (conferido em https://www.infinitepay.io/checkout-documentacao,
 * documentação interativa, seção "Como funciona a integração?"):
 *
 *   Endpoint:      POST https://api.checkout.infinitepay.io/links
 *
 *   Request body:
 *     {
 *       "handle":       string,            // obrigatório — InfiniteTag, sem "$"
 *       "items": [                          // obrigatório — pelo menos 1 item
 *         {
 *           "quantity":    number,          // obrigatório
 *           "price":       number,          // obrigatório — em CENTAVOS
 *           "description": string           // obrigatório
 *         }
 *       ],
 *       "order_nsu":     string,            // opcional — se omitido, a InfinitePay gera um valor aleatório
 *       "redirect_url":  string,            // opcional — URL de retorno após o pagamento
 *       "webhook_url":   string,            // opcional — URL para notificação automática de pagamento
 *       "customer":      { "name", "email", "phone_number" }, // opcional — não usado aqui (sem coleta de dados do comprador no site)
 *       "address":       { "cep", "street", "neighborhood", "number", "complement" } // opcional — não usado aqui (sem entrega física)
 *     }
 *
 *   Response (sucesso):
 *     { "url": "https://checkout.infinitepay.com.br/..." }
 *
 * Nenhum campo, nome de propriedade ou nome de endpoint abaixo foi
 * inventado: todos correspondem literalmente aos exemplos de request/
 * response publicados na documentação oficial acima.
 * ------------------------------------------------------------------
 *
 * Importante (regra de negócio do site):
 *   - Os presentes são simbólicos. NÃO há controle de estoque,
 *     disponibilidade ou "presente vendido". Qualquer pessoa pode
 *     presentear o mesmo item quantas vezes quiser.
 *   - Por isso esta função não usa banco de dados: cada requisição é
 *     independente e apenas repassa os dados para a InfinitePay.
 * ------------------------------------------------------------------
 */

// Endpoint oficial da InfinitePay para criação de links de Checkout
// ("Checkout Integrado"). Fonte: https://www.infinitepay.io/checkout-documentacao
const INFINITEPAY_LINKS_URL = 'https://api.checkout.infinitepay.io/links';

// InfiniteTag do casal (handle), sem o símbolo "$".
// Pode ser sobrescrita pela variável de ambiente INFINITEPAY_HANDLE na Vercel,
// mas já vem com este valor padrão para o checkout funcionar mesmo que a
// variável de ambiente não tenha sido configurada no projeto.
const DEFAULT_INFINITEPAY_HANDLE = 'labellaesteticaebeleza';

// Tolerância (em reais) usada ao comparar o total enviado pelo cliente
// com o total recalculado no servidor, para absorver arredondamentos.
const TOTAL_TOLERANCE = 0.01;

/**
 * Converte um valor em reais (ex.: 199.9) para centavos (ex.: 19990),
 * formato exigido pela API da InfinitePay.
 */
function toCents(valueInReais) {
  return Math.round(Number(valueInReais) * 100);
}

/**
 * Valida o carrinho recebido do frontend.
 * Retorna uma mensagem de erro (string) se algo estiver inválido,
 * ou `null` quando tudo está correto.
 */
function validateCart(items, total) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'O carrinho está vazio ou não foi enviado corretamente.';
  }

  for (const item of items) {
    if (!item || typeof item.title !== 'string' || !item.title.trim()) {
      return 'Todo presente do carrinho precisa de um título válido.';
    }

    if (typeof item.value !== 'number' || !Number.isFinite(item.value) || item.value <= 0) {
      return `Valor inválido para o presente "${item.title}".`;
    }

    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty <= 0) {
      return `Quantidade inválida para o presente "${item.title}".`;
    }
  }

  if (typeof total !== 'number' || !Number.isFinite(total) || total <= 0) {
    return 'O valor total do carrinho é inválido.';
  }

  // Confere se o total enviado bate com a soma dos itens, evitando
  // que um valor adulterado no cliente seja aceito pelo servidor.
  const calculatedTotal = items.reduce((sum, item) => sum + item.value * Number(item.qty), 0);
  if (Math.abs(calculatedTotal - total) > TOTAL_TOLERANCE) {
    return 'O valor total não confere com a soma dos itens do carrinho.';
  }

  return null;
}

/**
 * Monta a URL pública do site a partir das variáveis de ambiente,
 * com fallback para o host da própria requisição (útil em previews
 * da Vercel, onde a URL muda a cada deploy).
 */
function resolveSiteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}`;
}

export default async function handler(req, res) {
  // Esta rota só aceita POST — é aqui que o carrinho é enviado.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  // A InfiniteTag (handle) do casal é obrigatória para criar o checkout.
  // Usa a variável de ambiente se configurada; caso contrário, cai no
  // handle padrão definido acima (DEFAULT_INFINITEPAY_HANDLE).
  const handle = process.env.INFINITEPAY_HANDLE || DEFAULT_INFINITEPAY_HANDLE;

  const siteUrl = resolveSiteUrl(req);
  const redirectUrl = process.env.INFINITEPAY_REDIRECT_URL || `${siteUrl}/?pagamento=sucesso`;
  const webhookUrl = process.env.INFINITEPAY_WEBHOOK_URL || `${siteUrl}/api/webhook`;

  try {
    const { items, total } = req.body || {};

    const validationError = validateCart(items, total);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Converte os itens do carrinho para o formato exigido pela InfinitePay:
    // { quantity, price (em centavos), description } — exatamente os três
    // campos documentados em "Itens do Pedido" na documentação oficial.
    const infinitePayItems = items.map((item) => ({
      quantity: Number(item.qty),
      price: toCents(item.value),
      description: item.title.trim()
    }));

    // Identificador único do pedido no nosso "sistema". Como não há banco
    // de dados, geramos um NSU baseado em tempo + aleatoriedade, apenas
    // para rastreio no painel da InfinitePay e no webhook.
    const orderNsu = `wedding-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const infinitePayPayload = {
      handle,
      redirect_url: redirectUrl,
      webhook_url: webhookUrl,
      order_nsu: orderNsu,
      items: infinitePayItems
    };

    const infinitePayResponse = await fetch(INFINITEPAY_LINKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(infinitePayPayload)
    });

    const infinitePayData = await infinitePayResponse.json().catch(() => null);

    if (!infinitePayResponse.ok || !infinitePayData || !infinitePayData.url) {
      console.error(
        '[api/checkout] Resposta inesperada da InfinitePay:',
        infinitePayResponse.status,
        infinitePayData
      );
      return res.status(502).json({
        error: 'Não foi possível criar o checkout no momento. Tente novamente em instantes.'
      });
    }

    // Sucesso: devolve a URL de pagamento para o frontend redirecionar o usuário.
    return res.status(200).json({
      url: infinitePayData.url,
      order_nsu: orderNsu
    });
  } catch (err) {
    console.error('[api/checkout] Erro inesperado ao criar checkout:', err);
    return res.status(500).json({ error: 'Erro interno ao processar o pagamento. Tente novamente.' });
  }
}
