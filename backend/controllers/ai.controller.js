import { generateMongoFilter, generateCampaignContent } from '../services/gemini.service.js';

export const generateSegmentFilter = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const filter = await generateMongoFilter(prompt);
    res.json({ filter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateCampaignMessage = async (req, res) => {
  try {
    const { segmentDescription, goal } = req.body;
    if (!segmentDescription || !goal) return res.status(400).json({ error: "Missing required fields" });

    const campaignData = await generateCampaignContent(segmentDescription, goal);
    res.json(campaignData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import { generateCopilotCampaign, explainOpportunity } from '../services/gemini.service.js';
import { recommendChannel } from '../services/channelRecommendation.service.js';

export const generateCopilotCampaignEndpoint = async (req, res) => {
  try {
    const { segmentName, audienceCount } = req.body;
    if (!segmentName || typeof audienceCount === 'undefined') {
      return res.status(400).json({ error: "Missing segmentName or audienceCount" });
    }

    // Call Gemini to generate the campaign details
    const campaignData = await generateCopilotCampaign(segmentName, audienceCount);
    
    // Use the recommendation engine if the AI picked something random, or just rely on AI if it's acting as strategist.
    // The prompt requires using backend logic for channel recommendations.
    // Let's assume broad reach if count > 1000, high engagement if win-back, etc.
    const audienceDetails = {
      engagementLevel: segmentName.toLowerCase().includes('active') ? 'high' : 'normal',
      isBroadReach: audienceCount > 1000,
      isProfessional: segmentName.toLowerCase().includes('b2b') || segmentName.toLowerCase().includes('business')
    };
    
    const recommended = recommendChannel(audienceDetails);
    
    // Override AI's channel recommendation with deterministic one, but keep AI's reasoning or mix it.
    campaignData.recommendedChannel = recommended.channel;
    campaignData.reasoning = recommended.reasoning + " " + campaignData.reasoning;

    res.json(campaignData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
