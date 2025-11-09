import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeNotifications = () => {
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('New notification:', payload);
          setUnreadCount(prev => prev + 1);
          
          // Play notification sound
          playNotificationSound();
          
          // Show toast notification
          toast({
            title: "🔔 Nouvelle notification",
            description: payload.new.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    
    setUnreadCount(0);
  };

  return { unreadCount, markAsRead, markAllAsRead };
};

const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // First beep
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
  
  // Second beep
  const oscillator2 = audioContext.createOscillator();
  const gainNode2 = audioContext.createGain();
  
  oscillator2.connect(gainNode2);
  gainNode2.connect(audioContext.destination);
  
  oscillator2.frequency.value = 1000;
  oscillator2.type = 'sine';
  gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.2);
  gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
  
  oscillator2.start(audioContext.currentTime + 0.2);
  oscillator2.stop(audioContext.currentTime + 0.35);
};
