import { logger } from '@/utils/logger';

export class NOWPaymentsGateway {
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
      const { apiKey } = data.config;
      
      // In a real implementation, you would use NOWPayments API
      // For now, we'll simulate the response
      const transactionId = `now_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info(`NOWPayments payment created: ${transactionId}`);

      return {
        transactionId,
        paymentUrl: `https://nowpayments.io/payment/${transactionId}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://nowpayments.io/payment/${transactionId}`)}`
      };
    } catch (error) {
      logger.error('Error creating NOWPayments payment:', error);
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
      
      // In a real implementation, you would verify the signature
      // For now, we'll assume it's valid
      
      const paymentId = webhookData.payment_id;
      const status = this.mapStatus(webhookData.payment_status);
      const transactionId = webhookData.pay_address;

      logger.info(`NOWPayments webhook processed: ${paymentId} - ${status}`);

      return {
        paymentId,
        status,
        transactionId,
        gatewayResponse: webhookData
      };
    } catch (error) {
      logger.error('Error processing NOWPayments webhook:', error);
      throw error;
    }
  }

  private mapStatus(nowpaymentsStatus: string): string {
    // Map NOWPayments status to our status
    switch (nowpaymentsStatus) {
      case 'confirmed':
      case 'finished':
        return 'COMPLETED';
      case 'failed':
      case 'expired':
        return 'FAILED';
      case 'waiting':
      case 'confirming':
      default:
        return 'PENDING';
    }
  }
} 