import Campaign from '../models/Campaign.js';
import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';
import Communication from '../models/Communication.js';
import axios from 'axios';

export const createCampaign = async (req, res) => {
  try {
    const { name, segmentId, channel, message } = req.body;
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(404).json({ error: "Segment not found" });

    const campaign = await Campaign.create({
      name,
      segmentId,
      channel,
      message,
      audienceCount: segment.customerCount
    });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('segmentId').sort('-createdAt');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id).populate('segmentId');
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    if (campaign.status === 'Completed' || campaign.status === 'Sending') {
      return res.status(400).json({ error: "Campaign already sent or sending" });
    }

    campaign.status = 'Sending';
    await campaign.save();

    const customers = await Customer.find(campaign.segmentId.filters);
    
    // Simulate async dispatching to the client immediately, but handle it properly via await or proper background queue pattern.
    // In a real system, we'd enqueue to BullMQ here and return.
    // Since we don't have Redis/BullMQ, we'll process in robust batches asynchronously but safely.
    res.json({ message: "Campaign dispatch started", campaign });

    const channelUrl = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001/send';

    // Dispatch safely in background without blocking the response
    // Safe chunking implementation
    process.nextTick(async () => {
      try {
        const BATCH_SIZE = 50;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < customers.length; i += BATCH_SIZE) {
          const batch = customers.slice(i, i + BATCH_SIZE);
          
          const promises = batch.map(async (customer) => {
            const comm = await Communication.create({
              campaignId: campaign._id,
              customerId: customer._id,
              channel: campaign.channel,
              currentStatus: 'queued'
            });

            try {
              await axios.post(channelUrl, {
                communicationId: comm._id,
                campaignId: campaign._id,
                customerId: customer._id,
                channel: campaign.channel,
                message: campaign.message
              });
              return { success: true, comm };
            } catch (err) {
              console.error(`Failed to send to channel service for ${customer._id}:`, err.message);
              comm.currentStatus = 'failed';
              await comm.save();
              return { success: false, comm };
            }
          });

          const results = await Promise.allSettled(promises);
          
          for (const result of results) {
            if (result.status === 'fulfilled' && result.value.success) {
              successCount++;
            } else {
              failCount++;
            }
          }
        }
        
        console.log(`Campaign ${campaign._id} dispatch complete. Success: ${successCount}, Failed: ${failCount}`);
        campaign.status = 'Completed';
        await campaign.save();
      } catch (fatalError) {
        console.error(`Fatal error in background dispatch for campaign ${campaign._id}:`, fatalError);
        campaign.status = 'Failed';
        await campaign.save();
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
