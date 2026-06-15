import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

const INDIAN_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Riya', 'Aanya', 'Priya', 'Ananya', 'Diya', 'Neha', 'Rohan', 'Karan', 'Vikram', 'Meera', 'Anjali', 'Kavya', 'Rahul', 'Sneha'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Das', 'Joshi'];
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
const CHANNELS = ['WhatsApp', 'SMS', 'Email', 'RCS'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB, starting seed...");

    await Customer.deleteMany({});
    await Order.deleteMany({});

    const customers = [];
    console.log("Generating 1000 customers...");
    for (let i = 0; i < 1000; i++) {
      const name = `${randomElement(INDIAN_NAMES)} ${randomElement(LAST_NAMES)}`;
      customers.push({
        name,
        email: `user${i}_${Date.now()}@example.com`,
        phone: `+919${Math.floor(Math.random() * 900000000) + 100000000}`,
        city: randomElement(CITIES),
        preferredChannel: randomElement(CHANNELS),
        totalSpent: 0,
        orderCount: 0
      });
    }

    const insertedCustomers = await Customer.insertMany(customers);
    
    console.log("Generating 5000 orders...");
    const orders = [];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    for (let i = 0; i < 5000; i++) {
      const customer = randomElement(insertedCustomers);
      const amount = Math.floor(Math.random() * 5000) + 500;
      const orderDate = randomDate(threeMonthsAgo, new Date());
      
      orders.push({
        customerId: customer._id,
        amount,
        category: randomElement(['Electronics', 'Fashion', 'Home', 'Beauty', 'Groceries']),
        orderDate
      });
    }

    await Order.insertMany(orders);

    console.log("Updating customer aggregates...");
    const customerAggregates = await Order.aggregate([
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$amount' },
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: '$orderDate' }
        }
      }
    ]);

    for (const agg of customerAggregates) {
      await Customer.findByIdAndUpdate(agg._id, {
        totalSpent: agg.totalSpent,
        orderCount: agg.orderCount,
        lastOrderDate: agg.lastOrderDate
      });
    }

    console.log("Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
