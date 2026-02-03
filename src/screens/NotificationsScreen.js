import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { notificationsAPI } from '../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { fetchNotifications } = useAppContext();

  const fetchAndMarkRead = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications();
      const notifs = Array.isArray(response.data.data) ? response.data.data : [];
      setNotifications(notifs);
      // Mark unread notifications as read
      const unread = notifs.filter(n => n.unread && n._id);
      if (unread.length > 0) {
        await Promise.all(unread.map(n => notificationsAPI.markAsRead(n._id)));
        // Refresh notifications after marking as read
        await fetchNotifications();
        const refreshed = await notificationsAPI.getNotifications();
        setNotifications(Array.isArray(refreshed.data.data) ? refreshed.data.data : []);
      }
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAndMarkRead();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAndMarkRead();
  };

  return (
    <View className="flex-1 bg-gray-50 pt-6 px-4">
      {/* <Text className="text-2xl font-bold text-gray-800 mb-4">Notifications</Text> */}
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id?.toString() || item._id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm">
              <View className="flex-row items-center mb-1">
                <Ionicons name="notifications-outline" size={18} color="#10B981" />
                <Text className="text-base font-semibold text-gray-800 ml-2">{item.title}</Text>
              </View>
              <Text className="text-sm text-gray-600">{item.message}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#10B981"]} />
          }
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">No notifications found.</Text>
          }
        />
      )}
    </View>
  );
}
