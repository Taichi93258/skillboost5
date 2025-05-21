import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync() {
  const settings = await Notifications.requestPermissionsAsync();
  if (settings.granted) {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  }
  return null;
}

export async function scheduleDailyNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SkillBoost5 今日の学習',
      body: '今日の1問を解いてスキルを磨きましょう！',
      sound: true,
    },
    trigger: { hour: 8, minute: 0, repeats: true },
  });
}