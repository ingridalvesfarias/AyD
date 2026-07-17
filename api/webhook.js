/**
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
