import express from 'express';
import { ContentController } from '../controllers/ContentController';
import { verifyAdmin } from '../middleware/auth';
import { ValidationMiddleware } from '../middleware/validation';

const router = express.Router();
const contentController = new ContentController();

// Apply admin authentication to all routes
router.use(verifyAdmin);

// Banner routes
router.get('/banners', contentController.getBanners);
router.get('/banners/:id', contentController.getBanner);
router.post('/banners', 
  (ValidationMiddleware as any).validateBanner(),
  contentController.createBanner
);
router.put('/banners/:id', 
  (ValidationMiddleware as any).validateBannerUpdate(),
  contentController.updateBanner
);
router.delete('/banners/:id', contentController.deleteBanner);

// Banner tracking routes (public)
router.post('/banners/:id/impression', contentController.trackBannerImpression);
router.post('/banners/:id/click', contentController.trackBannerClick);

// Email template routes
router.get('/email-templates', contentController.getEmailTemplates);
router.get('/email-templates/:id', contentController.getEmailTemplate);
router.post('/email-templates', 
  (ValidationMiddleware as any).validateEmailTemplate(),
  contentController.createEmailTemplate
);
router.put('/email-templates/:id', 
  (ValidationMiddleware as any).validateEmailTemplateUpdate(),
  contentController.updateEmailTemplate
);
router.delete('/email-templates/:id', contentController.deleteEmailTemplate);
router.post('/email-templates/:id/send', 
  (ValidationMiddleware as any).validateEmailSend(),
  contentController.sendEmail
);

// Promotional content routes
router.get('/promotional-content', contentController.getPromotionalContent);
router.get('/promotional-content/:id', contentController.getPromotionalContentById);
router.post('/promotional-content', 
  (ValidationMiddleware as any).validatePromotionalContent(),
  contentController.createPromotionalContent
);
router.put('/promotional-content/:id', 
  (ValidationMiddleware as any).validatePromotionalContentUpdate(),
  contentController.updatePromotionalContent
);
router.delete('/promotional-content/:id', contentController.deletePromotionalContent);

// Statistics route
router.get('/stats', contentController.getContentStats);

export default router;

