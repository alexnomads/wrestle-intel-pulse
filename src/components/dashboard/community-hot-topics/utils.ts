
export const getSentimentColor = (sentiment: number) => {
  if (sentiment > 0.7) return "text-green-400";
  if (sentiment > 0.4) return "text-yellow-400";
  return "text-red-400";
};

export const formatTimeAgo = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const diffInHours = Math.floor((now - timestamp) / 3600);
  
  if (diffInHours < 1) return "Less than 1h ago";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const getFanReactionScore = (post: any) => {
  const engagementScore = (post.score * 0.7) + (post.num_comments * 1.5);
  return Math.min(Math.round(engagementScore / 10), 100);
};

export const handleRedditClick = (permalink: string, title: string) => {
  const fullUrl = `https://reddit.com${permalink}`;
  console.log('Opening Reddit discussion:', title, 'URL:', fullUrl);
  
  try {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Failed to open Reddit link:', error);
    window.location.href = fullUrl;
  }
};
