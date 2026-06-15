import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function DemoToggle() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isActive) {
      intervalId = setInterval(async () => {
        try {
          // Fire and forget demo ping
          await fetch('http://localhost:5000/api/demo/generate', { method: 'POST' });
        } catch (err) {
          console.error("Demo ping failed:", err);
        }
      }, 3000); // Generate something every 3 seconds
    }
    return () => clearInterval(intervalId);
  }, [isActive]);

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={isActive ? "success" : "secondary"}>
        Demo Mode: {isActive ? "ON" : "OFF"}
      </Badge>
      <Button 
        variant={isActive ? "destructive" : "outline"} 
        size="sm"
        onClick={() => setIsActive(!isActive)}
      >
        {isActive ? "Stop" : "Start"}
      </Button>
    </div>
  );
}
