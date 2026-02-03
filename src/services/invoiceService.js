import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { format } from 'date-fns';

export class InvoiceService {
  static async generateInvoicePDF(order, customer, supplier) {
    try {
      console.log('Generating invoice PDF for order:', order._id || order.orderId);
      console.log('Full order data:', JSON.stringify(order, null, 2));
      console.log('Customer data:', JSON.stringify(customer, null, 2));
      console.log('Supplier data:', JSON.stringify(supplier, null, 2));
      console.log('Order data summary:', { 
        status: order.status, 
        paymentStatus: order.paymentStatus, 
        paymentMethod: order.paymentMethod,
        hasItems: !!order.items,
        itemsCount: order.items?.length || 0,
        subtotal: order.subtotal,
        totalAmount: order.totalAmount,
        orderId: order.orderId
      });
      
      // Generate HTML content for the invoice
      const htmlContent = this.generateInvoiceHTML(order, customer, supplier);
      
      // Generate PDF from HTML
      const pdfUri = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      console.log('PDF generated successfully:', pdfUri.uri);
      return pdfUri.uri;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      console.error('Order data that caused error:', { 
        orderId: order._id || order.orderId,
        status: order.status, 
        paymentStatus: order.paymentStatus, 
        paymentMethod: order.paymentMethod 
      });
      throw new Error('Failed to generate invoice PDF');
    }
  }

  static generateInvoiceHTML(order, customer, supplier) {
    const invoiceDate = format(new Date(), 'dd MMM yyyy');
    const deliveryDate = order.deliveredAt ? format(new Date(order.deliveredAt), 'dd MMM yyyy') : 'N/A';
    
    // Debug logging for HTML generation
    console.log('=== HTML GENERATION DEBUG ===');
    console.log('Order object keys:', Object.keys(order || {}));
    console.log('Customer object keys:', Object.keys(customer || {}));
    console.log('Supplier object keys:', Object.keys(supplier || {}));
    console.log('Order ID:', order?.orderId || order?._id);
    console.log('Order Status:', order?.status);
    console.log('Payment Method:', order?.paymentMethod);
    console.log('Total Amount:', order?.totalAmount);
    console.log('Items:', order?.items);
    console.log('=== END HTML DEBUG ===');
    
    // Safely handle potentially undefined values
    const orderStatus = order.status || 'pending';
    const paymentStatus = order.paymentStatus || 'pending';
    const orderId = order.orderId || order._id || 'N/A';
    
    // Handle customer data (could be populated or separate object)
    const customerData = customer || order.customer;
    const customerName = customerData ? `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() : 'N/A';
    const customerEmail = customerData?.email || 'N/A';
    const customerPhone = customerData?.phone || 'N/A';
    
    // Handle supplier data (could be populated or separate object)
    const supplierData = supplier || order.supplier;
    const supplierName = supplierData?.businessName || 'N/A';
    const supplierEmail = supplierData?.email || 'N/A';
    const supplierPhone = supplierData?.phone || 'N/A';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${orderId}</title>
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header .subtitle {
            margin-top: 5px;
            opacity: 0.9;
            font-size: 16px;
          }
          .invoice-details {
            padding: 30px;
            border-bottom: 1px solid #e5e7eb;
          }
          .invoice-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .detail-section h3 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 18px;
            font-weight: 600;
          }
          .detail-item {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
            display: inline-block;
            width: 120px;
          }
          .detail-value {
            color: #374151;
          }
          .items-section {
            padding: 30px;
            border-bottom: 1px solid #e5e7eb;
          }
          .items-section h3 {
            margin: 0 0 20px 0;
            color: #374151;
            font-size: 18px;
            font-weight: 600;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th {
            background-color: #f9fafb;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
          }
          .items-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .variation {
            font-size: 12px;
            color: #6b7280;
            font-style: italic;
          }
          .summary-section {
            padding: 30px;
            background-color: #f9fafb;
          }
          .summary-section h3 {
            margin: 0 0 20px 0;
            color: #374151;
            font-size: 18px;
            font-weight: 600;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .summary-label {
            color: #6b7280;
          }
          .summary-value {
            color: #374151;
            font-weight: 500;
          }
          .total-row {
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #10b981;
          }
          .footer {
            padding: 20px 30px;
            background-color: #f3f4f6;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-delivered {
            background-color: #d1fae5;
            color: #065f46;
          }
          .status-paid {
            background-color: #dbeafe;
            color: #1e40af;
          }
          .status-pending {
            background-color: #fef3c7;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>FARM FERRY</h1>
            <div class="subtitle">Purely Fresh, Perfectly Delivered!!</div>
          </div>
          
          <div class="invoice-details">
            <div class="invoice-grid">
              <div class="detail-section">
                <h3>Invoice Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Invoice No:</span>
                  <span class="detail-value">${orderId}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Invoice Date:</span>
                  <span class="detail-value">${invoiceDate}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Delivery Date:</span>
                  <span class="detail-value">${deliveryDate}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Order Status:</span>
                  <span class="detail-value">
                    <span class="status-badge status-${orderStatus}">${orderStatus.replace(/_/g, ' ').toUpperCase()}</span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Payment Status:</span>
                  <span class="detail-value">
                    <span class="status-badge status-${paymentStatus}">${paymentStatus.toUpperCase()}</span>
                  </span>
                </div>
              </div>
              
              <div class="detail-section">
                <h3>Customer Details</h3>
                <div class="detail-item">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${customerName}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${customerEmail}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${customerPhone}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">${this.formatAddress(order.deliveryAddress)}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Supplier Details</h3>
              <div class="detail-item">
                <span class="detail-label">Business Name:</span>
                <span class="detail-value">${supplierName}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${supplierEmail}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${supplierPhone}</span>
              </div>
            </div>
          </div>
          
          <div class="items-section">
            <h3>Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Variation</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${this.generateItemsRows(order.items)}
              </tbody>
            </table>
          </div>
          
          <div class="summary-section">
            <h3>Price Summary</h3>
            <div class="summary-row">
              <span class="summary-label">Subtotal:</span>
              <span class="summary-value">₹${order.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            ${(order.discountAmount || 0) > 0 ? `
            <div class="summary-row">
              <span class="summary-label">Discount:</span>
              <span class="summary-value">-₹${order.discountAmount?.toFixed(2) || '0.00'}</span>
            </div>
            ` : ''}
            <div class="summary-row">
              <span class="summary-label">Taxes:</span>
              <span class="summary-value">₹${order.taxes?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Delivery Charge:</span>
              <span class="summary-value">₹${order.deliveryCharge?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="summary-row total-row">
              <span class="summary-label">Total Amount:</span>
              <span class="summary-value">₹${order.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Payment Method:</span>
              <span class="summary-value">${this.formatPaymentMethod(order.paymentMethod)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Farm Ferry!</p>
            <p>For any queries, please contact our support team.</p>
            <p>Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }

  static generateItemsRows(items) {
    if (!items || items.length === 0) {
      return '<tr><td colspan="5" style="text-align: center; color: #6b7280;">No items found</td></tr>';
    }

    return items.map((item, index) => {
      // Handle populated product data
      const productData = item.product;
      const productName = productData?.name || 'Product';
      const variation = item.variation ? `${item.variation.name || ''}: ${item.variation.value || ''}` : '';
      const quantity = item.quantity || 0;
      const price = item.price || item.discountedPrice || 0;
      const total = item.totalPrice || (quantity * price);

      return `
        <tr>
          <td>${productName}</td>
          <td>${variation ? `<span class="variation">${variation}</span>` : '-'}</td>
          <td>${quantity}</td>
          <td>₹${price.toFixed(2)}</td>
          <td>₹${total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  }

  static formatAddress(address) {
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

  static formatPaymentMethod(paymentMethod) {
    if (!paymentMethod || typeof paymentMethod !== 'string') return 'N/A';
    
    return paymentMethod
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  static async shareInvoice(pdfUri, orderId) {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Invoice - ${orderId}`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        console.log('Sharing not available on this platform');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error sharing invoice:', error);
      return false;
    }
  }

  static async saveInvoiceToDevice(pdfUri, orderId) {
    try {
      const fileName = `invoice-${orderId}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: pdfUri,
        to: fileUri
      });
      
      console.log('Invoice saved to:', fileUri);
      return fileUri;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw new Error('Failed to save invoice to device');
    }
  }

  // Test function to validate data structure
  static validateOrderData(order, customer, supplier) {
    console.log('=== INVOICE DATA VALIDATION ===');
    
    // Check order data
    console.log('Order ID:', order?.orderId || order?._id);
    console.log('Order Status:', order?.status);
    console.log('Payment Status:', order?.paymentStatus);
    console.log('Payment Method:', order?.paymentMethod);
    console.log('Subtotal:', order?.subtotal);
    console.log('Total Amount:', order?.totalAmount);
    console.log('Items Count:', order?.items?.length || 0);
    
    // Check customer data
    console.log('Customer Name:', customer?.firstName, customer?.lastName);
    console.log('Customer Email:', customer?.email);
    console.log('Customer Phone:', customer?.phone);
    
    // Check supplier data
    console.log('Supplier Name:', supplier?.businessName);
    console.log('Supplier Email:', supplier?.email);
    console.log('Supplier Phone:', supplier?.phone);
    
    // Check items data
    if (order?.items && order.items.length > 0) {
      console.log('First Item:', {
        productName: order.items[0]?.product?.name,
        quantity: order.items[0]?.quantity,
        price: order.items[0]?.price,
        totalPrice: order.items[0]?.totalPrice
      });
    }
    
    console.log('=== END VALIDATION ===');
  }
}

export default InvoiceService; 