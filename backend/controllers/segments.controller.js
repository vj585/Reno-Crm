import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';

function processFilterDates(filterObj) {
  let str = JSON.stringify(filterObj);
  const now = new Date();
  
  if (str.includes("30_DAYS_AGO")) {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    str = str.replace(/"30_DAYS_AGO"/g, `"${d.toISOString()}"`);
  }
  if (str.includes("60_DAYS_AGO")) {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    str = str.replace(/"60_DAYS_AGO"/g, `"${d.toISOString()}"`);
  }
  if (str.includes("90_DAYS_AGO")) {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    str = str.replace(/"90_DAYS_AGO"/g, `"${d.toISOString()}"`);
  }
  return JSON.parse(str);
}

export const createSegment = async (req, res) => {
  try {
    const { name, description, filters } = req.body;
    const processedFilters = processFilterDates(filters);
    const count = await Customer.countDocuments(processedFilters);
    const segment = await Segment.create({ name, description, filters: processedFilters, customerCount: count });
    res.status(201).json(segment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSegments = async (req, res) => {
  try {
    const segments = await Segment.find().sort('-createdAt');
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const previewSegment = async (req, res) => {
  try {
    const { filters } = req.body;
    const processedFilters = processFilterDates(filters);
    const count = await Customer.countDocuments(processedFilters);
    const sample = await Customer.find(processedFilters).limit(5);
    res.json({ count, sample });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
