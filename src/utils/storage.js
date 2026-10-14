const STORAGE_KEYS = {
  BUSINESS: 'bizflow_business_v2',
  PRODUCTS: 'bizflow_products_v2',
  CUSTOMERS: 'bizflow_customers_v2',
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
    name: "Basmati Rice 25kg",
    basePrice: 1750,
    unit: "Bag",
  },
  {
    id: "prod-2",
    name: "Pure Coconut Oil 15L",
    basePrice: 2850,
    unit: "Tin",
  },
  {
    id: "prod-3",
    name: "Black Pepper Grade A",
    basePrice: 620,
    unit: "kg",
  },
  {
    id: "prod-4",
    name: "Tea Dust 5kg",
    basePrice: 1350,
    unit: "Pack",
  }
];

export const DEFAULT_CUSTOMERS = [
  {
    id: "cust-1",
    productId: "prod-1",
    customerName: "Rahim Hotel & Caterers",
    customerPhone: "9847112233",
    customerPlace: "Perinthalmanna",
    customRate: 1680,
    bills: [
      {
        id: "INV-101",
        date: "2026-10-12",
        quantity: 10,
        rate: 1680,
        totalAmount: 16800,
        paidAmount: 10000,
        balanceAmount: 6800,
        deliveryStatus: "delivered",
        notes: "Morning batch"
      },
      {
        id: "INV-102",
        date: "2026-10-14",
        quantity: 5,
        rate: 1680,
        totalAmount: 8400,
        paidAmount: 8400,
        balanceAmount: 0,
        deliveryStatus: "pending",
        notes: "Deliver by evening"
      }
    ],
    payments: []
  },
  {
    id: "cust-2",
    productId: "prod-1",
    customerName: "Modern Supermarket",
    customerPhone: "9745889900",
    customerPlace: "Calicut",
    customRate: 1720,
    bills: [
      {
        id: "INV-103",
        date: "2026-10-13",
        quantity: 15,
        rate: 1720,
        totalAmount: 25800,
        paidAmount: 25800,
        balanceAmount: 0,
        deliveryStatus: "delivered",
        notes: "UPI payment"
      }
    ],
    payments: []
  },
  {
    id: "cust-3",
    productId: "prod-2",
    customerName: "Kerala Bakery & Chips",
    customerPhone: "9895667788",
    customerPlace: "Kochi",
    customRate: 2750,
    bills: [
      {
        id: "INV-201",
        date: "2026-10-14",
        quantity: 6,
        rate: 2750,
        totalAmount: 16500,
        paidAmount: 10000,
        balanceAmount: 6500,
        deliveryStatus: "pending",
        notes: "Balance on delivery"
      }
    ],
    payments: []
  }
];

// Helper to compute customer totals
export const getCustomerStats = (customer) => {
  const bills = customer.bills || [];
  const totalBillsAmount = bills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalPaidAmount = bills.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const totalBalanceDue = Math.max(0, totalBillsAmount - totalPaidAmount);
  
  const pendingDeliveries = bills.filter(b => b.deliveryStatus === 'pending').length;
  const deliveryStatus = pendingDeliveries > 0 ? 'pending' : (bills.length > 0 ? 'delivered' : 'no_orders');
  
  return {
    totalBillsAmount,
    totalPaidAmount,
    totalBalanceDue,
    pendingDeliveries,
    deliveryStatus,
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

  // Reduce balance from pending bills (oldest unpaid first)
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

  return {
    ...customer,
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

    // Ensure payments array exists
    customers = customers.map(c => ({
      ...c,
      bills: Array.isArray(c.bills) ? c.bills : [],
      payments: Array.isArray(c.payments) ? c.payments : []
    }));

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
