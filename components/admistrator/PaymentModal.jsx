"use client";
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useProcessPayment } from '../../hooks/payments';
import { toast } from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, student, month }) => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    description: ''
  });

  const processPaymentMutation = useProcessPayment();

  const resetForm = () => {
    setPaymentData({
      amount: '',
      payment_method: 'cash',
      description: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!student?.student_id) return;

    try {
      const payload = {
        student_id: student.student_id,
        group_id: student.group_id,
        amount: Number(paymentData.amount),
        month: month || new Date().toISOString().slice(0, 7),
        payment_method: paymentData.payment_method,
        description: paymentData.description
      };

      const response = await processPaymentMutation.mutateAsync(payload);
      
      // Show toast notification with student name
      if (response?.message) {
        const studentName = `${student.student_name} ${student.student_surname}`;
        toast.success(`${studentName} - ${response.message}`);
      } else {
        const studentName = `${student.student_name} ${student.student_surname}`;
        toast.success(`${studentName} - To'lov muvaffaqiyatli qabul qilindi!`);
      }
      
      handleClose();
    } catch (error) {
      toast.error(error?.message || 'To\'lov qabul qilishda xatolik yuz berdi');
      console.error('Payment processing failed:', error);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'amount') {
      // Remove all non-numeric characters except dots and commas
      const numericValue = value.replace(/[^\d]/g, '');
      setPaymentData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Format amount for display
  const formatAmountForDisplay = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const paymentMethods = [
    { value: 'cash', label: 'Naqd pul', icon: BanknotesIcon },
    { value: 'card', label: 'Plastik karta', icon: CreditCardIcon },
    { value: 'transfer', label: 'O\'tkazma', icon: DevicePhoneMobileIcon }
  ];

  // Debug: Log student data
  useEffect(() => {
    if (student && isOpen) {
      console.log('💰 PaymentModal Student Data:', student);
      console.log('📊 Required Amount:', student.required_amount);
      console.log('💵 Original Price:', student.original_price);
      console.log('💸 Debt Amount:', student.debt_amount);
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <div 
        className="mx-auto flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-md sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 sm:h-12 sm:w-12">
            <CreditCardIcon className="h-5 w-5 text-red-500 sm:h-6 sm:w-6" />
          </div>
          <h3 className="text-center text-base font-semibold text-gray-900 sm:text-lg">
            To&apos;lov qabul qilish
          </h3>
        </div>

        <div className="overflow-y-auto px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
        {/* Student Information */}
        {student && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3 sm:p-4">
              <h4 className="mb-3 text-center text-base font-medium text-gray-900 sm:text-lg">
                {student.student_name || student.name} {student.student_surname || student.surname}
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 sm:text-sm">Qarzlik miqdori:</span>
                  <span className={`text-sm font-semibold sm:text-base ${parseFloat(student.debt_amount || student.group_price || 0) > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                    {formatCurrency(Math.abs(parseFloat(student.debt_amount || student.group_price || 0)))}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 sm:text-sm">Oylik to&apos;lov:</span>
                  <span className="text-sm font-semibold text-blue-600 sm:text-base">
                    {formatCurrency(parseFloat(student.effective_required || student.required_amount || student.group_price || 0))}
                  </span>
                </div>
              </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  To&apos;lov miqdori:
            </label>
            <div className="relative">
              <input
                type="text"
                value={formatAmountForDisplay(paymentData.amount)}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-16 text-base focus:border-transparent focus:ring-2 sm:py-3 sm:text-lg"
                style={{ '--tw-ring-color': '#A60E07' }}
                placeholder="100,000"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">UZS</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  To&apos;lov usuli:
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleChange('payment_method', method.value)}
                    className={`flex items-center gap-2 rounded-lg border p-3 transition-colors sm:flex-col sm:justify-center ${
                      paymentData.payment_method === method.value
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Izoh (ixtiyoriy):
            </label>
            <textarea
              value={paymentData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 focus:border-transparent focus:ring-2 sm:py-3"
              style={{ '--tw-ring-color': '#A60E07' }}
              rows="3"
                  placeholder="To'lov haqida qo'shimcha ma'lumot..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:gap-3 sm:pt-4">
            <button
              type="button"
                  onClick={handleClose}
              className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:flex-1 sm:py-3"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={processPaymentMutation.isPending}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 sm:flex-1 sm:py-3"
              style={{ backgroundColor: '#A60E07' }}
            >
              {processPaymentMutation.isPending ? 'Bajarilmoqda...' : 'To\'lov qilish'}
            </button>
          </div>
        </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
