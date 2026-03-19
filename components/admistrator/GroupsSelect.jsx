'use client'
import React, { useState, useMemo } from 'react';
import { ChevronDownIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const getGroupLabel = (group) => {
  const classStatus = group.class_status === 'started' ? 'Dars boshlangan' : 'Dars boshlanmagan';
  const statusIndicator = group.status === 'draft' ? ' (Draft)' : '';
  const price = Number(group.price || 0).toLocaleString();
  const teacherName = group.teacher_name || "O'qituvchisiz";
  return `${group.name} - ${teacherName} - ${price} so'm - ${classStatus}${statusIndicator}`;
};

const GroupsSelect = ({ value, onChange, groups = [], loading = false, placeholder = 'Guruh tanlash (ixtiyoriy)' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedGroup = useMemo(
    () => groups.find((g) => String(g.id) === String(value)),
    [groups, value]
  );

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter((group) => {
      const label = getGroupLabel(group).toLowerCase();
      const teacher = (group.teacher_name || '').toLowerCase();
      const subject = (group.subject_name || '').toLowerCase();
      return label.includes(term) || teacher.includes(term) || subject.includes(term);
    });
  }, [groups, searchTerm]);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-[#A60E07] rounded-lg bg-white text-left flex justify-between items-center hover:bg-gray-50 transition outline-none"
      >
        <span className={selectedGroup ? 'text-gray-900' : 'text-gray-500'}>
          {selectedGroup ? getGroupLabel(selectedGroup) : placeholder}
        </span>
        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-[#A60E07] rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Guruhni qidiring..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-9 border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-[#A60E07]"
              />
              <UserGroupIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`w-full text-left p-3 transition border-b border-gray-100 ${
                !value ? 'bg-orange-50 border-l-4 border-l-[#A60E07]' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Guruh tanlanmagan</span>
                {!value ? <span className="text-xs text-[#A60E07]">tanlangan</span> : null}
              </div>
            </button>

            {loading ? (
              <div className="p-3 text-center text-gray-500">Guruhlar yuklanmoqda...</div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-3 text-center text-gray-500">Guruh topilmadi</div>
            ) : (
              filteredGroups.map((group) => (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => {
                    onChange(String(group.id));
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left p-3 hover:bg-gray-100 transition border-b border-gray-100 last:border-b-0 ${
                    String(value) === String(group.id) ? 'bg-orange-50 border-l-4 border-l-[#A60E07]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="pr-3">
                      <p className="font-semibold text-gray-900">{group.name}</p>
                      <p className="text-sm text-gray-600">
                        {group.teacher_name || "O'qituvchisiz"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-700">{Number(group.price || 0).toLocaleString()} so'm</p>
                      <p className="text-xs text-gray-500">
                        {group.class_status === 'started' ? 'Dars boshlangan' : 'Dars boshlanmagan'}
                        {group.status === 'draft' ? ' (Draft)' : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsSelect;
