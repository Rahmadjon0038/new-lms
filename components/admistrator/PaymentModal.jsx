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
        group_id: student.group_id,
        amount: Number(paymentData.amount),
        month: paymentData.month,
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-md w-full max-w-xl mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-50 rounded-full flex items-center justify-center">
            <CreditCardIcon className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            To'lov qabul qilish
          </h3>
        </div>

        {/* Student Information */}
        {student && (
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-lg font-medium text-gray-900 text-center mb-3">
                {student.student_name || student.name} {student.student_surname || student.surname}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Qarzlik miqdori:</span>
                  <span className={`font-semibold ${parseFloat(student.debt_amount || student.group_price || 0) > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                    {formatCurrency(Math.abs(parseFloat(student.debt_amount || student.group_price || 0)))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Oylik to'lov:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(parseFloat(student.effective_required || student.required_amount || student.group_price || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
        <div className="px-6 pb-6 space-y-4">
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
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-lg"
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
              To'lov usuli:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleChange('payment_method', method.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
              style={{ '--tw-ring-color': '#A60E07' }}
              rows="3"
              placeholder="To'lov haqida qo'shimcha ma'lumot..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={processPaymentMutation.isPending}
              className="flex-1 px-4 py-3 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#A60E07' }}
            >
              {processPaymentMutation.isPending ? 'Bajarilmoqda...' : 'To\'lov qilish'}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;