import { supabase } from '../db';
import * as Notifications from 'expo-notifications';
import { SpeiService } from '../../components/spei.service';

export async function setupDepositNotifications(userId: string, clabe: string) {
  // Listen for realtime changes on the movements table
  const movementsSubscription = supabase
    .channel('deposit-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'movements',
        filter: `user_id=eq.${userId} AND direction=eq.INBOUND`
      },
      async (payload) => {
        const movement = payload.new;
        
        // Send local notification for the deposit
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '¡Depósito recibido!',
            body: `Has recibido $${movement.amount.toFixed(2)} de ${movement.counterparty_name}`,
            data: { movement },
          },
          trigger: null, // Send immediately
        });
      }
    )
    .subscribe();

  // Start polling for SPEI transfers
  const pollInterval = setInterval(async () => {
    try {
      const transfers = await SpeiService.listenForInboundTransfers(clabe);
      if (transfers && transfers.length > 0) {
        // Process each new transfer
        for (const transfer of transfers) {
          // Send notification for each SPEI transfer
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '¡SPEI recibido!',
              body: `Has recibido $${transfer.monto.toFixed(2)} de ${transfer.nombreOrdenante}`,
              data: { transfer },
            },
            trigger: null,
          });
        }
      }
    } catch (error) {
      console.error('Error polling for SPEI transfers:', error);
    }
  }, 30000); // Poll every 30 seconds

  // Return cleanup function
  return () => {
    movementsSubscription.unsubscribe();
    clearInterval(pollInterval);
  };
} 