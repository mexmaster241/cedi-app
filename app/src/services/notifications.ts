import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../db';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get the token that uniquely identifies this device
    token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || "90a7579b-5a8d-4191-8bba-bc4f00537579",
    });
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Save the token to your user profile in Supabase
export async function savePushToken(token: string) {
  try {
    const user = await supabase.auth.getUser();
    if (user.data?.user) {
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: user.data.user.id,
          push_token: token,
          device_type: Platform.OS,
          updated_at: new Date(),
        }, {
          onConflict: 'user_id',
        });
        
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

// Listen for incoming notifications
export function setupNotificationListeners(onNotification: (notification: Notifications.Notification) => void) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    notification => {
      if (onNotification) {
        onNotification(notification);
      }
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    response => {
      // Handle notification taps here
      console.log('Notification response:', response);
    }
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}