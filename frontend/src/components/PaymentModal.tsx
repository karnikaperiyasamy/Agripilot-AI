import React, { useState } from 'react';
import { QrCode, Building2, CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Copy, Check, X, Truck, Sprout } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  cropName: string;
  cropAmount: number;
  transportAmount: number;
  sellerRole?: 'FARMER' | 'MERCHANT';
  farmerName?: string;
  farmerUpi?: string;
  farmerAccount?: string;
  farmerIfsc?: string;
  transporterName?: string;
  transporterUpi?: string;
  transporterAccount?: string;
  transporterIfsc?: string;
  onPaymentSuccess: (paymentData: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  cropName,
  cropAmount,
  transportAmount,
  sellerRole = 'FARMER',
  farmerName = 'Gurdev Singh (Farmer)',
  farmerUpi = 'gurdev.farmer@upi',
  farmerAccount = '9182736450192',
  farmerIfsc = 'SBIN0001234',
  transporterName = 'Harbhajan Logistics',
  transporterUpi = 'harbhajan.transport@upi',
  transporterAccount = '4091827364510',
  transporterIfsc = 'HDFC0000456',
  onPaymentSuccess
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'UPI_QR' | 'BANK_TRANSFER'>('UPI_QR');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Bank Transfer Form state
  const [buyerBankName, setBuyerBankName] = useState('State Bank of India');
  const [buyerAccountNum, setBuyerAccountNum] = useState('');
  const [buyerIfsc, setBuyerIfsc] = useState('');

  if (!isOpen) return null;

  const totalPayable = cropAmount + transportAmount;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem('agritwin_token');
    const paymentPayload = {
      paymentMethod: activeTab === 'UPI_QR' ? 'UPI QR Code Scan' : 'Direct Bank Transfer (NEFT/IMPS)',
      gatewayTransactionId: utrNumber || `UTR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMode: activeTab,
      cropAmount,
      transportAmount,
      totalPayable,
      buyerBankDetails: activeTab === 'BANK_TRANSFER' ? { buyerBankName, buyerAccountNum, buyerIfsc } : null
    };

    try {
      const res = await fetch(`/api/marketplace/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentPayload)
      });
      const data = await res.json();

      if (data.success) {
        setPaymentSuccess(true);
        setReceiptData({
          transactionRef: data.data.payment.transactionRef,
          totalPaid: totalPayable,
          cropAmount,
          transportAmount,
          date: new Date().toLocaleString()
        });
        onPaymentSuccess(data.data);
      } else {
        alert(data.message || 'Payment processing failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to payment service');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate dynamic QR Code image via QR Server API
  const upiPayload = `upi://pay?pa=${farmerUpi}&pn=${encodeURIComponent(farmerName)}&am=${totalPayable}&cu=INR&tn=AgriPilot%20Order%20${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayload)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>AgriPilot Escrow Payment Gateway</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Direct Farmer & Transport Payment</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Order #{orderId.substring(0, 8)} • <span className="font-semibold">{cropName}</span>
          </p>
        </div>

        {paymentSuccess && receiptData ? (
          /* Payment Receipt View */
          <div className="p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Payment Successful!</h3>
            <p className="text-xs text-slate-500 mb-6">Escrow deposit confirmed & verified by AgriPilot AI</p>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left text-xs space-y-3 mb-6">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Transaction Reference:</span>
                <span className="font-mono font-bold text-slate-800">{receiptData.transactionRef}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Crop Produce Payment (Farmer):</span>
                <span className="font-bold text-slate-800">₹ {receiptData.cropAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Freight Transport Fee:</span>
                <span className="font-bold text-slate-800">₹ {receiptData.transportAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-extrabold text-emerald-700">
                <span>Total Amount Paid:</span>
                <span>₹ {receiptData.totalPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-700/20"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          /* Payment Method Form View */
          <div className="p-6">
            {/* Cost Summary Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 mb-6 text-xs">
              <div className="font-bold text-emerald-900 mb-2 flex items-center justify-between">
                <span>Payment Summary</span>
                <span className="text-sm text-emerald-700 font-extrabold">₹ {totalPayable.toLocaleString('en-IN')}</span>
              </div>
              <div className="space-y-1.5 text-emerald-800">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1">
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{sellerRole === 'MERCHANT' ? 'Merchant Produce Share' : 'Farmer Produce Share'} ({farmerName}):</span>
                  </span>
                  <span className="font-semibold">₹ {cropAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Harbhajan Freight Transport Share:</span>
                  </span>
                  <span className="font-semibold">₹ {transportAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex border-b border-slate-200 mb-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab('UPI_QR')}
                className={`flex-1 py-3 border-b-2 flex items-center justify-center space-x-2 transition-colors ${
                  activeTab === 'UPI_QR'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>1. Scan UPI QR Code</span>
              </button>
              <button
                onClick={() => setActiveTab('BANK_TRANSFER')}
                className={`flex-1 py-3 border-b-2 flex items-center justify-center space-x-2 transition-colors ${
                  activeTab === 'BANK_TRANSFER'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>2. Direct Bank Transfer (NEFT/IMPS)</span>
              </button>
            </div>

            {/* Tab 1: UPI QR Code Scanning */}
            {activeTab === 'UPI_QR' && (
              <div className="space-y-5 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto shadow-xs">
                  <img
                    src={qrCodeUrl}
                    alt="AgriPilot UPI QR Code"
                    className="w-44 h-44 mx-auto rounded-lg"
                  />
                  <p className="text-[11px] font-bold text-slate-600 mt-2">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
                </div>

                <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">{sellerRole === 'MERCHANT' ? 'Merchant UPI ID:' : 'Farmer UPI ID:'}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-800">{farmerUpi}</span>
                      <button
                        onClick={() => copyToClipboard(farmerUpi, 'farmerUpi')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      >
                        {copiedField === 'farmerUpi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Transporter UPI ID:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-800">{transporterUpi}</span>
                      <button
                        onClick={() => copyToClipboard(transporterUpi, 'transporterUpi')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      >
                        {copiedField === 'transporterUpi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Direct Bank Transfer Details */}
            {activeTab === 'BANK_TRANSFER' && (
              <div className="space-y-4 text-xs">
                {/* Farmer / Merchant Bank Details */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-emerald-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>{sellerRole === 'MERCHANT' ? '🏬 Merchant Beneficiary Account' : '🌾 Farmer Beneficiary Account'} ({farmerName})</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">Verified</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Bank Account Number:</span>
                      <span className="font-mono font-bold">{farmerAccount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">IFSC Code:</span>
                      <span className="font-mono font-bold">{farmerIfsc}</span>
                    </div>
                  </div>
                </div>

                {/* Transporter Bank Details */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>🚚 Freight Transporter Account ({transporterName})</span>
                    <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 rounded font-semibold">Verified</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Bank Account Number:</span>
                      <span className="font-mono font-bold">{transporterAccount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">IFSC Code:</span>
                      <span className="font-mono font-bold">{transporterIfsc}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Proof / UTR Entry Form */}
            <form onSubmit={handleConfirmPayment} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UPI Ref / UTR / Bank Reference Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 409182739102 or UTR-98214"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Enter your 12-digit UTR number from PhonePe, GPay, Paytm, or Bank Receipt.</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Verifying Transaction...</span>
                  ) : (
                    <>
                      <span>Confirm & Escrow Deposit</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
