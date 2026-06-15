import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Campaign from '../models/Campaign.js';
import Event from '../models/Event.js';
import Communication from '../models/Communication.js';
import mongoose from 'mongoose';

export const generateDemoData = async (req, res) => {
  try {
    // 1. Generate an Order for a random customer
    const customers = await Customer.aggregate([{ $sample: { size: 1 } }]);
    if (customers.length > 0) {
      const customer = customers[0];
      const amount = Math.floor(Math.random() * 5000) + 500;
      
      await Order.create({
        customerId: customer._id,
        amount,
        category: 'Demo Purchase',
        orderDate: new Date()
      });

      // Update customer totalSpent
      await Customer.findByIdAndUpdate(customer._id, {
        $inc: { totalSpent: amount, orderCount: 1 },
        lastOrderDate: new Date()
      });
    }

    // 2. Add some random events for active campaigns
    const campaigns = await Campaign.find();
    if (campaigns.length > 0) {
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      
      const comms = await Communication.aggregate([
        { $match: { campaignId: campaign._id } },
        { $sample: { size: 1 } }
      ]);

      if (comms.length > 0) {
        const comm = comms[0];
        const types = ['opened', 'clicked', 'converted'];
        const randomType = types[Math.floor(Math.random() * types.length)];

        await Event.create({
          communicationId: comm._id,
          campaignId: campaign._id,
          customerId: comm.customerId,
          type: randomType,
          timestamp: new Date()
        });
      }
    }

    res.status(200).json({ success: true, message: "Demo data generated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
