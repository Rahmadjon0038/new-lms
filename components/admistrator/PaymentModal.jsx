"use client";
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useProcessPayment } from '../../hooks/payments';
import { toast } from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, student, month }) => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    description: '',
    month: month || new Date().toISOString().slice(0, 7)
  });

  const processPaymentMutation = useProcessPayment();

  // Update month when prop changes
  useEffect(() => {
    if (month) {
      setPaymentData(prev => ({ ...prev, month }));
    }
  }, [month]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentData({
        amount: '',
        payment_method: 'cash',
        description: '',
        month: month || new Date().toISOString().slice(0, 7)
      });
    }
  }, [isOpen, month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!student?.student_id) return;

    try {
      const payload = {
        student_id: student.student_id,
        amount: Number(paymentData.amount),
        month: paymentData.month,
        payment_method: paymentData.payment_method,
        description: paymentData.description
      };

      const response = await processPaymentMutation.mutateAsync(payload);
      
      // Show toast notification
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success('To\'lov muvaffaqiyatli qabul qilindi!');
      }
      
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200 rounded-t-xl">
          <h3 className="text-xl font-semibold text-gray-900">
            To'lov qabul qilish
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Student Information */}
        {student && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="space-y-2">
              <h4 className="text-lg font-medium text-gray-900">
                {student.name} {student.surname}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              
                <div className="col-span-2">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <span className="font-medium text-gray-700">Qarzlik miqdori:</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(Math.abs(parseFloat(student.debt_amount || 0)))}
                    </span>
                  </div>
                </div>
                {student.required_amount && (
                  <div className="col-span-2">
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <span className="font-medium text-blue-700">Oylik to'lov miqdori:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(parseFloat(student.required_amount))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To'lov miqdori:
            </label>
            <div className="relative">
              <input
                type="text"
                value={formatAmountForDisplay(paymentData.amount)}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="100,000"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">UZS</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimal: 1,000 so'm
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To'lov usuli:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleChange('payment_method', method.value)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                      paymentData.payment_method === method.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{method.label}</span>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="To'lov haqida qo'shimcha ma'lumot..."
            />
          </div>

       

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={processPaymentMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {processPaymentMutation.isPending ? 'Bajarilmoqda...' : 'To\'lov qilish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;