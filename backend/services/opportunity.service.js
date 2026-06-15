import Customer from '../models/Customer.js';
import Event from '../models/Event.js';
import { explainOpportunity } from './gemini.service.js';

export async function discoverOpportunities() {
  const opportunities = [];
  const now = new Date();
  
  // 1. Win-back: Customers who bought before but haven't in 45 days
  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(now.getDate() - 45);
  
  const winBackCustomers = await Customer.find({
    orderCount: { $gt: 0 },
    lastOrderDate: { $lte: fortyFiveDaysAgo }
  });
  
  if (winBackCustomers.length > 0) {
    const avgOrderValue = winBackCustomers.reduce((acc, c) => acc + (c.totalSpent / c.orderCount), 0) / winBackCustomers.length;
    const potentialRevenue = Math.round(winBackCustomers.length * avgOrderValue * 0.05); // Assume 5% conversion
    
    const explanation = await explainOpportunity('Win-Back', { count: winBackCustomers.length, days: 45 });
    
    opportunities.push({
      id: 'win-back',
      title: 'Win-Back Campaign',
      description: explanation,
      potentialRevenue,
      recommendedChannel: 'WhatsApp',
      recommendedAction: 'Launch Win-Back Campaign'
    });
  }

  // 2. Upsell: Customers who recently became high-value (>10000) within last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const highValueCustomers = await Customer.find({
    totalSpent: { $gt: 10000 },
    lastOrderDate: { $gte: thirtyDaysAgo }
  });

  if (highValueCustomers.length > 0) {
    const potentialRevenue = Math.round(highValueCustomers.length * 500); // Heuristic upsell value
    
    const explanation = await explainOpportunity('Upsell Premium', { count: highValueCustomers.length, type: 'high-value' });

    opportunities.push({
      id: 'upsell',
      title: 'Premium Upsell',
      description: explanation,
      potentialRevenue,
      recommendedChannel: 'Email',
      recommendedAction: 'Upsell Premium Products'
    });
  }

  // 3. Retargeting: Clicked but not converted
  // Aggregation: group by customer and campaign, check if clicked exists but converted doesn't
  const retargetEvents = await Event.aggregate([
    {
      $group: {
        _id: { customerId: "$customerId", campaignId: "$campaignId" },
        events: { $push: "$type" }
      }
    },
    {
      $project: {
        hasClicked: { $in: ["clicked", "$events"] },
        hasConverted: { $in: ["converted", "$events"] }
      }
    },
    {
      $match: {
        hasClicked: true,
        hasConverted: false
      }
    }
  ]);

  const uniqueRetargetCustomerIds = new Set(retargetEvents.map(e => e._id.customerId.toString()));
  if (uniqueRetargetCustomerIds.size > 0) {
    const potentialRevenue = Math.round(uniqueRetargetCustomerIds.size * 300); // heuristic retarget value
    const explanation = await explainOpportunity('Retargeting', { count: uniqueRetargetCustomerIds.size, action: 'clicked but no conversion' });

    opportunities.push({
      id: 'retarget',
      title: 'Retargeting',
      description: explanation,
      potentialRevenue,
      recommendedChannel: 'SMS',
      recommendedAction: 'Retarget Campaign'
    });
  }

  return opportunities;
}
