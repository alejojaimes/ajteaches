'use client';

import { useEffect, useRef } from 'react';

const MILESTONES = [
  { threshold: 25, eventType: 'read_25' },
  { threshold: 50, eventType: 'read_50' },
  { threshold: 70, eventType: 'read_70' },
  { threshold: 100, eventType: 'read_100' },
] as const;

type Props = {
  postId: string;
};

export function ReadingTracker({ postId }: Props) {
  const sentRef = useRef<Set<string>>(new Set());
  const startRef = useRef<number | null>(null);
  const endSentRef = useRef(false);

  useEffect(() => {
    startRef.current = Date.now();

    const send = (eventType: string) => {
      if (sentRef.current.has(eventType)) return;
      sentRef.current.add(eventType);
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, eventType }),
        keepalive: true,
      });
    };

    const sendEngagementEnd = () => {
      if (endSentRef.current) return;
      endSentRef.current = true;
      const durationMs = Date.now() - (startRef.current ?? Date.now());
      const payload = JSON.stringify({ postId, eventType: 'engagement_end', durationMs });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
      } else {
        void fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      }
    };

    send('view');

    let ticking = false;
    const checkProgress = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100;
      for (const milestone of MILESTONES) {
        if (progress >= milestone.threshold) send(milestone.eventType);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(checkProgress);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') sendEngagementEnd();
    };

    checkProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', sendEngagementEnd);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', sendEngagementEnd);
      sendEngagementEnd();
    };
  }, [postId]);

  return null;
}
