/**
<<<<<<< HEAD
 * API Serverless Function: /api/checkout
 * 
 * Descrição:
 *  Esta função Vercel Serverless recebe a lista de presentes do carrinho,
 *  valida os itens e valores, gera um pedido com NSU único e comunica-se
 *  com a API oficial de Checkout da InfinitePay para criar a sessão de pagamento.
 * 
 *  Tag da InfinitePay utilizada: labellaesteticaebeleza (configurável via INFINITE_TAG no .env)
 */

const https = require('https');

/**
 * Função auxiliar para realizar requisições HTTP/HTTPS POST nativas (sem dependência externa)
 * @param {string} url - URL de destino
 * @param {object} payload - Corpo da requisição em formato JSON
 * @returns {Promise<object>} Objeto JSON retornado pela API
 */
function postJSON(url, payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const parsedUrl = new URL(url);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({
              statusCode: res.statusCode,
              response: parsed || body
            });
          }
        } catch (err) {
          reject({
            statusCode: res.statusCode,
            error: 'Falha ao analisar resposta da InfinitePay',
            raw: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject({ statusCode: 500, error: err.message });
    });

    req.write(dataString);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // Configuração de CORS para permitir chamadas do front-end
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tratamento de requisição preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Permite apenas requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido. Utilize o método POST.'
    });
  }

  try {
    // Extração do corpo da requisição
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { items, customer } = body || {};

    // 1. Validação de dados de entrada
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'O carrinho está vazio ou os itens enviados são inválidos.'
      });
    }

    // 2. Formatação dos itens para o padrão da InfinitePay (preço em centavos)
    const formattedItems = [];
    let calculatedTotalCents = 0;

    for (const item of items) {
      const itemTitle = (item.title || item.name || 'Presente de Casamento').trim();
      const rawValue = typeof item.value === 'number' ? item.value : parseFloat(item.value || item.price || 0);
      const qty = parseInt(item.qty || item.quantity || 1, 10);

      if (isNaN(rawValue) || rawValue <= 0) {
        return res.status(400).json({
          success: false,
          error: `O valor do presente "${itemTitle}" é inválido.`
        });
      }

      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          error: `A quantidade do presente "${itemTitle}" é inválida.`
        });
      }

      const priceInCents = Math.round(rawValue * 100);
      calculatedTotalCents += priceInCents * qty;

      formattedItems.push({
        name: itemTitle,
        price: priceInCents,
        quantity: qty
      });
    }

    // Tag / Handle da conta InfinitePay (Padrão: labellaesteticaebeleza)
    const infiniteTag = (process.env.INFINITE_TAG || 'labellaesteticaebeleza').replace('$', '').trim();

    // Determina a URL base da aplicação para redirecionamento
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

    // Identificador único do pedido (NSU)
    const orderNsu = `WEDDING-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Estruturação do Payload oficial da API InfinitePay
    const infinitePayPayload = {
      handle: infiniteTag,
      order_nsu: orderNsu,
      redirect_url: `${baseUrl}/?status=success&nsu=${orderNsu}`,
      webhook_url: `${baseUrl}/api/webhook`,
      items: formattedItems
    };

    // Adiciona dados opcionais do comprador se fornecidos
    if (customer && typeof customer === 'object') {
      infinitePayPayload.customer = {
        name: customer.name || undefined,
        email: customer.email || undefined,
        phone_number: customer.phone || undefined
      };
    }

    // URL direta oficial da InfinitePay
    const directCheckoutUrl = `https://pay.infinitepay.io/${infiniteTag}`;

    // 4. Chamada à API de Checkout da InfinitePay
    const infinitePayUrl = 'https://api.checkout.infinitepay.io/links';
    
    let result;
    try {
      result = await postJSON(infinitePayUrl, infinitePayPayload);
    } catch (apiError) {
      console.error('Erro na resposta da API InfinitePay:', apiError);
      return res.status(200).json({
        success: true,
        url: directCheckoutUrl,
        fallback: true
      });
    }

    // 5. Retorna a URL do Checkout da InfinitePay criada com sucesso
    const checkoutUrl = result.url || result.checkout_url || result.link;

    if (!checkoutUrl) {
      return res.status(200).json({
        success: true,
        url: directCheckoutUrl
      });
    }

    return res.status(200).json({
      success: true,
      url: checkoutUrl,
      order_nsu: orderNsu
    });

  } catch (error) {
    console.error('Erro interno no servidor de checkout:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar o checkout de presentes. Tente novamente em instantes.'
    });
  }
};
=======
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
>>>>>>> 1bfdff6263cbf7b73d5b943589e0024e0fcf8ec4
