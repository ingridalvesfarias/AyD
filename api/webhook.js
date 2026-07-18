/**
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
