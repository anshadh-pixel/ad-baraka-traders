const STORAGE_KEYS = {
  BUSINESS: 'bizflow_business_v3',
  PRODUCTS: 'bizflow_products_v3',
  CUSTOMERS: 'bizflow_customers_v3',
  THEME: 'bizflow_theme_mode'
};

export const DEFAULT_BUSINESS = {
  name: "Ad-Baraka Traders",
  owner: "Shafi",
  phone: "9847123456",
  place: "Calicut, Kerala",
  currency: "₹",
};

export const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Regular Supply (36 Units)",
    basePrice: 16,
    unit: "Unit",
  }
];

// Exact 7 customers matching the user's Excel sheet:
// kalavar (kodanchery, 36, 15, 540, del: v, col: v)
// skm (kalpatta, 36, 18, 648, del: v, col: x)
// farm house (erumad, 36, 16, 576, del: v, col: x)
// asif azna (sm, 36, 15, 540, del: v, col: v)
// home land (kodually, 36, 18, 648, del: v, col: v)
// varnam (chulliyod, 36, 18, 648, del: x, col: x)
// sithara furniture (erumad, 36, 16, 576, del: x, col: x)
export const DEFAULT_CUSTOMERS = [
  {
    id: "cust-kalavar",
    productId: "prod-1",
    customerName: "kalavar",
    customerPlace: "kodanchery",
    customerPhone: "",
    quantity: 36,
    customRate: 15,
    totalAmount: 540,
    isDelivered: true,
    isCollected: true,
    bills: [
      {
        id: "INV-1001",
        date: "2026-10-15",
        quantity: 36,
        rate: 15,
        totalAmount: 540,
        paidAmount: 540,
        balanceAmount: 0,
        deliveryStatus: "delivered",
        notes: "Morning delivery"
      }
    ],
    payments: []
  },
  {
    id: "cust-skm",
    productId: "prod-1",
    customerName: "skm",
    customerPlace: "kalpatta",
    customerPhone: "",
    quantity: 36,
    customRate: 18,
    totalAmount: 648,
    isDelivered: true,
    isCollected: false,
    bills: [
      {
        id: "INV-1002",
        date: "2026-10-15",
        quantity: 36,
        rate: 18,
        totalAmount: 648,
        paidAmount: 0,
        balanceAmount: 648,
        deliveryStatus: "delivered",
        notes: "Pending collection"
      }
    ],
    payments: []
  },
  {
    id: "cust-farm-house",
    productId: "prod-1",
    customerName: "farm house",
    customerPlace: "erumad",
    customerPhone: "",
    quantity: 36,
    customRate: 16,
    totalAmount: 576,
    isDelivered: true,
    isCollected: false,
    bills: [
      {
        id: "INV-1003",
        date: "2026-10-15",
        quantity: 36,
        rate: 16,
        totalAmount: 576,
        paidAmount: 0,
        balanceAmount: 576,
        deliveryStatus: "delivered",
        notes: "Pending collection"
      }
    ],
    payments: []
  },
  {
    id: "cust-asif-azna",
    productId: "prod-1",
    customerName: "asif azna",
    customerPlace: "sm",
    customerPhone: "",
    quantity: 36,
    customRate: 15,
    totalAmount: 540,
    isDelivered: true,
    isCollected: true,
    bills: [
      {
        id: "INV-1004",
        date: "2026-10-15",
        quantity: 36,
        rate: 15,
        totalAmount: 540,
        paidAmount: 540,
        balanceAmount: 0,
        deliveryStatus: "delivered",
        notes: "Cleared"
      }
    ],
    payments: []
  },
  {
    id: "cust-home-land",
    productId: "prod-1",
    customerName: "home land",
    customerPlace: "kodually",
    customerPhone: "",
    quantity: 36,
    customRate: 18,
    totalAmount: 648,
    isDelivered: true,
    isCollected: true,
    bills: [
      {
        id: "INV-1005",
        date: "2026-10-15",
        quantity: 36,
        rate: 18,
        totalAmount: 648,
        paidAmount: 648,
        balanceAmount: 0,
        deliveryStatus: "delivered",
        notes: "Cleared"
      }
    ],
    payments: []
  },
  {
    id: "cust-varnam",
    productId: "prod-1",
    customerName: "varnam",
    customerPlace: "chulliyod",
    customerPhone: "",
    quantity: 36,
    customRate: 18,
    totalAmount: 648,
    isDelivered: false,
    isCollected: false,
    bills: [
      {
        id: "INV-1006",
        date: "2026-10-16",
        quantity: 36,
        rate: 18,
        totalAmount: 648,
        paidAmount: 0,
        balanceAmount: 648,
        deliveryStatus: "pending",
        notes: "Order placed"
      }
    ],
    payments: []
  },
  {
    id: "cust-sithara-furniture",
    productId: "prod-1",
    customerName: "sithara furniture",
    customerPlace: "erumad",
    customerPhone: "",
    quantity: 36,
    customRate: 16,
    totalAmount: 576,
    isDelivered: false,
    isCollected: false,
    bills: [
      {
        id: "INV-1007",
        date: "2026-10-16",
        quantity: 36,
        rate: 16,
        totalAmount: 576,
        paidAmount: 0,
        balanceAmount: 576,
        deliveryStatus: "pending",
        notes: "Order placed"
      }
    ],
    payments: []
  }
];

// Helper to compute customer totals and status
export const getCustomerStats = (customer) => {
  const qty = Number(customer.quantity) || 36;
  const rate = Number(customer.customRate || customer.price) || 0;
  const directAmount = Number(customer.totalAmount) || (qty * rate);

  const bills = Array.isArray(customer.bills) ? customer.bills : [];
  const billsTotal = bills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const billsPaid = bills.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const billsBalance = Math.max(0, billsTotal - billsPaid);

  let totalAmount = directAmount;
  let totalPaid = customer.isCollected ? directAmount : 0;
  let totalBalanceDue = customer.isCollected ? 0 : directAmount;

  if (bills.length > 0) {
    totalAmount = billsTotal;
    totalPaid = billsPaid;
    totalBalanceDue = billsBalance;
  }

  const isDelivered = customer.isDelivered !== undefined 
    ? Boolean(customer.isDelivered) 
    : (bills.length > 0 ? !bills.some(b => b.deliveryStatus === 'pending') : true);

  const isCollected = customer.isCollected !== undefined
    ? Boolean(customer.isCollected)
    : (totalBalanceDue === 0);

  return {
    quantity: qty,
    rate,
    totalBillsAmount: totalAmount,
    totalPaidAmount: totalPaid,
    totalBalanceDue: isCollected ? 0 : (totalBalanceDue > 0 ? totalBalanceDue : totalAmount),
    isDelivered,
    isCollected,
    pendingDeliveries: isDelivered ? 0 : 1,
    deliveryStatus: isDelivered ? 'delivered' : 'pending',
    billCount: bills.length,
    payments: customer.payments || [],
    lastBillDate: bills.length > 0 ? bills[bills.length - 1].date : null
  };
};

// Apply a payment received against customer's pending dues
export const applyCustomerPayment = (customer, paymentData) => {
  const amountToApply = Number(paymentData.amount) || 0;
  if (amountToApply <= 0) return customer;

  const newPayment = {
    id: `PAY-${Date.now().toString().slice(-5)}`,
    date: paymentData.date || new Date().toISOString().split('T')[0],
    amount: amountToApply,
    mode: paymentData.mode || 'Cash',
    notes: paymentData.notes || ''
  };

  let remaining = amountToApply;
  const updatedBills = (customer.bills || []).map(b => {
    const curBalance = Number(b.balanceAmount) || 0;
    if (remaining > 0 && curBalance > 0) {
      const deduction = Math.min(remaining, curBalance);
      remaining -= deduction;
      return {
        ...b,
        paidAmount: (Number(b.paidAmount) || 0) + deduction,
        balanceAmount: Math.max(0, curBalance - deduction)
      };
    }
    return b;
  });

  const stats = getCustomerStats({ ...customer, bills: updatedBills });
  const isNowCollected = stats.totalBalanceDue <= 0;

  return {
    ...customer,
    isCollected: isNowCollected,
    bills: updatedBills,
    payments: [...(customer.payments || []), newPayment]
  };
};

export const getStorageData = () => {
  try {
    const rawBusiness = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    const rawProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const rawCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);

    let business = rawBusiness ? JSON.parse(rawBusiness) : DEFAULT_BUSINESS;
    let products = rawProducts ? JSON.parse(rawProducts) : DEFAULT_PRODUCTS;
    let customers = rawCustomers ? JSON.parse(rawCustomers) : DEFAULT_CUSTOMERS;

    // Ensure all required fields exist for each customer
    customers = customers.map(c => {
      const qty = Number(c.quantity) || 36;
      const rate = Number(c.customRate || c.price) || 16;
      const amt = Number(c.totalAmount) || (qty * rate);
      return {
        ...c,
        quantity: qty,
        customRate: rate,
        totalAmount: amt,
        isDelivered: c.isDelivered !== undefined ? Boolean(c.isDelivered) : true,
        isCollected: c.isCollected !== undefined ? Boolean(c.isCollected) : false,
        bills: Array.isArray(c.bills) ? c.bills : [],
        payments: Array.isArray(c.payments) ? c.payments : []
      };
    });

    return { business, products, customers };
  } catch (err) {
    console.error("Storage load error", err);
    return {
      business: DEFAULT_BUSINESS,
      products: DEFAULT_PRODUCTS,
      customers: DEFAULT_CUSTOMERS
    };
  }
};

export const saveBusinessData = (business) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(business));
  } catch (err) {}
};

export const saveProductsData = (products) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {}
};

export const saveCustomersData = (customers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (err) {}
};

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  } catch {
    return 'dark';
  }
};

export const saveStoredTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {}
};

export const resetToDemoData = () => {
  saveBusinessData(DEFAULT_BUSINESS);
  saveProductsData(DEFAULT_PRODUCTS);
  saveCustomersData(DEFAULT_CUSTOMERS);
  return {
    business: DEFAULT_BUSINESS,
    products: DEFAULT_PRODUCTS,
    customers: DEFAULT_CUSTOMERS
  };
};
