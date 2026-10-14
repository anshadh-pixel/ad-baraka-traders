import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Download, 
  Check, 
  Image as ImageIcon, 
  Printer, 
  Store, 
  Share2, 
  Calendar, 
  FileText,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { generateBillImage, downloadBillPhoto, shareBillPhoto } from '../utils/billImageGenerator';
import { sendBillOnWhatsApp } from '../utils/whatsapp';
import { useScrollLock } from '../utils/useScrollLock';

export default function BillPhotoModal({
  isOpen,
  onClose,
  bill,
  customer,
  product,
  business,
  totalBalanceDue
}) {
  // Lock body scroll behind modal
  useScrollLock(isOpen);

  if (!isOpen || !bill) return null;

  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const currency = business?.currency || "₹";

  const invoiceNumber = bill.id || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  // Generate Image after DOM mounts
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    const timer = setTimeout(async () => {
      try {
        const result = await generateBillImage('bill-capture-target');
        if (isMounted) {
          setImageDataUrl(result.dataUrl);
          setImageBlob(result.blob);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("Error generating bill image:", err);
        if (isMounted) setIsGenerating(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [bill, customer, product, business]);

  // Handle Download
  const handleDownload = () => {
    if (imageDataUrl) {
      downloadBillPhoto(imageDataUrl, `Bill-${customer?.customerName || 'Customer'}-${invoiceNumber}.png`);
      setStatusMessage('Bill photo downloaded to phone gallery!');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Handle Share on WhatsApp (Allows user to select ANY customer in WhatsApp)
  const handleShareWhatsAppPhoto = async () => {
    // 1. First try native mobile share with the photo file attached!
    if (imageBlob) {
      const shared = await shareBillPhoto({
        blob: imageBlob,
        fileName: `Bill-${invoiceNumber}.png`,
        text: `🧾 Invoice from ${business?.name || 'Store'} for ${customer?.customerName}`
      });
      if (shared) {
        setStatusMessage('Shared successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }
    }

    // 2. Fallback: Automatically download photo and open WhatsApp contact picker!
    if (imageDataUrl) {
      handleDownload();
      sendBillOnWhatsApp({
        customer,
        product,
        bill,
        business,
        totalCustomerBalance: totalBalanceDue,
        useSpecificPhone: false
      });
    }
  };

  // Handle Send text on WhatsApp (without forcing number, user selects in WhatsApp)
  const handleSendWhatsAppText = () => {
    sendBillOnWhatsApp({
      customer,
      product,
      bill,
      business,
      totalCustomerBalance: totalBalanceDue,
      useSpecificPhone: false
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto modal-backdrop overscroll-contain"
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-fade-in flex flex-col max-h-[92vh] modal-content"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700 bg-[#162032]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Professional Bill Photo</h3>
              <p className="text-[11px] text-slate-400">Share or download as an image</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-4 overflow-y-auto overscroll-contain space-y-4 flex-1 modal-scrollable">
          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center">
              {statusMessage}
            </div>
          )}

          {/* Loading Indicator */}
          {isGenerating && (
            <div className="p-8 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Creating high-resolution bill photo...</p>
            </div>
          )}

          {/* Visual Image Preview when ready */}
          {!isGenerating && imageDataUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-700 shadow-md bg-white">
              <img 
                src={imageDataUrl} 
                alt="Invoice Bill Preview" 
                className="w-full h-auto object-contain max-h-[360px] mx-auto"
              />
            </div>
          )}

          {/* Hidden DOM Element to generate the PNG photo */}
          <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none', zIndex: -1 }}>
            <div
              id="bill-capture-target"
              style={{
                width: '480px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '32px',
                fontFamily: 'Inter, system-ui, sans-serif',
                boxSizing: 'border-box'
              }}
            >
              {/* Invoice Top Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '18px' }}>
                <h1 style={{ margin: '0', fontSize: '24px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '-0.5px' }}>
                  {business?.name || "OFFICIAL INVOICE"}
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                  {business?.place ? `📍 ${business.place}` : ''} {business?.phone ? `• 📞 ${business.phone}` : ''}
                </p>
                <div style={{ display: 'inline-block', marginTop: '10px', padding: '4px 14px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase' }}>
                    TAX INVOICE / CASH BILL
                  </span>
                </div>
              </div>

              {/* Meta & Customer Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', display: 'block' }}>
                    BILLED TO:
                  </span>
                  <strong style={{ fontSize: '16px', color: '#0f172a', display: 'block', marginTop: '2px' }}>
                    {customer?.customerName || "Customer"}
                  </strong>
                  {customer?.customerPlace && (
                    <span style={{ color: '#475569', display: 'block', marginTop: '2px' }}>
                      📍 {customer.customerPlace}
                    </span>
                  )}
                  {customer?.customerPhone && (
                    <span style={{ color: '#475569', display: 'block', marginTop: '2px' }}>
                      📞 {customer.customerPhone}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', display: 'block' }}>
                      INVOICE NO:
                    </span>
                    <strong style={{ fontSize: '14px', color: '#0f172a', fontFamily: 'monospace' }}>
                      {invoiceNumber}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', display: 'block' }}>
                      DATE:
                    </span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                      {bill?.date || new Date().toISOString().split('T')[0]}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ padding: '16px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155' }}>Item & Description</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '10px 12px', fontWeight: '700', color: '#334155', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#0f172a' }}>
                        {product?.name || "Product Item"}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#334155' }}>
                        {bill?.quantity} {product?.unit || 'units'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#334155' }}>
                        {currency}{Number(bill?.rate).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                        {currency}{Number(bill?.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary & Totals Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: '#475569' }}>
                  <span>Bill Total:</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{currency}{Number(bill?.totalAmount).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#16a34a' }}>
                  <span>Amount Paid:</span>
                  <span style={{ fontWeight: '700' }}>{currency}{Number(bill?.paidAmount).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '14px' }}>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>This Bill Balance:</span>
                  <span style={{ fontWeight: '800', color: Number(bill?.balanceAmount) > 0 ? '#b45309' : '#16a34a' }}>
                    {Number(bill?.balanceAmount) > 0 ? `${currency}${Number(bill?.balanceAmount).toLocaleString()}` : `${currency}0 (Nil)`}
                  </span>
                </div>

                {/* Overall Outstanding Due */}
                {totalBalanceDue !== undefined && totalBalanceDue > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#b45309' }}>
                      TOTAL CUSTOMER DUE:
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#b45309' }}>
                      {currency}{Number(totalBalanceDue).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Delivery Status Stamp */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                <div>
                  <span>Delivery Status: </span>
                  <strong style={{ color: bill?.deliveryStatus === 'delivered' ? '#16a34a' : '#d97706' }}>
                    {bill?.deliveryStatus === 'delivered' ? '✅ DELIVERED' : '⏳ PENDING'}
                  </strong>
                </div>
                {bill?.notes && (
                  <span style={{ fontStyle: 'italic' }}>Note: {bill.notes}</span>
                )}
              </div>

              {/* Footer Note */}
              <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <p style={{ margin: '0', fontSize: '11px', color: '#94a3b8' }}>
                  Computer Generated Invoice • Thank you for your business! 🙏
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#162032] border-t border-slate-700 space-y-2.5">
          <button
            onClick={handleShareWhatsAppPhoto}
            className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>Send on WhatsApp (Select Customer in WhatsApp)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Bill Photo</span>
            </button>

            <button
              onClick={handleSendWhatsAppText}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Share as Text</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
