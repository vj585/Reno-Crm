import express from 'express';
// Import controllers
import * as customersController from '../controllers/customers.controller.js';
import * as segmentsController from '../controllers/segments.controller.js';
import * as campaignsController from '../controllers/campaigns.controller.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import * as aiController from '../controllers/ai.controller.js';
import * as demoController from '../controllers/demo.controller.js';

const router = express.Router();

router.get('/dashboard', analyticsController.getDashboardStats);

router.post('/demo/generate', demoController.generateDemoData);

router.get('/customers', customersController.getCustomers);

router.post('/segments', segmentsController.createSegment);
router.get('/segments', segmentsController.getSegments);
router.post('/segments/preview', segmentsController.previewSegment); // Run filter to preview count

router.post('/campaigns', campaignsController.createCampaign);
router.get('/campaigns', campaignsController.getCampaigns);
router.post('/campaigns/:id/send', campaignsController.sendCampaign);

router.get('/analytics/funnel/:campaignId', analyticsController.getFunnel);
router.get('/analytics/opportunities', analyticsController.getOpportunities);
router.get('/analytics/report', analyticsController.getAnalyticsReport);
router.post('/analytics/insights', analyticsController.getInsights);

router.post('/ai/segment', aiController.generateSegmentFilter);
router.post('/ai/campaign', aiController.generateCampaignMessage);
router.post('/ai/copilot', aiController.generateCopilotCampaignEndpoint);

export default router;
