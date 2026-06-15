export function recommendChannel(audienceDetails) {
  // audienceDetails can contain: preferredChannels (array/map), avgEngagement, audienceType
  // For the prompt requirements:
  // If preferredChannel exists, use it.
  // Otherwise:
  // High engagement -> WhatsApp
  // Broad reach -> SMS
  // Professional -> Email

  const { preferredChannelMode, engagementLevel, isBroadReach, isProfessional } = audienceDetails;

  if (preferredChannelMode) {
    return {
      channel: preferredChannelMode,
      confidenceScore: 0.95,
      reasoning: "Chosen based on the dominant preferred channel of this segment."
    };
  }

  if (engagementLevel === 'high') {
    return {
      channel: 'WhatsApp',
      confidenceScore: 0.88,
      reasoning: "WhatsApp achieves the best results for highly engaged audiences."
    };
  }

  if (isProfessional) {
    return {
      channel: 'Email',
      confidenceScore: 0.85,
      reasoning: "Email is optimal for professional and B2B communications."
    };
  }

  if (isBroadReach) {
    return {
      channel: 'SMS',
      confidenceScore: 0.80,
      reasoning: "SMS provides the broadest reach for large diverse audiences."
    };
  }

  return {
    channel: 'Email',
    confidenceScore: 0.70,
    reasoning: "Default fallback channel for generalized segments."
  };
}
