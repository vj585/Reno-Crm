import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { API_URL } from '../config/api';
import { toast } from '../utils/toast';
import { Users, ShoppingCart, DollarSign, Activity, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalCustomers: 0, totalOrders: 0, totalRevenue: 0, activeCampaigns: 0 });
  const [insight, setInsight] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/dashboard`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => toast.error('Failed to load dashboard stats: ' + err.message));

    fetch(`${API_URL}/analytics/opportunities`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setInsight(data[0]);
        }
      })
      .catch(err => toast.error('Failed to load AI recommendations: ' + err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Overview of your marketing performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
          </CardContent>
        </Card>
      </div>

      {insight && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold tracking-tight mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
            AI Recommendations
          </h3>
          <Card className="border-indigo-100 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
                    "{insight.description}"
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="outline" className="bg-white dark:bg-zinc-900 font-medium">
                      Expected Revenue: ₹{insight.potentialRevenue?.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="bg-white dark:bg-zinc-900 font-medium">
                      Recommended Channel: {insight.recommendedChannel}
                    </Badge>
                  </div>
                </div>
                <Button 
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => navigate('/campaigns', { state: { suggestedPrompt: insight.suggestedPrompt || insight.description, channel: insight.recommendedChannel }})}
                >
                  Generate Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
