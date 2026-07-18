/**
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
