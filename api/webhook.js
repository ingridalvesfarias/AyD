/**
<<<<<<< HEAD
 * API Serverless Function: /api/webhook
 * 
 * Descrição:
 *  Esta função Vercel Serverless recebe notificações assíncronas (webhooks) da InfinitePay
 *  quando o status de um pagamento é atualizado (ex: aprovado, pendente, cancelado).
 */

module.exports = async function handler(req, res) {
  // Configuração de cabeçalhos para CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Suporte a preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Permite apenas o método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido.'
    });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Log do evento para monitoramento na Vercel
    console.log('Webhook InfinitePay recebido:', JSON.stringify(payload, null, 2));

    // Processamento da notificação
    const { order_nsu, transaction_id, status, paid_amount } = payload || {};

    console.log(`Status do Pedido ${order_nsu || 'N/A'}: ${status || 'desconhecido'} | Valor: R$ ${paid_amount ? (paid_amount / 100).toFixed(2) : '0.00'}`);

    // Como os presentes são 100% simbólicos, não há alteração de estoque nem bloqueio de itens.
    // Retorna HTTP 200 para confirmar o recebimento do webhook à InfinitePay.
    return res.status(200).json({
      success: true,
      message: 'Notificação de webhook processada com sucesso.',
      received_nsu: order_nsu || null
    });

  } catch (error) {
    console.error('Erro ao processar webhook da InfinitePay:', error);
    return res.status(400).json({
      success: false,
      error: 'Falha ao processar dados do webhook.'
    });
  }
};
=======
 * /api/webhook.js
 * ------------------------------------------------------------------
 * Vercel Serverless Function (Node.js) que recebe as notificações
 * automáticas de pagamento enviadas pela InfinitePay assim que um
 * presente é pago (Pix ou Cartão).
 *
 * ------------------------------------------------------------------
 * Contrato oficial do Webhook da InfinitePay
 * (conferido em https://www.infinitepay.io/checkout-documentacao,
 * seção "Webhook URL (Opcional)" / "Como responder ao webhook"):
 *
 *   Corpo recebido (POST, enviado pela InfinitePay para a webhook_url
 *   configurada na criação do checkout):
 *     {
 *       "invoice_slug":    string,
 *       "amount":          number,   // em centavos
 *       "paid_amount":     number,   // em centavos
 *       "installments":    number,
 *       "capture_method":  "credit_card" | "pix",
 *       "transaction_nsu": string,
 *       "order_nsu":       string,
 *       "receipt_url":     string,
 *       "items":           array
 *     }
 *
 *   Resposta esperada por nós:
 *     - Tudo certo:  HTTP 200 com { "success": true,  "message": null }
 *     - Deu errado:  HTTP 400 com { "success": false, "message": "..." }
 *       (a InfinitePay reenvia a notificação quando recebe 400)
 *
 * Nenhum nome de campo abaixo foi inventado: todos correspondem
 * literalmente ao exemplo de payload de webhook publicado na
 * documentação oficial acima.
 * ------------------------------------------------------------------
 *
 * Regras importantes desta rota:
 *   - Deve responder rapidamente (idealmente em menos de 1 segundo).
 *   - Responder 200 confirma o recebimento; a InfinitePay reenvia a
 *     notificação automaticamente se receber um status de erro (400).
 *   - Como o site NÃO controla estoque/disponibilidade de presentes,
 *     este webhook apenas registra o pagamento nos logs da Vercel —
 *     não há banco de dados nem lógica de bloqueio de presentes.
 * ------------------------------------------------------------------
 */

export default async function handler(req, res) {
  // A InfinitePay envia a notificação via POST.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Método não permitido. Use POST.' });
  }

  try {
    const payload = req.body || {};
    const {
      invoice_slug: invoiceSlug,
      amount,
      paid_amount: paidAmount,
      installments,
      capture_method: captureMethod,
      transaction_nsu: transactionNsu,
      order_nsu: orderNsu,
      receipt_url: receiptUrl,
      items
    } = payload;

    // Validação mínima: sem order_nsu não há como identificar o pedido.
    if (!orderNsu) {
      console.warn('[api/webhook] Notificação recebida sem order_nsu:', payload);
      return res.status(400).json({ success: false, message: 'order_nsu ausente na notificação.' });
    }

    // Registra o pagamento nos logs da Vercel (Dashboard > Deployments > Functions).
    // Não há persistência em banco de dados propositalmente — a lista de
    // presentes continua sempre disponível para todos os convidados.
    console.log('[api/webhook] Pagamento confirmado pela InfinitePay:', {
      orderNsu,
      transactionNsu,
      invoiceSlug,
      amount,
      paidAmount,
      installments,
      captureMethod,
      receiptUrl,
      items
    });

    // Responde 200 para confirmar o recebimento e evitar reenvios.
    return res.status(200).json({ success: true, message: null });
  } catch (err) {
    console.error('[api/webhook] Erro ao processar notificação de pagamento:', err);
    // Retornar 400 aqui é intencional: sinaliza para a InfinitePay tentar reenviar.
    return res.status(400).json({ success: false, message: 'Erro ao processar a notificação.' });
  }
}
>>>>>>> 1bfdff6263cbf7b73d5b943589e0024e0fcf8ec4
