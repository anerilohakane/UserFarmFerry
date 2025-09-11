// import { useNavigation } from '@react-navigation/native';
// import { format } from 'date-fns';
// import {
//   Bell, ChevronRight,
//   Edit3,
//   Headphones, Lock, LogOut,
//   Mail,
//   Phone,
//   Settings,
//   Star, User, X
// } from 'lucide-react-native';
// import { useEffect, useState } from 'react';
// import {
//   Dimensions,
//   FlatList,
//   Modal,
//   RefreshControl,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import Header, { HeaderVariants } from '../components/ui/Header';
// import { useAuth } from '../context/AuthContext';
// import { customerAPI, notificationsAPI } from '../services/api';

// const ProfileScreen = () => {
//   const navigation = useNavigation();
//   const { user, logout, updateUser } = useAuth();
//   const profileUser = user && user.customer ? user.customer : user;
//   const [activeTab, setActiveTab] = useState('profile');
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // Get screen dimensions for responsive design
//   const { width, height } = Dimensions.get('window');
//   const isSmallScreen = height < 700;

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const response = await notificationsAPI.getNotifications();
//       setNotifications(Array.isArray(response.data.data) ? response.data.data : []);
//     } catch (error) {
//       console.error('Failed to fetch notifications:', error);
//       setNotifications([]);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       const response = await customerAPI.getProfile();
//       updateUser(response.data.data);
//     } catch (e) {
//       // Optionally show error
//     }
//     setRefreshing(false);
//   };

//   const profileMenu = [
//     { icon: Lock, label: 'Change Password', desc: 'Update your password', color: 'red', badge: null, onPress: () => navigation.navigate('ChangePassword') },
//     { icon: Star, label: 'My Reviews', desc: 'View and manage your reviews', color: 'yellow', badge: null, onPress: () => navigation.navigate('MyReviews') },
//     { icon: Settings, label: 'Settings', desc: 'App preferences', color: 'indigo', badge: null, onPress: () => navigation.navigate('Settings') },
//     { icon: Headphones, label: 'Help & Support', desc: 'Get assistance', color: 'teal', badge: null, onPress: () => navigation.navigate('Support') },
//   ];

//   const renderProfileTab = () => (
//     <View className={`p-4 ${isSmallScreen ? 'space-y-4' : 'space-y-6'}`}>
//       <View className={`${isSmallScreen ? 'space-y-3' : 'space-y-4'}`}>
//         {profileMenu.map((item, i) => (
//           <TouchableOpacity
//             key={i}
//             className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-100"
//             onPress={item.onPress}
//           >
//             <View className="flex-row items-center">
//               <View className={`${isSmallScreen ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg items-center justify-center mr-3 ${
//                 item.color === 'red' ? 'bg-red-50' :
//                 item.color === 'yellow' ? 'bg-yellow-50' :
//                 item.color === 'indigo' ? 'bg-indigo-50' :
//                 item.color === 'teal' ? 'bg-teal-50' : 'bg-gray-50'
//               }`}>
//                 <item.icon
//                   size={isSmallScreen ? 18 : 22}
//                   color={
//                     item.color === 'red' ? '#ef4444' :
//                     item.color === 'yellow' ? '#eab308' :
//                     item.color === 'indigo' ? '#6366f1' :
//                     item.color === 'teal' ? '#14b8a6' : '#6b7280'
//                   }
//                 />
//               </View>
//               <View className="flex-1">
//                 <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-gray-800`}>{item.label}</Text>
//                 <Text className={`${isSmallScreen ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>{item.desc}</Text>
//               </View>
//               <ChevronRight size={isSmallScreen ? 16 : 20} color="#9ca3af" />
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
      
//       <View className={`${isSmallScreen ? 'pt-1' : 'pt-2'}`}>
//         <TouchableOpacity 
//           onPress={logout} 
//           className="w-full flex-row items-center justify-center bg-red-50 p-4 rounded-lg border border-red-100 gap-3"
//         >
//           <LogOut size={isSmallScreen ? 18 : 20} color="#ef4444" />
//           <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-red-600`}>Logout</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View className="flex-1 bg-gray-50">
//       <Header
//         title="Profile"
//         showNotifications={true}
//         onNotificationPress={() => setShowNotifications(!showNotifications)}
//         children={
//           <View className="flex-row items-center mt-2">
//             <View className={`${isSmallScreen ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-green-500 items-center justify-center mr-2`}>
//               <User size={isSmallScreen ? 16 : 18} color="#ffffff" />
//             </View>
//             <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500`}>Manage your account</Text>
//           </View>
//         }
//       />

//       {/* Profile Header */}
//       {profileUser && (
//         <View className={`p-4 bg-white ${isSmallScreen ? 'py-3' : ''}`}>
//           <View className="items-center">
//             <View className="relative mb-3">
//               <View className={`${isSmallScreen ? 'w-14 h-14' : 'w-16 h-16'} rounded-xl bg-green-500 items-center justify-center`}>
//                 <User size={isSmallScreen ? 24 : 28} color="#ffffff" />
//               </View>
//               <TouchableOpacity 
//                 className={`absolute -bottom-1 -right-1 ${isSmallScreen ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-white items-center justify-center border-2 border-gray-200`}
//                 onPress={() => navigation.navigate('EditProfile', { user })}
//               >
//                 <Edit3 size={isSmallScreen ? 10 : 12} color="#16a34a" />
//               </TouchableOpacity>
//             </View>
//             <View>
//               <Text className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold text-gray-800 mb-1 text-center`}>
//                 {profileUser.firstName || profileUser.lastName ? 
//                   `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() : 
//                   profileUser.name}
//               </Text>
//               <View className="flex-row items-center mb-1 justify-center">
//                 <Phone size={isSmallScreen ? 10 : 12} color="#4b5563" />
//                 <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500 ml-1`}>{profileUser.phone}</Text>
//               </View>
//               <View className="flex-row items-center justify-center">
//                 <Mail size={isSmallScreen ? 10 : 12} color="#4b5563" />
//                 <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500 ml-1`}>{profileUser.email}</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       )}

//       {/* Tab Content */}
//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ paddingBottom: isSmallScreen ? 20 : 30 }}
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={handleRefresh} 
//             colors={["#10B981"]}
//           />
//         }
//       >
//         {renderProfileTab()}
//       </ScrollView>

//       {/* Notifications Modal */}
//       <Modal
//         visible={showNotifications}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setShowNotifications(false)}
//       >
//         <View className="flex-1 bg-white">
//           <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
//             <Text className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold text-gray-800`}>Notifications</Text>
//             <TouchableOpacity
//               onPress={() => setShowNotifications(false)}
//               className="p-1.5"
//             >
//               <X size={isSmallScreen ? 18 : 20} color="#4b5563" />
//             </TouchableOpacity>
//           </View>
//           <FlatList
//             data={notifications}
//             keyExtractor={(item) => item.id || item._id || Math.random().toString()}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 className={`p-4 border-b border-gray-100 ${item.unread ? 'bg-blue-50' : ''}`}
//               >
//                 <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-gray-800`}>{item.title}</Text>
//                 <Text className={`${isSmallScreen ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>{item.desc || item.message}</Text>
//                 <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-400 mt-1`}>
//                   {item.createdAt ? format(new Date(item.createdAt), 'MMM d, h:mm a') : ''}
//                 </Text>
//                 {item.unread && (
//                   <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
//                 )}
//               </TouchableOpacity>
//             )}
//             ListEmptyComponent={
//               <View className="flex-1 items-center justify-center p-8">
//                 <Text className="text-gray-500">No notifications</Text>
//               </View>
//             }
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default ProfileScreen;


// import { useNavigation } from '@react-navigation/native';
// import { format } from 'date-fns';
// import {
//   Bell, ChevronRight,
//   Edit3,
//   Headphones, Lock, LogOut,
//   Mail,
//   Phone,
//   Settings,
//   Star, User, X
// } from 'lucide-react-native';
// import { useEffect, useState } from 'react';
// import {
//   Dimensions,
//   FlatList,
//   Modal,
//   RefreshControl,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import Header, { HeaderVariants } from '../components/ui/Header';
// import { useAuth } from '../context/AuthContext';
// import { customerAPI, notificationsAPI } from '../services/api';

// const ProfileScreen = () => {
//   const navigation = useNavigation();
//   const { user, logout, updateUser } = useAuth();
//   const profileUser = user && user.customer ? user.customer : user;
//   const [activeTab, setActiveTab] = useState('profile');
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [customerData, setCustomerData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // Get screen dimensions for responsive design
//   const { width, height } = Dimensions.get('window');
//   const isSmallScreen = height < 700;

//   useEffect(() => {
//     fetchNotifications();
//     fetchCustomerProfile();
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const response = await notificationsAPI.getNotifications();
//       setNotifications(Array.isArray(response.data.data) ? response.data.data : []);
//     } catch (error) {
//       console.error('Failed to fetch notifications:', error);
//       setNotifications([]);
//     }
//   };

//   const fetchCustomerProfile = async () => {
//     try {
//       const response = await customerAPI.getProfile();
//       setCustomerData(response.data.data);
//       updateUser(response.data.data);
//     } catch (error) {
//       console.error('Failed to fetch customer profile:', error);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await fetchCustomerProfile();
//     } catch (e) {
//       // Optionally show error
//     }
//     setRefreshing(false);
//   };

//   // Get display name from various sources
//   const getDisplayName = () => {
//     // Priority: 1. Profile name, 2. Default address name, 3. Any address name, 4. Fallback
//     if (profileUser?.firstName || profileUser?.lastName) {
//       return `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim();
//     }
    
//     if (profileUser?.name) {
//       return profileUser.name;
//     }

//     // Check for name in addresses
//     if (customerData?.addresses?.length > 0) {
//       // First try to get name from default address
//       const defaultAddress = customerData.addresses.find(addr => addr.isDefault);
//       if (defaultAddress?.name) {
//         return defaultAddress.name;
//       }
      
//       // If no default, get name from first address that has a name
//       const addressWithName = customerData.addresses.find(addr => addr.name);
//       if (addressWithName?.name) {
//         return addressWithName.name;
//       }
//     }

//     return 'User'; // Fallback
//   };

//   const profileMenu = [
//     { icon: Lock, label: 'Change Password', desc: 'Update your password', color: 'red', badge: null, onPress: () => navigation.navigate('ChangePassword') },
//     { icon: Star, label: 'My Reviews', desc: 'View and manage your reviews', color: 'yellow', badge: null, onPress: () => navigation.navigate('MyReviews') },
//     { icon: Settings, label: 'Settings', desc: 'App preferences', color: 'indigo', badge: null, onPress: () => navigation.navigate('Settings') },
//     { icon: Headphones, label: 'Help & Support', desc: 'Get assistance', color: 'teal', badge: null, onPress: () => navigation.navigate('Support') },
//   ];

//   const renderProfileTab = () => (
//     <View className={`p-4 ${isSmallScreen ? 'space-y-4' : 'space-y-6'}`}>
//       <View className={`${isSmallScreen ? 'space-y-3' : 'space-y-4'}`}>
//         {profileMenu.map((item, i) => (
//           <TouchableOpacity
//             key={i}
//             className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-100"
//             onPress={item.onPress}
//           >
//             <View className="flex-row items-center">
//               <View className={`${isSmallScreen ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg items-center justify-center mr-3 ${
//                 item.color === 'red' ? 'bg-red-50' :
//                 item.color === 'yellow' ? 'bg-yellow-50' :
//                 item.color === 'indigo' ? 'bg-indigo-50' :
//                 item.color === 'teal' ? 'bg-teal-50' : 'bg-gray-50'
//               }`}>
//                 <item.icon
//                   size={isSmallScreen ? 18 : 22}
//                   color={
//                     item.color === 'red' ? '#ef4444' :
//                     item.color === 'yellow' ? '#eab308' :
//                     item.color === 'indigo' ? '#6366f1' :
//                     item.color === 'teal' ? '#14b8a6' : '#6b7280'
//                   }
//                 />
//               </View>
//               <View className="flex-1">
//                 <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-gray-800`}>{item.label}</Text>
//                 <Text className={`${isSmallScreen ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>{item.desc}</Text>
//               </View>
//               <ChevronRight size={isSmallScreen ? 16 : 20} color="#9ca3af" />
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
      
//       <View className={`${isSmallScreen ? 'pt-1' : 'pt-2'}`}>
//         <TouchableOpacity 
//           onPress={logout} 
//           className="w-full flex-row items-center justify-center bg-red-50 p-4 rounded-lg border border-red-100 gap-3"
//         >
//           <LogOut size={isSmallScreen ? 18 : 20} color="#ef4444" />
//           <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-red-600`}>Logout</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View className="flex-1 bg-gray-50">
//       <Header
//         title="Profile"
//         showNotifications={true}
//         onNotificationPress={() => setShowNotifications(!showNotifications)}
//         children={
//           <View className="flex-row items-center mt-2">
//             <View className={`${isSmallScreen ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-green-500 items-center justify-center mr-2`}>
//               <User size={isSmallScreen ? 16 : 18} color="#ffffff" />
//             </View>
//             <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500`}>Manage your account</Text>
//           </View>
//         }
//       />

//       {/* Profile Header */}
//       {(profileUser || customerData) && (
//         <View className={`p-4 bg-white ${isSmallScreen ? 'py-3' : ''}`}>
//           <View className="items-center">
//             <View className="relative mb-3">
//               <View className={`${isSmallScreen ? 'w-14 h-14' : 'w-16 h-16'} rounded-xl bg-green-500 items-center justify-center`}>
//                 <User size={isSmallScreen ? 24 : 28} color="#ffffff" />
//               </View>
//               <TouchableOpacity 
//                 className={`absolute -bottom-1 -right-1 ${isSmallScreen ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-white items-center justify-center border-2 border-gray-200`}
//                 onPress={() => navigation.navigate('EditProfile', { user: customerData || user })}
//               >
//                 <Edit3 size={isSmallScreen ? 10 : 12} color="#16a34a" />
//               </TouchableOpacity>
//             </View>
//             <View>
//               <Text className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold text-gray-800 mb-1 text-center`}>
//                 {getDisplayName()}
//               </Text>
//               <View className="flex-row items-center mb-1 justify-center">
//                 <Phone size={isSmallScreen ? 10 : 12} color="#4b5563" />
//                 <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500 ml-1`}>
//                   {profileUser?.phone || customerData?.phone}
//                 </Text>
//               </View>
//               <View className="flex-row items-center justify-center">
//                 <Mail size={isSmallScreen ? 10 : 12} color="#4b5563" />
//                 <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500 ml-1`}>
//                   {profileUser?.email || customerData?.email}
//                 </Text>
//               </View>
              
//               {/* Show address info if available */}
//               {customerData?.addresses?.length > 0 && (
//                 <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-400 mt-1 text-center`}>
//                   {customerData.addresses.length} address{customerData.addresses.length > 1 ? 'es' : ''} saved
//                 </Text>
//               )}
//             </View>
//           </View>
//         </View>
//       )}

//       {/* Tab Content */}
//       <ScrollView
//         className="flex-1"
//         contentContainerStyle={{ paddingBottom: isSmallScreen ? 20 : 30 }}
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={handleRefresh} 
//             colors={["#10B981"]}
//           />
//         }
//       >
//         {renderProfileTab()}
//       </ScrollView>

//       {/* Notifications Modal */}
//       <Modal
//         visible={showNotifications}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => setShowNotifications(false)}
//       >
//         <View className="flex-1 bg-white">
//           <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
//             <Text className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold text-gray-800`}>Notifications</Text>
//             <TouchableOpacity
//               onPress={() => setShowNotifications(false)}
//               className="p-1.5"
//             >
//               <X size={isSmallScreen ? 18 : 20} color="#4b5563" />
//             </TouchableOpacity>
//           </View>
//           <FlatList
//             data={notifications}
//             keyExtractor={(item) => item.id || item._id || Math.random().toString()}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 className={`p-4 border-b border-gray-100 ${item.unread ? 'bg-blue-50' : ''}`}
//               >
//                 <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-gray-800`}>{item.title}</Text>
//                 <Text className={`${isSmallScreen ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>{item.desc || item.message}</Text>
//                 <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-400 mt-1`}>
//                   {item.createdAt ? format(new Date(item.createdAt), 'MMM d, h:mm a') : ''}
//                 </Text>
//                 {item.unread && (
//                   <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
//                 )}
//               </TouchableOpacity>
//             )}
//             ListEmptyComponent={
//               <View className="flex-1 items-center justify-center p-8">
//                 <Text className="text-gray-500">No notifications</Text>
//               </View>
//             }
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default ProfileScreen;



import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import {
  Bell, ChevronRight,
  Edit3,
  Headphones, Lock, LogOut,
  Mail,
  Phone,
  Settings,
  Star, User, X
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header, { HeaderVariants } from '../components/ui/Header';
import { useAuth } from '../context/AuthContext';
import { customerAPI, notificationsAPI } from '../services/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuth();
  const profileUser = user && user.customer ? user.customer : user;
  const [activeTab, setActiveTab] = useState('profile');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [customerData, setCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = height < 700;

  useEffect(() => {
    fetchNotifications();
    fetchCustomerProfile();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  const fetchCustomerProfile = async () => {
    try {
      const response = await customerAPI.getProfile();
      setCustomerData(response.data.data);
      updateUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch customer profile:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCustomerProfile();
    } catch (e) {
      // Optionally show error
    }
    setRefreshing(false);
  };

  // Get display name from various sources
  const getDisplayName = () => {
    // Priority: 1. Profile name, 2. Default address name, 3. Any address name, 4. Fallback
    if (profileUser?.firstName || profileUser?.lastName) {
      return `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim();
    }
    
    if (profileUser?.name) {
      return profileUser.name;
    }

    // Check for name in addresses from customerData
    if (customerData?.addresses?.length > 0) {
      // First try to get name from default address
      const defaultAddress = customerData.addresses.find(addr => addr.isDefault);
      if (defaultAddress?.name) {
        return defaultAddress.name;
      }
      
      // If no default, get name from first address that has a name
      const addressWithName = customerData.addresses.find(addr => addr.name);
      if (addressWithName?.name) {
        return addressWithName.name;
      }
    }

    // Check for name in addresses from profileUser (fallback)
    if (profileUser?.addresses?.length > 0) {
      // First try to get name from default address
      const defaultAddress = profileUser.addresses.find(addr => addr.isDefault);
      if (defaultAddress?.name) {
        return defaultAddress.name;
      }
      
      // If no default, get name from first address that has a name
      const addressWithName = profileUser.addresses.find(addr => addr.name);
      if (addressWithName?.name) {
        return addressWithName.name;
      }
    }

    return 'User'; // Fallback
  };

  const profileMenu = [
    { icon: Lock, label: 'Change Password', desc: 'Update your password', color: 'red', badge: null, onPress: () => navigation.navigate('ChangePassword') },
    { icon: Star, label: 'My Reviews', desc: 'View and manage your reviews', color: 'yellow', badge: null, onPress: () => navigation.navigate('MyReviews') },
    { icon: Settings, label: 'Settings', desc: 'App preferences', color: 'indigo', badge: null, onPress: () => navigation.navigate('Settings') },
    { icon: Headphones, label: 'Help & Support', desc: 'Get assistance', color: 'teal', badge: null, onPress: () => navigation.navigate('Support') },
  ];

  const renderProfileTab = () => (
    <View className={`p-4 ${isSmallScreen ? 'space-y-4' : 'space-y-6'}`}>
      <View className={`${isSmallScreen ? 'space-y-3' : 'space-y-4'}`}>
        {profileMenu.map((item, i) => (
          <TouchableOpacity
            key={i}
            className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            onPress={item.onPress}
          >
            <View className="flex-row items-center">
              <View className={`${isSmallScreen ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg items-center justify-center mr-3 ${
                item.color === 'red' ? 'bg-red-50' :
                item.color === 'yellow' ? 'bg-yellow-50' :
                item.color === 'indigo' ? 'bg-indigo-50' :
                item.color === 'teal' ? 'bg-teal-50' : 'bg-gray-50'
              }`}>
                <item.icon
                  size={isSmallScreen ? 18 : 22}
                  color={
                    item.color === 'red' ? '#ef4444' :
                    item.color === 'yellow' ? '#eab308' :
                    item.color === 'indigo' ? '#6366f1' :
                    item.color === 'teal' ? '#14b8a6' : '#6b7280'
                  }
                />
              </View>
              <View className="flex-1">
                <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-gray-800`}>{item.label}</Text>
                <Text className={`${isSmallScreen ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>{item.desc}</Text>
              </View>
              <ChevronRight size={isSmallScreen ? 16 : 20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <View className={`${isSmallScreen ? 'pt-1' : 'pt-2'}`}>
        <TouchableOpacity 
          onPress={logout} 
          className="w-full flex-row items-center justify-center bg-red-50 p-4 rounded-lg border border-red-100 gap-3"
        >
          <LogOut size={isSmallScreen ? 18 : 20} color="#ef4444" />
          <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-red-600`}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Header
        title="Profile"
        showNotifications={true}
        onNotificationPress={() => setShowNotifications(!showNotifications)}
        children={
          <View className="flex-row items-center mt-2">
            <View className={`${isSmallScreen ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-green-500 items-center justify-center mr-2`}>
              <User size={isSmallScreen ? 16 : 18} color="#ffffff" />
            </View>
            <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500`}>Manage your account</Text>
          </View>
        }
      />

      {/* Profile Header */}
      {(profileUser || customerData) && (
        <View className={`p-4 bg-white ${isSmallScreen ? 'py-3' : ''}`}>
          <View className="items-center">
            <View className="relative mb-3">
              <View className={`${isSmallScreen ? 'w-14 h-14' : 'w-16 h-16'} rounded-xl bg-green-500 items-center justify-center`}>
                <User size={isSmallScreen ? 24 : 28} color="#ffffff" />
              </View>
              <TouchableOpacity 
                className={`absolute -bottom-1 -right-1 ${isSmallScreen ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-white items-center justify-center border-2 border-gray-200`}
                onPress={() => navigation.navigate('EditProfile', { user: customerData || user })}
              >
                <Edit3 size={isSmallScreen ? 10 : 12} color="#16a34a" />
              </TouchableOpacity>
            </View>
            <View>
              <Text className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold text-gray-800 mb-1 text-center`}>
                {getDisplayName()}
              </Text>
              <View className="flex-row items-center mb-1 justify-center">
                <Phone size={isSmallScreen ? 10 : 12} color="#4b5563" />
                <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500 ml-1`}>
                  {profileUser?.phone || customerData?.phone}
                </Text>
              </View>
              <View className="flex-row items-center justify-center">
                <Mail size={isSmallScreen ? 10 : 12} color="#4b5563" />
                <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-500 ml-1`}>
                  {profileUser?.email || customerData?.email}
                </Text>
              </View>
              
              {/* Show address info if available */}
              {customerData?.addresses?.length > 0 && (
                <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-400 mt-1 text-center`}>
                  {customerData.addresses.length} address{customerData.addresses.length > 1 ? 'es' : ''} saved
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Tab Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: isSmallScreen ? 20 : 30 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={["#10B981"]}
          />
        }
      >
        {renderProfileTab()}
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <Text className={`${isSmallScreen ? 'text-base' : 'text-lg'} font-semibold text-gray-800`}>Notifications</Text>
            <TouchableOpacity
              onPress={() => setShowNotifications(false)}
              className="p-1.5"
            >
              <X size={isSmallScreen ? 18 : 20} color="#4b5563" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id || item._id || Math.random().toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`p-4 border-b border-gray-100 ${item.unread ? 'bg-blue-50' : ''}`}
              >
                <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} font-medium text-gray-800`}>{item.title}</Text>
                <Text className={`${isSmallScreen ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>{item.desc || item.message}</Text>
                <Text className={`${isSmallScreen ? 'text-[10px]' : 'text-xs'} text-gray-400 mt-1`}>
                  {item.createdAt ? format(new Date(item.createdAt), 'MMM d, h:mm a') : ''}
                </Text>
                {item.unread && (
                  <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center p-8">
                <Text className="text-gray-500">No notifications</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;