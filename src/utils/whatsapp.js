export const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  let cleaned = phone.toString().replace(/\D/g, "");
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  return cleaned;
};

export const generateWhatsAppBillText = ({ customer, product, bill, business, totalCustomerBalance }) => {
  const currency = business?.currency || "₹";
  const storeName = business?.name || "Our Business";
  const unit = product?.unit || "unit";

  const lines = [
    `🧾 *${storeName.toUpperCase()} - BILL / INVOICE*`,
    `--------------------------------`,
    `👤 *Customer:* ${customer?.customerName || "Valued Customer"}`,
    customer?.customerPlace ? `📍 *Place:* ${customer.customerPlace}` : null,
    `📅 *Date:* ${bill?.date || new Date().toISOString().split('T')[0]}`,
    bill?.id ? `📄 *Bill No:* ${bill.id}` : null,
    `--------------------------------`,
    product?.name ? `📦 *Item:* ${product.name}` : null,
    bill?.quantity ? `🔢 *Quantity:* ${bill.quantity} ${unit}` : null,
    bill?.rate ? `🏷️ *Rate:* ${currency}${Number(bill.rate).toLocaleString()} / ${unit}` : null,
    `--------------------------------`,
    bill?.totalAmount !== undefined ? `💰 *Bill Total:* ${currency}${Number(bill.totalAmount).toLocaleString()}` : null,
    bill?.paidAmount !== undefined ? `✅ *Paid Now:* ${currency}${Number(bill.paidAmount).toLocaleString()}` : null,
    bill?.balanceAmount !== undefined && Number(bill.balanceAmount) > 0 
      ? `⚠️ *Bill Balance:* ${currency}${Number(bill.balanceAmount).toLocaleString()}` 
      : null,
    totalCustomerBalance !== undefined
      ? `\n📌 *TOTAL OUTSTANDING DUE: ${currency}${Number(totalCustomerBalance).toLocaleString()}*`
      : null,
    bill?.deliveryStatus ? `\n🚚 *Delivery:* ${bill.deliveryStatus === 'delivered' ? '✅ Delivered' : '⏳ Delivery Pending'}` : null,
    bill?.notes ? `📝 *Note:* ${bill.notes}` : null,
    `--------------------------------`,
    `_Thank you for your business!_ 🙏`
  ].filter(Boolean);

  return lines.join("\n");
};

/**
 * Opens WhatsApp with the invoice text ready.
 * By default does NOT force a phone number, allowing user to pick ANY customer inside WhatsApp!
 */
export const sendBillOnWhatsApp = ({ 
  customer, 
  product, 
  bill, 
  business, 
  totalCustomerBalance,
  useSpecificPhone = false 
}) => {
  const text = generateWhatsAppBillText({ customer, product, bill, business, totalCustomerBalance });
  const phone = useSpecificPhone && customer?.customerPhone ? formatPhoneNumber(customer.customerPhone) : "";
  const encoded = encodeURIComponent(text);

  // If phone provided and requested, use it; otherwise open WhatsApp contact picker directly!
  const url = phone 
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` 
    : `https://api.whatsapp.com/send?text=${encoded}`;

  window.open(url, '_blank');
};
