// Feature 10: Browser notification utility

/** Request notification permission if not already granted */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/** Send a browser notification when campaign generation completes */
export function notifyCampaignComplete(campaignTitle?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (document.hasFocus()) return; // Only notify when tab is in background

  const notification = new Notification('Campaign Ready! 🎉', {
    body: campaignTitle
      ? `Your campaign "${campaignTitle}" has been generated successfully.`
      : 'Your campaign content is ready for review.',
    icon: '/favicon.ico',
    tag: 'campaign-complete', // Prevents duplicate notifications
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto-close after 8 seconds
  setTimeout(() => notification.close(), 8000);
}
