"use client";
import React, { useState, useEffect } from 'react';
import { XMarkIcon, PercentBadgeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useApplyDiscount } from '../../hooks/payments';
import { toast } from 'react-hot-toast';

const DiscountModal = ({ isOpen, onClose, student, month }) => {
  const [discountData, setDiscountData] = useState({
    discount_type: 'percent',
    discount_value: '',
    description: ''
  });

  const applyDiscountMutation = useApplyDiscount();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDiscountData({
        discount_type: 'percent',
        discount_value: '',
        description: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!student?.student_id) return;

    try {
      const payload = {
        student_id: student.student_id,
        group_id: student.group_id,
        discount_type: discountData.discount_type,
        discount_value: Number(discountData.discount_value),
        month: new Date().toISOString().slice(0, 7), // Current month (YYYY-MM format)
        description: discountData.description
      };

      const response = await applyDiscountMutation.mutateAsync(payload);
      
      // Show toast notification with student name
      if (response?.message) {
        const studentName = `${student.student_name} ${student.student_surname}`;
        toast.success(`${studentName} - ${response.message}`);
      } else {
        const studentName = `${student.student_name} ${student.student_surname}`;
        toast.success(`${studentName} - Chegirma muvaffaqiyatli berildi!`);
      }
      
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Chegirma berishda xatolik yuz berdi');
      console.error('Discount application failed:', error);
    }
  };

  const handleChange = (field, value) => {
    setDiscountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Chegirma berish
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

      

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chegirma turi:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('discount_type', 'percent')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  discountData.discount_type === 'percent'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <PercentBadgeIcon className="h-4 w-4" />
                Foiz (%)
              </button>
              <button
                type="button"
                onClick={() => handleChange('discount_type', 'amount')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  discountData.discount_type === 'amount'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CurrencyDollarIcon className="h-4 w-4" />
                Summa
              </button>
            </div>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {discountData.discount_type === 'percent' ? 'Foiz miqdori (%)' : 'Summa'}:
            </label>
            <input
              type="number"
              value={discountData.discount_value}
              onChange={(e) => handleChange('discount_value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#A60E07' }}
              placeholder={discountData.discount_type === 'percent' ? '50' : '100000'}
              required
              min="0"
              max={discountData.discount_type === 'percent' ? '100' : undefined}
            />
            {discountData.discount_type === 'percent' && (
              <p className="text-xs text-gray-500 mt-1">0 dan 100 gacha</p>
            )}
          </div>



          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Izoh:
            </label>
            <textarea
              value={discountData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none transition-colors"
              style={{ '--tw-ring-color': '#A60E07' }}
              rows="3"
              placeholder="Chegirma berishning sababini yozing..."
              
            />
          </div>

          {/* Preview */}
          {discountData.discount_value && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Ko'rinish:</strong> {' '}
                {discountData.discount_type === 'percent' 
                  ? `${discountData.discount_value}% chegirma`
                  : `${Number(discountData.discount_value).toLocaleString()} so'm chegirma`
                } joriy oy uchun
              </p>
            </div>
          )}

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
              disabled={applyDiscountMutation.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#A60E07' }}
            >
              {applyDiscountMutation.isPending ? 'Bajarilmoqda...' : 'Chegirma berish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal;