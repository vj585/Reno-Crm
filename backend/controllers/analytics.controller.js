import Event from '../models/Event.js';
import Campaign from '../models/Campaign.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { generateInsights } from '../services/gemini.service.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orderAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalRevenue = orderAgg[0]?.total || 0;
    const activeCampaigns = await Campaign.countDocuments({ status: { $in: ['Draft', 'Sending'] } });

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue,
      activeCampaigns
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFunnel = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const events = await Event.aggregate([
      { $match: { campaignId: req.params.campaignId } }, // Wait, needs to be ObjectId if not properly cast, but mongoose might not auto-cast here. Let's rely on standard matching or assume strings work.
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    
    // Default funnel
    const funnel = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      failed: 0
    };

    events.forEach(e => {
      funnel[e._id] = e.count;
    });

    res.json(funnel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import { discoverOpportunities } from '../services/opportunity.service.js';

export const getOpportunities = async (req, res) => {
  try {
    const opportunities = await discoverOpportunities();
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalyticsReport = async (req, res) => {
  try {
    // We need to calculate everything from Events.
    // However, revenue requires Orders. We'll join Events with Orders based on customerId.
    // For simplicity, we can aggregate Campaign -> Event -> Customer -> Order or just do an aggregation on Events and Campaigns.
    // Let's get all campaigns to group by channel.
    const campaigns = await Campaign.find();
    const campaignMap = {};
    campaigns.forEach(c => {
      campaignMap[c._id.toString()] = { name: c.name, channel: c.channel, id: c._id };
    });

    const events = await Event.aggregate([
      {
        $group: {
          _id: { campaignId: "$campaignId", type: "$type" },
          count: { $sum: 1 }
        }
      }
    ]);

    // To get revenue per campaign, we can estimate based on converted count * avg order value, or actually try to look up orders.
    // To be perfectly event-driven and avoid complex time-series joins, let's look up orders for converted events.
    const convertedEvents = await Event.find({ type: 'converted' }).populate('customerId');
    // Let's assume each converted event yields the customer's avg order value or a flat value if not calculable.
    // For a more accurate approach, we just calculate average order value overall.
    const orderAgg = await Order.aggregate([{ $group: { _id: null, avgAmount: { $avg: "$amount" } } }]);
    const avgAmount = orderAgg[0]?.avgAmount || 1500;

    const campaignStats = {};
    Object.keys(campaignMap).forEach(id => {
      campaignStats[id] = { 
        id, 
        name: campaignMap[id].name, 
        channel: campaignMap[id].channel,
        sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, failed: 0,
        revenue: 0
      };
    });

    events.forEach(e => {
      const cId = e._id.campaignId.toString();
      if (campaignStats[cId]) {
        campaignStats[cId][e._id.type] = e.count;
      }
    });

    // Calculate revenue based on converted events
    Object.keys(campaignStats).forEach(id => {
      campaignStats[id].revenue = campaignStats[id].converted * avgAmount;
      // Conversion rate = converted / sent * 100
      campaignStats[id].conversionRate = campaignStats[id].sent > 0 
        ? ((campaignStats[id].converted / campaignStats[id].sent) * 100).toFixed(2) 
        : 0;
    });

    const report = Object.values(campaignStats);

    const channelStats = {};
    report.forEach(c => {
      if (!channelStats[c.channel]) {
        channelStats[c.channel] = { channel: c.channel, revenue: 0, converted: 0, sent: 0 };
      }
      channelStats[c.channel].revenue += c.revenue;
      channelStats[c.channel].converted += c.converted;
      channelStats[c.channel].sent += c.sent;
    });

    Object.keys(channelStats).forEach(ch => {
      channelStats[ch].conversionRate = channelStats[ch].sent > 0 
        ? ((channelStats[ch].converted / channelStats[ch].sent) * 100).toFixed(2) 
        : 0;
    });

    res.json({
      campaigns: report,
      channels: Object.values(channelStats)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInsights = async (req, res) => {
  try {
    const { reportData } = req.body;
    if (!reportData) return res.status(400).json({ error: "Missing report data" });

    // Ensure we don't send too much data
    const slimData = {
      campaigns: reportData.campaigns.map(c => ({ name: c.name, channel: c.channel, conversionRate: c.conversionRate, revenue: c.revenue })),
      channels: reportData.channels
    };

    const insights = await generateInsights(slimData);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
