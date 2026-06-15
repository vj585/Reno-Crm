import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Lightbulb, TrendingUp, MessageCircle, Mail, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { toast } from '../utils/toast';

export default function OpportunityCenter() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/analytics/opportunities`)
      .then(res => res.json())
      .then(data => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load opportunities: ' + err.message);
        setLoading(false);
      });
  }, []);

  const getChannelIcon = (channel) => {
    switch(channel?.toLowerCase()) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4 mr-1" />;
      case 'email': return <Mail className="w-4 h-4 mr-1" />;
      case 'sms': return <Smartphone className="w-4 h-4 mr-1" />;
      default: return <MessageCircle className="w-4 h-4 mr-1" />;
    }
  };

  const handleLaunch = (opp) => {
    navigate('/campaigns', { state: { suggestedPrompt: opp.suggestedPrompt || opp.description, channel: opp.recommendedChannel }});
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Opportunity Center</h2>
        <p className="text-muted-foreground mt-2">
          AI-discovered segments with high potential ROI. Review and launch targeted campaigns instantly.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No opportunities found</h3>
            <p className="text-muted-foreground">Check back later when more data is collected.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp, idx) => (
            <Card key={idx} className="relative overflow-hidden transition-all hover:shadow-md border-indigo-100 dark:border-zinc-800">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{opp.title}</CardTitle>
                  <Badge variant="secondary" className="flex items-center text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    ₹{opp.potentialRevenue?.toLocaleString()} Est.
                  </Badge>
                </div>
                <CardDescription className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-2">
                  {opp.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-md p-3 mb-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recommended Channel</div>
                  <div className="flex items-center font-medium">
                    {getChannelIcon(opp.recommendedChannel)}
                    {opp.recommendedChannel}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-md p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recommended Action</div>
                  <div className="font-medium text-sm">
                    {opp.recommendedAction}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleLaunch(opp)}>
                  Launch Campaign
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
