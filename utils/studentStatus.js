import { 
  UserCheck, XCircle, ShieldBan, BookOpen, Award, UserX, User
} from 'lucide-react';

export const getStatusInfo = (status) => {
  const statusMap = {
    active: { 
      label: 'Faol', 
      icon: UserCheck, 
      color: 'bg-green-100 text-green-800', 
      iconColor: 'text-green-600',
      description: 'Talaba faol holatda va guruhga biriktirilishi mumkin'
    },
    inactive: { 
      label: 'Nofaol', 
      icon: XCircle, 
      color: 'bg-red-100 text-red-800', 
      iconColor: 'text-red-600',
      description: 'Talaba vaqtincha o\'qishni to\'xtatgan'
    },
    blocked: { 
      label: 'Bloklangan', 
      icon: ShieldBan, 
      color: 'bg-gray-100 text-gray-800', 
      iconColor: 'text-gray-600',
      description: 'Talaba admin tomonidan bloklangan'
    },
    graduated: { 
      label: 'Bitirgan', 
      icon: Award, 
      color: 'bg-purple-100 text-purple-800', 
      iconColor: 'text-purple-600',
      description: 'Talaba kursni muvaffaqiyatli bitirgan'
    },
    dropped_out: { 
      label: 'Tark etgan', 
      icon: UserX, 
      color: 'bg-orange-100 text-orange-800', 
      iconColor: 'text-orange-600',
      description: 'Talaba o\'qishdan bitimasdan chiqib ketgan'
    }
  };
  
  return statusMap[status] || { 
    label: status, 
    icon: User, 
    color: 'bg-gray-100 text-gray-800', 
    iconColor: 'text-gray-600',
    description: 'Noma\'lum holat'
  };
};

export const getAllStatusOptions = () => [
  { value: 'active', label: 'Faol', icon: UserCheck, color: 'text-green-600' },
  { value: 'inactive', label: 'Nofaol', icon: XCircle, color: 'text-red-600' },
  { value: 'blocked', label: 'Bloklangan', icon: ShieldBan, color: 'text-gray-600' },
  { value: 'graduated', label: 'Bitirgan', icon: Award, color: 'text-purple-600' },
  { value: 'dropped_out', label: 'Tark etgan', icon: UserX, color: 'text-orange-600' }
];