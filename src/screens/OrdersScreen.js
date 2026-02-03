import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ordersAPI } from '../services/api';

const OrdersScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('All');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setError(null);
            const response = await ordersAPI.getMyOrders();
            console.log('Orders API Response:', response.data);

            if (response.data.success) {
                const ordersData = response.data.data || [];
                setOrders(ordersData);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getFilteredOrders = () => {
        if (activeTab === 'All') return orders;

        return orders.filter(order => {
            const status = order.status.toLowerCase();
            if (activeTab === 'Active') {
                return ['pending', 'processing', 'confirmed', 'shipped', 'out for delivery'].includes(status);
            }
            if (activeTab === 'Delivered') {
                return status === 'delivered';
            }
            if (activeTab === 'Cancelled') {
                return ['cancelled', 'returned'].includes(status);
            }
            return true;
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatStatus = (status) => {
        // Capitalize first letter and handle special cases
        const statusMap = {
            'pending': 'Pending',
            'processing': 'Processing',
            'confirmed': 'Confirmed',
            'shipped': 'Shipped',
            'out for delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'returned': 'Returned'
        };
        return statusMap[status.toLowerCase()] || status;
    };

    const getStatusColor = (status) => {
        const statusLower = status.toLowerCase();
        if (['pending', 'processing', 'confirmed'].includes(statusLower)) {
            return { bg: '#fff7ed', text: '#ea580c' }; // Orange
        } else if (statusLower === 'delivered') {
            return { bg: '#f0fdf4', text: '#004C46' }; // Green
        } else if (['cancelled', 'returned'].includes(statusLower)) {
            return { bg: '#fef2f2', text: '#dc2626' }; // Red
        } else if (['shipped', 'out for delivery'].includes(statusLower)) {
            return { bg: '#eff6ff', text: '#2563eb' }; // Blue
        }
        return { bg: '#f3f4f6', text: '#4b5563' };
    };

    const renderOrderCard = ({ item }) => {
        const statusStyle = getStatusColor(item.status);
        const formattedStatus = formatStatus(item.status);

        return (
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.orderId}>Order #{item._id.slice(-8).toUpperCase()}</Text>
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{formattedStatus}</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Items Preview */}
                <View style={styles.cardBody}>
                    {item.items && item.items.slice(0, 3).map((orderItem, index) => (
                        <View key={index} style={styles.itemRow}>
                            <Image
                                source={{ uri: orderItem.product?.images?.[0]?.url || orderItem.product?.image || 'https://via.placeholder.com/150' }}
                                style={styles.itemImage}
                                resizeMode="cover"
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName} numberOfLines={1}>
                                    {orderItem.product?.name || 'Product'}
                                </Text>
                                <Text style={styles.itemQty}>Qty: {orderItem.quantity}</Text>
                            </View>
                        </View>
                    ))}
                    {item.items && item.items.length > 3 && (
                        <Text style={styles.moreItems}>+{item.items.length - 3} more items</Text>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalAmount}>₹{item.totalAmount?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>View Details</Text>
                        <Feather name="chevron-right" size={16} color="#004C46" />
                    </TouchableOpacity>
                </View>

            </View>
        );
    };

    const filteredOrders = getFilteredOrders();

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
                <StatusBar barStyle="light-content" backgroundColor="#004C46" />

                {/* Header - Fixed at top */}
                <View style={{
                    backgroundColor: '#004C46',
                    paddingBottom: 16,
                    paddingTop: 10
                }}>
                    {/* Top Row: Brand, Location, Timer, Profile */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 }}>
                        <View>
                            <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
                                <Feather name="chevron-down" size={16} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {/* 5 mins Badge */}
                            <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                                <Feather name="clock" size={12} color="black" />
                                <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>5 mins</Text>
                            </View>
                            {/* Profile Icon */}
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                                <Feather name="user" size={20} color="#004C46" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#004C46" />
                        <Text style={styles.loadingText}>Loading orders...</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#004C46' }} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#004C46" />

            {/* Header - Fixed at top */}
            <View style={{
                backgroundColor: '#004C46',
                paddingBottom: 16,
                paddingTop: 10
            }}>
                {/* Top Row: Brand, Location, Timer, Profile */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
                    <View>
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 20, letterSpacing: -0.5 }}>FarmFerry</Text>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Deliver to Selected Location</Text>
                            <Feather name="chevron-down" size={16} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* 5 mins Badge */}
                        <View style={{ backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                            <Feather name="clock" size={12} color="black" />
                            <Text style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>5 mins</Text>
                        </View>
                        {/* Profile Icon */}
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                            <Feather name="user" size={20} color="#004C46" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Scrollable Content Area - White Background */}
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                {/* Tabs (Filter) - Scrollable with content */}
                <View style={styles.tabContainer}>
                    {['All', 'Active', 'Delivered', 'Cancelled'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[
                                styles.tab,
                                activeTab === tab && styles.activeTab
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText
                            ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {error ? (
                    <View style={styles.centerContainer}>
                        <Feather name="alert-circle" size={48} color="#dc2626" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={fetchOrders}>
                            <Text style={styles.retryBtnText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredOrders.length === 0 ? (
                    /* Empty State */
                    <View style={styles.centerContainer}>
                        <MaterialCommunityIcons name="package-variant" size={64} color="#d1d5db" />
                        <Text style={styles.emptyTitle}>No Orders Found</Text>
                        <Text style={styles.emptySubtitle}>
                            {activeTab === 'All'
                                ? "You haven't placed any orders yet"
                                : `No ${activeTab.toLowerCase()} orders`}
                        </Text>
                        <TouchableOpacity
                            style={styles.shopBtn}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.shopBtnText}>Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* Orders List - Only this scrolls */
                    <FlatList
                        data={filteredOrders}
                        keyExtractor={item => item._id}
                        renderItem={renderOrderCard}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#004C46']}
                                tintColor="#004C46"
                            />
                        }
                    />
                )}
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        // top: ,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 10,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    activeTab: {
        backgroundColor: '#004C46',
        borderColor: '#004C46',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTabText: {
        color: 'white',
    },
    listContent: {
        padding: 20,
        paddingTop: 8,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2937',
    },
    orderDate: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginHorizontal: 16,
    },
    cardBody: {
        padding: 16,
        gap: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f9fafb',
    },
    itemName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    itemQty: {
        fontSize: 12,
        color: '#9ca3af',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    totalLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 2,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#004C46',
        backgroundColor: 'white',
        gap: 4,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#004C46',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    errorText: {
        marginTop: 16,
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#004C46',
        borderRadius: 8,
    },
    retryBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    emptySubtitle: {
        marginTop: 8,
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    shopBtn: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: '#166534',
        borderRadius: 8,
    },
    shopBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    moreItems: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: 4,
    },
});

export default OrdersScreen;
