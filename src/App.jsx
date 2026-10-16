import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductListView from './components/ProductListView';
import ProductCustomersView from './components/ProductCustomersView';
import CustomerDetailView from './components/CustomerDetailView';
import ProductModal from './components/ProductModal';
import CustomerModal from './components/CustomerModal';
import CreateBillModal from './components/CreateBillModal';
import BillPhotoModal from './components/BillPhotoModal';
import PaymentModal from './components/PaymentModal';
import { 
  getStorageData, 
  saveBusinessData, 
  saveProductsData, 
  saveCustomersData, 
  applyCustomerPayment, 
  getStoredTheme, 
  saveStoredTheme, 
  resetToDemoData, 
  getCustomerStats 
} from './utils/storage';

export default function App() {
  const [data, setData] = useState(() => getStorageData());
  const { business, products, customers } = data;

  // Theme Mode (Dark or Light)
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    document.body.className = theme === 'light' ? 'theme-light' : 'theme-dark';
    saveStoredTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // App opens on Home Screen (Products list)
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Modals
  const [productModal, setProductModal] = useState({ isOpen: false, product: null });
  const [customerModal, setCustomerModal] = useState({ isOpen: false, customer: null, product: null });
  const [createBillModal, setCreateBillModal] = useState({ isOpen: false, customer: null, product: null });
  const [billPhotoModal, setBillPhotoModal] = useState({ isOpen: false, bill: null, customer: null, product: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, customer: null, currentDue: 0 });
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0] || null;
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  // 1-Tap Toggle: Delivery Status
  const handleToggleDelivery = (customerId) => {
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        const nextDel = !c.isDelivered;
        return {
          ...c,
          isDelivered: nextDel
        };
      }
      return c;
    });

    saveCustomersData(updatedCustomers);
    setData(prev => ({ ...prev, customers: updatedCustomers }));
    const target = updatedCustomers.find(c => c.id === customerId);
    showToast(`${target.customerName}: ${target.isDelivered ? '✅ Marked Delivered' : '⏳ Marked To Deliver'}`);
  };

  // Deliver an order from Pending Orders tab and move to Customers list
  const handleDeliverOrder = (customerId) => {
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          isDelivered: true
        };
      }
      return c;
    });

    saveCustomersData(updatedCustomers);
    setData(prev => ({ ...prev, customers: updatedCustomers }));
    const target = updatedCustomers.find(c => c.id === customerId);
    showToast(`✅ "${target?.customerName}" delivered! Moved to Customers list.`);
  };

  // 1-Tap Toggle: Amount Collected Status
  const handleToggleCollected = (customerId) => {
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        const nextCol = !c.isCollected;
        return {
          ...c,
          isCollected: nextCol
        };
      }
      return c;
    });

    saveCustomersData(updatedCustomers);
    setData(prev => ({ ...prev, customers: updatedCustomers }));
    const target = updatedCustomers.find(c => c.id === customerId);
    showToast(`${target.customerName}: ${target.isCollected ? '✅ Amount Collected' : '⏳ Payment Due'}`);
  };

  // PRODUCT HANDLERS
  const handleSaveProduct = (productData) => {
    let updatedProducts;
    const exists = products.some(p => p.id === productData.id);
    if (exists) {
      updatedProducts = products.map(p => p.id === productData.id ? productData : p);
      showToast(`Updated "${productData.name}"`);
    } else {
      updatedProducts = [productData, ...products];
      showToast(`Added product "${productData.name}"`);
    }
    saveProductsData(updatedProducts);
    setData(prev => ({ ...prev, products: updatedProducts }));
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Delete this product and all its customer records?")) {
      const updatedProducts = products.filter(p => p.id !== productId);
      const updatedCustomers = customers.filter(c => c.productId !== productId);
      saveProductsData(updatedProducts);
      saveCustomersData(updatedCustomers);
      setData(prev => ({ ...prev, products: updatedProducts, customers: updatedCustomers }));
      if (selectedProductId === productId) {
        setSelectedProductId(updatedProducts.length > 0 ? updatedProducts[0].id : null);
        setSelectedCustomerId(null);
      }
      showToast("Product deleted");
    }
  };

  // CUSTOMER HANDLERS
  const handleSaveCustomer = (customerData) => {
    let updatedCustomers;
    const exists = customers.some(c => c.id === customerData.id);
    if (exists) {
      updatedCustomers = customers.map(c => c.id === customerData.id ? customerData : c);
      showToast(`Saved customer "${customerData.customerName}"`);
    } else {
      updatedCustomers = [customerData, ...customers];
      showToast(`Added customer "${customerData.customerName}"`);
    }
    saveCustomersData(updatedCustomers);
    setData(prev => ({ ...prev, customers: updatedCustomers }));
  };

  const handleDeleteCustomer = (customerId) => {
    const updatedCustomers = customers.filter(c => c.id !== customerId);
    saveCustomersData(updatedCustomers);
    setData(prev => ({ ...prev, customers: updatedCustomers }));
    if (selectedCustomerId === customerId) {
      setSelectedCustomerId(null);
    }
    showToast("Customer removed");
  };

  const handleUpdateCustomer = (updatedCustomer) => {
    handleSaveCustomer(updatedCustomer);
  };

  // Bill Creation Handler (Separate bill workflow as requested!)
  const handleSaveBill = (billData, customer, openPhotoModal = false) => {
    const currentBills = Array.isArray(customer.bills) ? customer.bills : [];
    const updatedBills = [...currentBills, billData];
    
    // Auto-update customer delivered and collected state if bill is paid and delivered
    const isNowCollected = billData.balanceAmount <= 0;
    const isNowDelivered = billData.deliveryStatus === 'delivered';

    const updatedCustomer = {
      ...customer,
      isCollected: isNowCollected ? true : customer.isCollected,
      isDelivered: isNowDelivered ? true : customer.isDelivered,
      bills: updatedBills
    };

    handleSaveCustomer(updatedCustomer);

    if (openPhotoModal) {
      setBillPhotoModal({
        isOpen: true,
        bill: billData,
        customer: updatedCustomer,
        product: selectedProduct
      });
    } else {
      showToast(`Bill created for ${customer.customerName}`);
    }
  };

  // Payment Recording
  const handleSavePayment = (paymentData) => {
    if (!paymentModal.customer) return;
    const updatedCustomer = applyCustomerPayment(paymentModal.customer, paymentData);
    handleSaveCustomer(updatedCustomer);
    showToast(`Payment of ${business?.currency || '₹'}${paymentData.amount} recorded!`);
  };

  // Safe Refresh/Sync Data Handler (Never deletes data!)
  const handleRefreshData = () => {
    const freshData = getStorageData();
    setData(freshData);
    showToast("✅ Data Synced & Refreshed!");
  };

  const currentCustomerStats = selectedCustomer ? getCustomerStats(selectedCustomer) : null;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f1f5f9]' : 'bg-[#0b0f19]'} transition-colors flex flex-col font-sans`}>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg animate-fade-in pointer-events-none">
          {toast}
        </div>
      )}

      {/* Header with Theme Toggle, Safe Sync Button & Home Navigation */}
      <Header
        business={business}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onRefreshData={handleRefreshData}
        onGoHome={() => {
          setSelectedProductId(null);
          setSelectedCustomerId(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 pt-4 pb-12 safe-bottom-area">
        {/* LEVEL 1: PRODUCTS LIST (Home Screen - default landing screen!) */}
        {!selectedProductId && (
          <ProductListView
            products={products}
            customers={customers}
            currency={business?.currency || "₹"}
            onSelectProduct={(p) => {
              setSelectedProductId(p.id);
              setSelectedCustomerId(null);
            }}
            onAddProduct={() => setProductModal({ isOpen: true, product: null })}
            onEditProduct={(p) => setProductModal({ isOpen: true, product: p })}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {/* LEVEL 2: CUSTOMERS FOR SELECTED PRODUCT (Excel-Style Direct Sales View) */}
        {selectedProductId && !selectedCustomerId && selectedProduct && (
          <ProductCustomersView
            product={selectedProduct}
            customers={customers}
            currency={business?.currency || "₹"}
            onBack={() => {
              setSelectedProductId(null);
              setSelectedCustomerId(null);
            }}
            onSelectCustomer={(c) => setSelectedCustomerId(c.id)}
            onAddCustomer={(p) => setCustomerModal({ isOpen: true, customer: null, product: p })}
            onEditCustomer={(c) => setCustomerModal({ isOpen: true, customer: c, product: selectedProduct })}
            onDeleteCustomer={handleDeleteCustomer}
            onToggleDelivery={handleToggleDelivery}
            onToggleCollected={handleToggleCollected}
            onDeliverOrder={handleDeliverOrder}
            onOpenCreateBill={(c) => setCreateBillModal({ isOpen: true, customer: c, product: selectedProduct })}
          />
        )}

        {/* LEVEL 3: CUSTOMER DETAILS & BILL HISTORY */}
        {selectedProductId && selectedCustomerId && selectedCustomer && (
          <CustomerDetailView
            customer={selectedCustomer}
            product={selectedProduct}
            business={business}
            currency={business?.currency || "₹"}
            onBack={() => setSelectedCustomerId(null)}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onEditCustomerProfile={(c) => setCustomerModal({ isOpen: true, customer: c, product: selectedProduct })}
            onOpenBillPhoto={(bill, cust, prod) => setBillPhotoModal({ isOpen: true, bill, customer: cust, product: prod })}
            onOpenPaymentModal={(cust, due) => setPaymentModal({ isOpen: true, customer: cust, currentDue: due })}
          />
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {productModal.isOpen && (
        <ProductModal
          isOpen={productModal.isOpen}
          onClose={() => setProductModal({ isOpen: false, product: null })}
          onSave={handleSaveProduct}
          initialProduct={productModal.product}
          currency={business?.currency || "₹"}
        />
      )}

      {/* MODAL: ADD / EDIT CUSTOMER */}
      {customerModal.isOpen && (
        <CustomerModal
          isOpen={customerModal.isOpen}
          onClose={() => setCustomerModal({ isOpen: false, customer: null, product: null })}
          onSave={handleSaveCustomer}
          product={customerModal.product || selectedProduct}
          initialCustomer={customerModal.customer}
          currency={business?.currency || "₹"}
        />
      )}

      {/* MODAL: SEPARATE CREATE BILL (As Requested by User!) */}
      {createBillModal.isOpen && (
        <CreateBillModal
          isOpen={createBillModal.isOpen}
          onClose={() => setCreateBillModal({ isOpen: false, customer: null, product: null })}
          onSaveBill={handleSaveBill}
          initialCustomer={createBillModal.customer}
          customers={customers.filter(c => c.productId === (selectedProduct?.id || 'prod-1'))}
          product={selectedProduct}
          currency={business?.currency || "₹"}
        />
      )}

      {/* MODAL: OFFICIAL BILL PHOTO (WHATSAPP SHARE & IMAGE DOWNLOAD) */}
      {billPhotoModal.isOpen && billPhotoModal.bill && (
        <BillPhotoModal
          isOpen={billPhotoModal.isOpen}
          onClose={() => setBillPhotoModal({ isOpen: false, bill: null, customer: null, product: null })}
          bill={billPhotoModal.bill}
          customer={billPhotoModal.customer || selectedCustomer}
          product={billPhotoModal.product || selectedProduct}
          business={business}
          totalBalanceDue={currentCustomerStats?.totalBalanceDue || 0}
        />
      )}

      {/* MODAL: RECORD PAYMENT RECEIVED */}
      {paymentModal.isOpen && paymentModal.customer && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, customer: null, currentDue: 0 })}
          onSavePayment={handleSavePayment}
          customer={paymentModal.customer}
          currentDue={paymentModal.currentDue}
          currency={business?.currency || "₹"}
          business={business}
        />
      )}
    </div>
  );
}
