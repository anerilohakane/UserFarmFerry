import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { format } from 'date-fns';

export default function InvoicePreview({ order, customer, supplier }) {
  if (!order || !customer || !supplier) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invoice data not available</Text>
      </View>
    );
  }

  const invoiceDate = format(new Date(), 'dd MMM yyyy');
  const deliveryDate = order.deliveredAt ? format(new Date(order.deliveredAt), 'dd MMM yyyy') : 'N/A';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FARM FERRY</Text>
        <Text style={styles.headerSubtitle}>Purely Fresh, Perfectly Delivered!!</Text>
      </View>

      {/* Invoice Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Invoice No:</Text>
          <Text style={styles.detailValue}>{order.orderId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Invoice Date:</Text>
          <Text style={styles.detailValue}>{invoiceDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery Date:</Text>
          <Text style={styles.detailValue}>{deliveryDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order Status:</Text>
          <Text style={styles.detailValue}>{order.status.toUpperCase()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Status:</Text>
          <Text style={styles.detailValue}>{order.paymentStatus.toUpperCase()}</Text>
        </View>
      </View>

      {/* Customer Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name:</Text>
          <Text style={styles.detailValue}>{customer.firstName} {customer.lastName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{customer.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{customer.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={styles.detailValue}>{formatAddress(order.deliveryAddress)}</Text>
        </View>
      </View>

      {/* Supplier Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supplier Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Business Name:</Text>
          <Text style={styles.detailValue}>{supplier.businessName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{supplier.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{supplier.phone}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items && order.items.length > 0 ? (
          order.items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.product?.name || 'Product'}</Text>
                <Text style={styles.itemPrice}>₹{item.totalPrice?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>
                <Text style={styles.itemDetail}>Price: ₹{item.price?.toFixed(2) || '0.00'}</Text>
                {item.variation && (
                  <Text style={styles.itemVariation}>
                    {item.variation.name}: {item.variation.value}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noItems}>No items found</Text>
        )}
      </View>

      {/* Price Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>₹{order.subtotal?.toFixed(2) || '0.00'}</Text>
        </View>
        {order.discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue}>-₹{order.discountAmount?.toFixed(2) || '0.00'}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Taxes:</Text>
          <Text style={styles.summaryValue}>₹{order.taxes?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Charge:</Text>
          <Text style={styles.summaryValue}>₹{order.deliveryCharge?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>₹{order.totalAmount?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method:</Text>
          <Text style={styles.summaryValue}>{formatPaymentMethod(order.paymentMethod)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for choosing Farm Ferry!</Text>
        <Text style={styles.footerText}>For any queries, please contact our support team.</Text>
        <Text style={styles.footerText}>Generated on: {format(new Date(), 'dd MMM yyyy HH:mm')}</Text>
      </View>
    </ScrollView>
  );
}

function formatAddress(address) {
  if (!address) return 'N/A';
  
  if (typeof address === 'string') {
    return address;
  }
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  
  return parts.length > 0 ? parts.join(', ') : 'N/A';
}

function formatPaymentMethod(paymentMethod) {
  if (!paymentMethod) return 'N/A';
  
  return paymentMethod
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#10b981',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 2,
    textAlign: 'right',
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  itemDetails: {
    marginTop: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemVariation: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  noItems: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  footer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: 16,
    marginTop: 50,
  },
}); 