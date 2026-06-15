import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import SegmentBuilder from './pages/SegmentBuilder';
import CampaignBuilder from './pages/CampaignBuilder';
import OpportunityCenter from './pages/OpportunityCenter';
import Analytics from './pages/Analytics';
import Toast from './components/ui/toast';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/segments" element={<SegmentBuilder />} />
          <Route path="/campaigns" element={<CampaignBuilder />} />
          <Route path="/opportunities" element={<OpportunityCenter />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
        <Toast />
      </Layout>
    </Router>
  );
}

export default App;
