import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, RotateCcw, ShoppingCart, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../components/ui/Button';
import Header, { HeaderVariants } from '../components/ui/Header';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import InvoiceService from '../services/invoiceService';
import { SCREEN_NAMES } from '../types';
import { getStatusColor, getStatusText } from '../utils/helpers';

const { width, height } = Dimensions.get('window');

const CustomAlert = ({ visible, title, message, buttons, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-white rounded-xl p-6 w-full max-w-sm border border-gray-200">
          <Text className="text-lg font-bold text-gray-900 mb-2">{title}</Text>
          <Text className="text-base text-gray-600 mb-4">{message}</Text>
          <View className="flex-row justify-end">
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  button.onPress?.();
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg ${
                  button.style === 'destructive'
                    ? 'bg-red-500'
                    : button.style === 'cancel'
                    ? 'bg-gray-100'
                    : 'bg-emerald-500'
                } ${index > 0 ? 'ml-3' : ''}`}
              >
                <Text
                  className={`text-base font-semibold ${
                    button.style === 'destructive' || button.style === 'default'
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function OrdersScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderAgainLoadingId, setOrderAgainLoadingId] = useState(null);
  const [filterOptions, setFilterOptions] = useState(['All']);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [returningOrderId, setReturningOrderId] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returningOrder, setReturningOrder] = useState(null);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState('');
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  // Responsive values
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

  const responsiveValue = (small, medium, large) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  // Price calculation functions from CheckoutScreen for consistency
  const getSubtotal = (items) =>
    items.reduce((sum, item) => {
      const price = item.discountedPrice || item.price;
      return sum + price * item.quantity;
    }, 0);

  const getTotalDiscount = (items) =>
    items.reduce((sum, item) => {
      if (item.originalPrice) {
        return sum + (item.originalPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);

  const getTotalGST = (items) => {
    return items.reduce((sum, item) => {
      const itemPrice = item.discountedPrice || item.price;
      const itemQuantity = item.quantity || 1;
      let gstPercent = 0;

      if (item.product && typeof item.productFAC0product === 'object') {
        gstPercent = item.product.gst || 0;
      } else if (item.gst !== undefined) {
        gstPercent = item.gst;
      }

      const gstAmount = (itemPrice * gstPercent) / 100 * itemQuantity;
      return sum + gstAmount;
    }, 0);
  };

  const getShipping = (subtotal = 0) => {
    return subtotal >= 500 ? 0 : 20.0;
  };
  const PLATFORM_FEE = 2.0;

  const calculateTotalAmount = (order) => {
    if (!order.items || order.items.length === 0) {
      return order.totalAmount || 0;
    }

    const subtotal = getSubtotal(order.items);
    const gst = order.gst || 0;
    const shipping = getShipping(subtotal);
    const platformFee = PLATFORM_FEE;

    const calculatedTotal = subtotal + gst + shipping + platformFee;

    console.log('OrdersScreen Total Calculation (Using Backend GST):', {
      orderId: order.orderId || order._id,
      subtotal,
      gst,
      shipping,
      platformFee,
      calculatedTotal,
    });

    return calculatedTotal;
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params =
        selectedFilter === 'All' ? {} : { status: selectedFilter.toLowerCase() };
      const response = await ordersAPI.getMyOrders(params);
      let fetchedOrders = [];
      if (response?.data?.data?.orders) {
        fetchedOrders = response.data.data.orders;
      } else if (response?.data?.data) {
        fetchedOrders = response.data.data;
      }
      setOrders(fetchedOrders);
      const statuses = Array.from(
        new Set(fetchedOrders.map((o) => getStatusText(o.status)))
      );
      setFilterOptions(['All', ...statuses.filter((s) => s && s !== 'All')]);
    } catch (error) {
      setOrders([]);
      setFilterOptions(['All']);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleOrderAgain = async (order) => {
    if (
      !order.items ||
      order.items.length === 0 ||
      !order.deliveryAddress ||
      !order.paymentMethod
    ) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Order is missing items, address, or payment method.',
        buttons: [{ text: 'OK', style: 'default' }],
      });
      return;
    }
    setOrderAgainLoadingId(order._id);
    try {
      let paymentMethod = order.paymentMethod;
      if (paymentMethod === 'Cash on Delivery')
        paymentMethod = 'cash_on_delivery';
      else if (paymentMethod === 'Credit Card') paymentMethod = 'credit_card';
      else if (paymentMethod === 'Debit Card') paymentMethod = 'debit_card';
      else if (paymentMethod === 'UPI') paymentMethod = 'upi';
      else if (paymentMethod === 'Bank Transfer') paymentMethod = 'bank_transfer';

      const orderData = {
        items: order.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          variation: item.variation || undefined,
        })),
        supplier: order.supplier?._id || order.supplier,
        paymentMethod,
        deliveryAddress: order.deliveryAddress,
      };
      await ordersAPI.createOrder(orderData);
      setAlert({
        visible: true,
        title: 'Success',
        message: 'Order placed again successfully!',
        buttons: [{ text: 'OK', style: 'default' }],
      });
      fetchOrders();
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to place order again.',
        buttons: [{ text: 'OK', style: 'default' }],
      });
    } finally {
      setOrderAgainLoadingId(null);
    }
  };

  const handleCancelOrder = async (order) => {
    setAlert({
      visible: true,
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      buttons: [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            setCancellingOrderId(order._id);
            try {
              await ordersAPI.updateOrderStatus(order._id, 'cancelled');
              setAlert({
                visible: true,
                title: 'Order Cancelled',
                message: 'Your order has been cancelled.',
                buttons: [{ text: 'OK', style: 'default' }],
              });
              fetchOrders();
            } catch (error) {
              setAlert({
                visible: true,
                title: 'Error',
                message: 'Failed to cancel order.',
                buttons: [{ text: 'OK', style: 'default' }],
              });
            } finally {
              setCancellingOrderId(null);
            }
          },
        },
      ],
    });
  };

  const handleOpenReturnModal = (order) => {
    setReturningOrder(order);
    setReturnReason('');
    setReturnError('');
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async () => {
    if (!returnReason.trim()) {
      setReturnError('Please enter a reason for return.');
      return;
    }
    setIsSubmittingReturn(true);
    setReturningOrderId(returningOrder._id);
    setReturnError('');
    try {
      await ordersAPI.returnOrder(returningOrder._id, returnReason);
      setReturnSuccess(true);
      setShowReturnModal(false);
      setTimeout(() => setReturnSuccess(false), 2000);
      fetchOrders();
    } catch (err) {
      setReturnError(err?.response?.data?.message || 'Failed to request return.');
    } finally {
      setIsSubmittingReturn(false);
      setReturningOrderId(null);
    }
  };

  const handleGenerateInvoice = async (order) => {
    setGeneratingInvoiceId(order._id);
    try {
      const orderResponse = await ordersAPI.getOrderDetails(order._id);
      let orderDetails;
      if (orderResponse.data.data.order) {
        orderDetails = orderResponse.data.data.order;
      } else if (orderResponse.data.data) {
        orderDetails = orderResponse.data.data;
      } else {
        orderDetails = orderResponse.data;
      }

      let finalOrderData = orderDetails;
      let finalCustomerData = orderDetails.customer;
      let finalSupplierData = orderDetails.supplier;

      if (!orderDetails.orderId && !orderDetails._id) {
        finalOrderData = order;
        finalCustomerData = order.customer;
        finalSupplierData = order.supplier;
      }

      if (!finalCustomerData || !finalCustomerData.firstName) {
        if (user) {
          finalCustomerData = {
            firstName: user.firstName || 'Customer',
            lastName: user.lastName || 'Name',
            email: user.email || 'customer@example.com',
            phone: user.phone || 'N/A',
          };
        } else {
          finalCustomerData = {
            firstName: 'Customer',
            lastName: 'Name',
            email: 'customer@example.com',
            phone: 'N/A',
          };
        }
      }

      const pdfUri = await InvoiceService.generateInvoicePDF(
        finalOrderData,
        finalCustomerData,
        finalSupplierData
      );

      setAlert({
        visible: true,
        title: 'Invoice Generated Successfully! 📄',
        message: 'Your invoice has been created. What would you like to do with it?',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share Invoice',
            style: 'default',
            onPress: async () => {
              try {
                const shared = await InvoiceService.shareInvoice(
                  pdfUri,
                  order.orderId
                );
                if (!shared) {
                  setAlert({
                    visible: true,
                    title: 'Sharing Not Available',
                    message:
                      'Sharing is not available on this device. The invoice has been generated successfully.',
                    buttons: [{ text: 'OK', style: 'default' }],
                  });
                }
              } catch (error) {
                console.error('Error sharing invoice:', error);
                setAlert({
                  visible: true,
                  title: 'Error',
                  message: 'Failed to share invoice. Please try again.',
                  buttons: [{ text: 'OK', style: 'default' }],
                });
              }
            },
          },
          {
            text: 'Save to Device',
            style: 'default',
            onPress: async () => {
              try {
                const savedPath = await InvoiceService.saveInvoiceToDevice(
                  pdfUri,
                  order.orderId
                );
                setAlert({
                  visible: true,
                  title: 'Invoice Saved!',
                  message: `Invoice has been saved to your device.\nPath: ${savedPath}`,
                  buttons: [{ text: 'OK', style: 'default' }],
                });
              } catch (error) {
                console.error('Error saving invoice:', error);
                setAlert({
                  visible: true,
                  title: 'Error',
                  message: 'Failed to save invoice to device. Please try again.',
                  buttons: [{ text: 'OK', style: 'default' }],
                });
              }
            },
          },
        ],
      });
    } catch (error) {
      console.error('Invoice generation error:', error);
      setAlert({
        visible: true,
        title: 'Invoice Generation Failed',
        message: 'Unable to generate invoice at this time. Please try again later.',
        buttons: [{ text: 'OK', style: 'default' }],
      });
    } finally {
      setGeneratingInvoiceId(null);
    }
  };

  const getStatusColorClass = (status) => {
    const color = getStatusColor(status, 'order');
    if (color === '#10b981') return 'bg-green-50 border border-green-200';
    if (color === '#ef4444') return 'bg-red-50 border border-red-200';
    if (color === '#3b82f6') return 'bg-blue-50 border border-blue-200';
    if (color === '#8b5cf6') return 'bg-purple-50 border border-purple-200';
    if (color === '#f59e0b') return 'bg-amber-50 border border-amber-200';
    if (color === '#6b7280') return 'bg-gray-50 border border-gray-200';
    return 'bg-gray-50 border border-gray-200';
  };

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'All') return orders;
    return orders.filter((order) => getStatusText(order.status) === selectedFilter);
  }, [orders, selectedFilter]);

  const renderFilterTab = (filter) => (
    <TouchableOpacity
      key={filter}
      onPress={() => setSelectedFilter(filter)}
      className={`px-4 py-2.5 mr-3 rounded-lg ${
        selectedFilter === filter
          ? 'bg-emerald-500'
          : 'bg-white border border-gray-200'
      }`}
    >
      <Text
        className={`font-medium ${
          selectedFilter === filter ? 'text-white' : 'text-gray-600'
        } ${responsiveValue('text-xs', 'text-sm', 'text-sm')}`}
      >
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }) => {
    let returnAvailable = false;
    let daysLeft = 0;

    if (item.status === 'delivered' && item.status !== 'returned') {
      const deliveryDate = item.deliveredAt || item.updatedAt || item.createdAt;

      if (deliveryDate) {
        const daysSinceDelivery =
          (new Date() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24);
        daysLeft = Math.max(0, 7 - Math.floor(daysSinceDelivery));
        returnAvailable = daysSinceDelivery <= 7;

        console.log('Return Status Debug:', {
          orderId: item._id,
          status: item.status,
          deliveryDate: deliveryDate,
          daysSinceDelivery: daysSinceDelivery,
          daysLeft: daysLeft,
          returnAvailable: returnAvailable,
        });
      }
    }

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
        className={`bg-white mx-4 mb-4 rounded-xl border border-gray-100 ${responsiveValue(
          'p-4',
          'p-5',
          'p-5'
        )}`}
        style={{
          backgroundColor: '#ffffff',
          borderLeftWidth: 4,
          borderLeftColor: getStatusColor(item.status, 'order'),
        }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 flex-row items-center">
            {item.items &&
            item.items.length > 0 &&
            item.items[0].product?.images &&
            item.items[0].product.images.length > 0 &&
            item.items[0].product.images[0].url ? (
              <Image
                source={{ uri: item.items[0].product.images[0].url }}
                className={`${responsiveValue('w-10 h-10', 'w-12 h-12', 'w-14 h-14')} rounded-lg mr-3`}
              />
            ) : (
              <View
                className={`${responsiveValue(
                  'w-10 h-10',
                  'w-12 h-12',
                  'w-14 h-14'
                )} rounded-lg bg-gray-50 items-center justify-center mr-3 border border-gray-100`}
              >
                <ShoppingCart
                  size={responsiveValue(18, 20, 20)}
                  color="#9ca3af"
                />
              </View>
            )}
            <View className="flex-1">
              <Text
                className={`${responsiveValue(
                  'text-sm',
                  'text-base',
                  'text-lg'
                )} font-semibold text-gray-900`}
                numberOfLines={1}
              >
                {item.items && item.items.length > 0
                  ? item.items.map((i) => i.product?.name || 'Product').join(', ')
                  : 'No Products'}
              </Text>
              <Text
                className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-500 mt-1`}
              >
                {item.items.length} item{item.items.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <View className={`px-3 py-1.5 rounded-lg ${getStatusColorClass(item.status)}`}>
            <View className="flex-row items-center">
              <Ionicons
                name="ellipse"
                size={responsiveValue(8, 10, 10)}
                color={getStatusColor(item.status, 'order')}
              />
              <Text
                className={`ml-1.5 ${responsiveValue('text-xs', 'text-xs', 'text-sm')} font-semibold`}
                style={{ color: getStatusColor(item.status, 'order') }}
              >
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badges - FIXED LOGIC */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {item.status === 'delivered' && item.status !== 'returned' && (
            <View
              className={`px-3 py-1.5 rounded-lg ${
                returnAvailable
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  returnAvailable ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {returnAvailable
                  ? `🔄 Return Available (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)`
                  : '❌ Return Not Available'}
              </Text>
            </View>
          )}
          {item.status === 'returned' && (
            <View className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
              <Text className="text-xs font-medium text-red-700">
                Returned{item.returnReason ? `: ${item.returnReason}` : ''}
              </Text>
            </View>
          )}
          {item.replacementStatus && (
            <View className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
              <Text className="text-xs font-medium text-amber-700">
                Replacement:{' '}
                {item.replacementStatus.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </View>
          )}
        </View>

        {/* Order Details */}
        <View className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons
                name="calendar-outline"
                size={responsiveValue(14, 16, 16)}
                color="#6b7280"
              />
              <Text
                className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-700 ml-2 font-medium`}
              >
                {item.createdAt ? format(new Date(item.createdAt), 'dd MMM yyyy') : ''}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons
                name="pricetag-outline"
                size={responsiveValue(14, 16, 16)}
                color="#6b7280"
              />
              <Text
                className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-700 ml-2 font-medium`}
              >
                ₹{calculateTotalAmount(item).toFixed(2)}
              </Text>
            </View>
          </View>
          {item.address && (
            <View className="flex-row items-start mt-2">
              <Ionicons
                name="location-outline"
                size={responsiveValue(14, 16, 16)}
                color="#6b7280"
                style={{ marginTop: 2 }}
              />
              <Text
                className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-600 ml-2 flex-1`}
                numberOfLines={2}
              >
                {item.address?.addressLine1 || item.address}
              </Text>
            </View>
          )}
          {item.paymentMethod && (
            <View className="flex-row items-center mt-2">
              <Ionicons
                name="card-outline"
                size={responsiveValue(14, 16, 16)}
                color="#6b7280"
              />
              <Text
                className={`${responsiveValue('text-xs', 'text-sm', 'text-sm')} text-gray-600 ml-2 flex-1`}
                numberOfLines={1}
              >
                {item.paymentMethod}
              </Text>
            </View>
          )}
        </View>

        {/* Total Amount - Using backend GST: subtotal(discounted) + gst(from backend) + shipping + platformFee */}
        <View className="flex-row justify-between items-center mb-4 p-3 bg-white rounded-lg border border-gray-100">
          <Text
            className={`${responsiveValue('text-sm', 'text-base', 'text-base')} text-gray-700 font-semibold`}
          >
            Total Amount:
          </Text>
          <Text
            className={`${responsiveValue('text-lg', 'text-xl', 'text-xl')} font-bold text-gray-900`}
          >
            ₹{calculateTotalAmount(item).toFixed(2)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center mt-2">
          {/* View Details Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
            className={`${responsiveValue('flex-1', 'flex-1', 'flex-1')} mr-2 rounded-lg overflow-hidden`}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              className={`${responsiveValue('py-2.5', 'py-3', 'py-3')} px-3 items-center justify-center flex-row rounded-lg`}
            >
              <Ionicons
                name="eye-outline"
                size={responsiveValue(14, 16, 16)}
                color="white"
              />
              <Text
                className={`text-white font-semibold ${responsiveValue(
                  'text-xs',
                  'text-sm',
                  'text-sm'
                )} ml-2`}
              >
                Details
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Order Again Button - Only for delivered */}
          {item.status === 'delivered' && (
            <TouchableOpacity
              onPress={() => handleOrderAgain(item)}
              disabled={orderAgainLoadingId === item._id}
              className={`${responsiveValue('flex-1', 'flex-1', 'flex-1')} mx-2 rounded-lg overflow-hidden`}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                className={`${responsiveValue('py-2.5', 'py-3', 'py-3')} px-3 items-center justify-center flex-row rounded-lg`}
              >
                {orderAgainLoadingId === item._id ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons
                      name="repeat-outline"
                      size={responsiveValue(14, 16, 16)}
                      color="white"
                    />
                    <Text
                      className={`text-white font-semibold ${responsiveValue(
                        'text-xs',
                        'text-sm',
                        'text-sm'
                      )} ml-2`}
                    >
                      Order Again
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Cancel Button - Only for pending orders (not packaging or processing) */}
          {item.status === 'pending' && (
            <TouchableOpacity
              onPress={() => handleCancelOrder(item)}
              disabled={cancellingOrderId === item._id}
              className={`${responsiveValue(
                'w-9 h-9',
                'w-10 h-10',
                'w-10 h-10'
              )} rounded-lg bg-red-50 border border-red-200 items-center justify-center mx-1`}
            >
              {cancellingOrderId === item._id ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <X size={responsiveValue(16, 18, 18)} color="#ef4444" />
              )}
            </TouchableOpacity>
          )}

          {/* Return Button - Only for delivered orders that are eligible for return */}
          {item.status === 'delivered' && returnAvailable && (
            <TouchableOpacity
              onPress={() => handleOpenReturnModal(item)}
              disabled={returningOrderId === item._id}
              className={`w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 items-center justify-center mx-1`}
            >
              {returningOrderId === item._id ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <RotateCcw size={18} color="#3b82f6" />
              )}
            </TouchableOpacity>
          )}

          {/* Invoice Button - Only for delivered */}
          {item.status === 'delivered' && (
            <TouchableOpacity
              onPress={() => handleGenerateInvoice(item)}
              disabled={generatingInvoiceId === item._id}
              className={`${responsiveValue(
                'w-9 h-9',
                'w-10 h-10',
                'w-10 h-10'
              )} rounded-lg ${
                generatingInvoiceId === item._id
                  ? 'bg-gray-100'
                  : 'bg-gray-50 border border-gray-200'
              } items-center justify-center ml-1`}
            >
              {generatingInvoiceId === item._id ? (
                <ActivityIndicator size="small" color="#6b7280" />
              ) : (
                <FileText size={responsiveValue(16, 18, 18)} color="#10b981" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <View
        className={`${responsiveValue(
          'w-24 h-24',
          'w-28 h-28',
          'w-32 h-32'
        )} bg-gray-50 rounded-2xl items-center justify-center mb-6 border border-gray-100`}
      >
        <ShoppingCart size={responsiveValue(36, 44, 44)} color="#9ca3af" />
      </View>
      <Text
        className={`${responsiveValue('text-xl', 'text-2xl', 'text-2xl')} font-bold text-gray-900 mb-3 text-center`}
      >
        No Orders Yet
      </Text>
      <Text
        className={`${responsiveValue('text-base', 'text-lg', 'text-lg')} text-gray-600 text-center mb-8 leading-6`}
      >
        {selectedFilter === 'All'
          ? 'Start exploring our products and place your first order!'
          : `No ${selectedFilter.toLowerCase()} orders found`}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate(SCREEN_NAMES.HOME)}
        className={`bg-emerald-500 ${responsiveValue(
          'px-6 py-3',
          'px-8 py-4',
          'px-8 py-4'
        )} rounded-lg`}
      >
        <Text className="text-white font-semibold text-base">
          Browse Products
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-600 mt-4 font-medium">
          Loading your orders...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        showBack={true}
        title="My Orders"
        children={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="py-3"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {filterOptions.map(renderFilterTab)}
          </ScrollView>
        }
      />

      {/* Orders List */}
      <View className="flex-1">
        {filteredOrders.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderItem}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#10B981']}
                tintColor="#10B981"
              />
            }
          />
        )}
      </View>

      {/* Return Modal */}
      <Modal
        visible={showReturnModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReturnModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-200">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-gray-900">Return Order</Text>
              <TouchableOpacity
                onPress={() => setShowReturnModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-50 items-center justify-center"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {returningOrder && (
              <View className="bg-gray-50 p-4 rounded-lg mb-5 border border-gray-200">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  Order #{returningOrder.orderId || returningOrder._id}
                </Text>
                <Text className="text-sm text-gray-600">
                  {returningOrder.items?.length || 0} item
                  {(returningOrder.items?.length || 0) > 1 ? 's' : ''} • ₹
                  {calculateTotalAmount(returningOrder).toFixed(2)}
                </Text>
              </View>
            )}

            <Text className="text-base font-semibold text-gray-800 mb-3">
              Return Reason *
            </Text>
            <TextInput
              value={returnReason}
              onChangeText={setReturnReason}
              placeholder="Please provide a detailed reason for your return request..."
              placeholderTextColor="#9ca3af"
              className="border border-gray-300 rounded-xl p-4 h-32 text-gray-800 text-base leading-5"
              multiline
              textAlignVertical="top"
            />
            {returnError && (
              <Text
                className={`${responsiveValue(
                  'text-sm',
                  'text-base',
                  'text-base'
                )} text-red-500 mt-3 font-medium`}
              >
                {returnError}
              </Text>
            )}
            <View className="mt-6">
              <Button
                title={
                  isSubmittingReturn
                    ? 'Submitting Return Request...'
                    : 'Submit Return Request'
                }
                onPress={handleSubmitReturn}
                loading={isSubmittingReturn}
                disabled={isSubmittingReturn || !returnReason.trim()}
                fullWidth
              />
              <Button
                title="Cancel"
                onPress={() => setShowReturnModal(false)}
                variant="ghost"
                className="mt-3"
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Return Success Toast */}
      {returnSuccess && (
        <View className="absolute top-20 left-0 right-0 items-center z-10">
          <View className="bg-green-50 px-6 py-4 rounded-xl border border-green-200">
            <Text className="text-green-800 font-semibold text-base">
              Return request submitted successfully!
            </Text>
          </View>
        </View>
      )}

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});