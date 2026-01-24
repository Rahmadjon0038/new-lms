import { 
  UserCheck, XCircle, ShieldBan, BookOpen, Award, UserX, User
} from 'lucide-react';

export const getStatusInfo = (status) => {
  const statusMap = {
    active: { 
      label: 'Faol', 
      icon: UserCheck, 
      bgClass: 'bg-green-100',
      textClass: 'text-green-800',
      color: 'bg-green-100 text-green-800', 
      iconColor: 'text-green-600',
      description: 'Talaba faol holatda va guruhda darsga qatnashmoqda'
    },
    stopped: { 
      label: 'To\'xtatilgan', 
      icon: XCircle, 
      bgClass: 'bg-orange-100',
      textClass: 'text-orange-800',
      color: 'bg-orange-100 text-orange-800', 
      iconColor: 'text-orange-600',
      description: 'Talaba vaqtincha o\'qishni to\'xtatgan'
    },
    finished: { 
      label: 'Bitirgan', 
      icon: Award, 
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-800',
      color: 'bg-purple-100 text-purple-800', 
      iconColor: 'text-purple-600',
      description: 'Talaba guruhni muvaffaqiyatli yakunlagan'
    }
  };
  
  return statusMap[status] || { 
    label: status, 
    icon: User, 
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    color: 'bg-gray-100 text-gray-800', 
    iconColor: 'text-gray-600',
    description: 'Noma\'lum holat'
  };
};

export const getAllStatusOptions = () => [
  { value: 'active', label: 'Faol', icon: UserCheck, iconColor: 'text-green-600' },
  { value: 'stopped', label: 'To\'xtatilgan', icon: XCircle, iconColor: 'text-orange-600' },
  { value: 'finished', label: 'Bitirgan', icon: Award, iconColor: 'text-purple-600' }
];