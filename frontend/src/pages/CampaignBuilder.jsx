import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { API_URL } from '../config/api';
import { toast } from '../utils/toast';

export default function CampaignBuilder() {
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.suggestedPrompt || '');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaignData, setCampaignData] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      // 1. Generate Segment Filter
      const segRes = await fetch(`${API_URL}/ai/segment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const segData = await segRes.json();
      
      // 2. Preview Segment (to get count)
      const prevRes = await fetch(`${API_URL}/segments/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: segData.filter })
      });
      const prevData = await prevRes.json();

      // 3. Copilot Campaign Generation
      const copilotRes = await fetch(`${API_URL}/ai/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentName: prompt, audienceCount: prevData.count })
      });
      const copilotData = await copilotRes.json();

      setCampaignData({
        ...copilotData,
        filter: segData.filter
      });
    } catch (err) {
      toast.error('Failed to generate campaign: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!campaignData) return;
    setSending(true);
    try {
      // Create Segment
      const segRes = await fetch(`${API_URL}/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: campaignData.segmentName, filters: campaignData.filter })
      });
      const segment = await segRes.json();

      // Create Campaign
      const campRes = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignData.segmentName + " Campaign",
          segmentId: segment._id,
          channel: campaignData.recommendedChannel,
          message: campaignData.campaignMessage
        })
      });
      const campaign = await campRes.json();

      // Send Campaign
      await fetch(`${API_URL}/campaigns/${campaign._id}/send`, { method: 'POST' });
      
      toast.success('Campaign dispatched successfully!');
      setCampaignData(null);
      setPrompt('');
    } catch (err) {
      toast.error('Failed to dispatch campaign: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Campaign Copilot</h2>
        <p className="text-muted-foreground mt-2">
          Describe your audience and let the AI build the perfect segment, message, and channel strategy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Who do you want to target?</CardTitle>
          <CardDescription>Enter a natural language description of your audience.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Customers who spent over ₹5000 in the last 30 days" 
              className="flex-1"
            />
            <Button onClick={handleGenerate} disabled={loading || !prompt} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Complete Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {campaignData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {campaignData.audienceCount} Customers Matched
                </Badge>
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {campaignData.recommendedChannel}
                </Badge>
              </div>
              <CardTitle className="mt-4">{campaignData.segmentName} Campaign</CardTitle>
              <CardDescription className="text-indigo-600 dark:text-indigo-400 font-medium">
                Goal: {campaignData.campaignGoal}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm font-semibold mb-2">Generated Message Copy</div>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{campaignData.campaignMessage}</p>
              </div>
              <div className="text-sm text-muted-foreground flex items-start">
                <Sparkles className="w-4 h-4 mr-2 text-indigo-500 mt-0.5" />
                <p><strong>AI Reasoning:</strong> {campaignData.reasoning}</p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-end">
              <Button onClick={handleSend} disabled={sending || campaignData.audienceCount === 0} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Approve & Launch
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
