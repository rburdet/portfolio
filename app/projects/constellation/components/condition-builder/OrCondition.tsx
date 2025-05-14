import type { Condition, Operator } from '../../types';
import { PlusCircle, X } from 'lucide-react';
import { useState } from 'react';

const OPERATORS: Operator[] = [
  'equals',
  'greaterThan',
  'lessThan',
  'contain',
  'notContain',
  'regex'
];

// New skeleton component
function OrConditionSkeleton() {
  return (
    <div className="flex items-center gap-2 p-2 relative mt-2 animate-pulse">
      <div className="px-3 py-2 border rounded-md flex-1 bg-gray-200 h-10"></div>
      <div className="px-3 py-2 border rounded-md flex-1 bg-gray-200 h-10"></div>
      <div className="px-3 py-2 border rounded-md flex-1 bg-gray-200 h-10"></div>
      <div className="p-2 bg-gray-200 rounded-md h-10 w-10"></div>
      <div className="p-2 bg-gray-200 rounded-md h-10 w-10"></div>
    </div>
  );
}

interface OrConditionProps {
  condition: Condition;
  fields: string[];
  onChange: (condition: Condition) => void;
  onDelete: () => void;
  onAddCondition: () => void;
}

export function OrCondition({
  condition,
  fields,
  onChange,
  onDelete,
  onAddCondition,
}: OrConditionProps) {
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...condition, field: e.target.value });
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...condition, operator: e.target.value as Operator });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...condition, value: e.target.value });
  };

  const isNumericOperator = 
    condition.operator === 'greaterThan' || 
    condition.operator === 'lessThan';

  const hasValidValue = !isNumericOperator || 
    !isNaN(Number(condition.value)) || 
    condition.value === '';

  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-2 relative">
        <select
          className="px-3 py-2 border rounded-md flex-1"
          value={condition.field}
          onChange={handleFieldChange}
        >
          <option value="" disabled>Select field</option>
          {fields.map(field => (
            <option key={field} value={field}>{field}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 border rounded-md flex-1"
          value={condition.operator}
          onChange={handleOperatorChange}
        >
          <option value="" disabled>Select operator</option>
          {OPERATORS.map(op => (
            <option key={op} value={op}>
              {op === 'equals' ? 'Equals' :
              op === 'greaterThan' ? 'Greater than' :
              op === 'lessThan' ? 'Less than' :
              op === 'contain' ? 'Contains' :
              op === 'notContain' ? 'Not contains' :
              'Regex'}
            </option>
          ))}
        </select>

        <input
          type="text"
          className={`px-3 py-2 border rounded-md flex-1 ${!hasValidValue ? 'border-red-500' : ''}`}
          value={condition.value}
          onChange={handleValueChange}
          placeholder={isNumericOperator ? "Enter a number" : "Enter value"}
        />
        
        <button 
          onClick={onDelete}
          className="p-2 text-gray-500 hover:text-gray-700"
          aria-label="Delete condition"
        >
          <X size={18} />
        </button>
        
        <button
          onClick={onAddCondition}
          className="p-2 text-blue-500 hover:text-blue-700"
          aria-label="Add OR condition"
          onMouseEnter={() => setShowSkeleton(true)}
          onMouseLeave={() => setShowSkeleton(false)}
        >
          <PlusCircle size={18} />
        </button>

        {isNumericOperator && !hasValidValue && condition.value !== '' && (
          <div className="absolute bottom-0 left-0 transform translate-y-full text-xs text-red-500 mt-1">
            Please enter a valid number
          </div>
        )}
      </div>
      
      {showSkeleton && <OrConditionSkeleton />}
    </div>
  );
} 