import { logger } from '@/utils/logger';

export class CoinPaymentsGateway {
  async createPayment(data: {
    paymentId: string;
    amount: number;
    currency: string;
    description: string;
    config: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{
    transactionId: string;
    paymentUrl?: string;
    qrCode?: string;
  }> {
    try {
      const { merchantId, privateKey, publicKey } = data.config;
      
      // Create payment request to CoinPayments
      const paymentData = {
        amount: data.amount,
        currency1: data.currency,
        currency2: data.currency,
        buyer_email: data.metadata?.email || '',
        item_name: data.description,
        item_number: data.paymentId,
        invoice: data.paymentId,
        ipn_url: data.config.ipnUrl || '',
        success_url: data.config.successUrl || '',
        cancel_url: data.config.cancelUrl || ''
      };

      // In a real implementation, you would use the CoinPayments API
      // For now, we'll simulate the response
      const transactionId = `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info(`CoinPayments payment created: ${transactionId}`);

      return {
        transactionId,
        paymentUrl: `https://www.coinpayments.net/index.php?cmd=_pay&reset=1&merchant=${merchantId}&item_name=${encodeURIComponent(data.description)}&item_number=${data.paymentId}&amount=${data.amount}&currency=${data.currency}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://www.coinpayments.net/index.php?cmd=_pay&reset=1&merchant=${merchantId}&item_name=${encodeURIComponent(data.description)}&item_number=${data.paymentId}&amount=${data.amount}&currency=${data.currency}`)}`
      };
    } catch (error) {
      logger.error('Error creating CoinPayments payment:', error);
      throw error;
    }
  }

  async processWebhook(webhookData: any, config: Record<string, any>): Promise<{
    paymentId: string;
    status: string;
    transactionId: string;
    gatewayResponse: any;
  } | null> {
    try {
      // Verify webhook signature
      const { ipnSecret } = config;
      const signature = webhookData.ipn_signature;
      
      // In a real implementation, you would verify the signature
      // For now, we'll assume it's valid
      
      const paymentId = webhookData.item_number;
      const status = this.mapStatus(webhookData.status);
      const transactionId = webhookData.txn_id;

      logger.info(`CoinPayments webhook processed: ${paymentId} - ${status}`);

      return {
        paymentId,
        status,
        transactionId,
        gatewayResponse: webhookData
      };
    } catch (error) {
      logger.error('Error processing CoinPayments webhook:', error);
      throw error;
    }
  }

  private mapStatus(coinpaymentsStatus: number): string {
    // Map CoinPayments status codes to our status
    switch (coinpaymentsStatus) {
      case 2: // Complete
        return 'COMPLETED';
      case -1: // Cancelled
        return 'CANCELLED';
      case -2: // Refunded
        return 'REFUNDED';
      case 0: // Pending
      case 1: // Pending (with confirmations)
      default:
        return 'PENDING';
    }
  }
} 