import React from 'react';
import type { AndGroup as AndGroupType, Condition } from '../../types';
import { OrCondition } from './OrCondition';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AndGroupProps {
  group: AndGroupType;
  fields: string[];
  onChange: (group: AndGroupType) => void;
  onDelete: () => void;
  onAddGroup: () => void;
  shouldShowDelete: boolean;
}

export function AndGroup({
  group,
  fields,
  onChange,
  onDelete,
  onAddGroup,
  shouldShowDelete
}: AndGroupProps) {
  const handleAddCondition = () => {
    const newCondition: Condition = {
      id: uuidv4(),
      field: fields.length > 0 ? fields[0] : '',
      operator: 'equals',
      value: ''
    };
    
    onChange({
      ...group,
      conditions: [...group.conditions, newCondition]
    });
  };

  const handleConditionChange = (updatedCondition: Condition) => {
    onChange({
      ...group,
      conditions: group.conditions.map(condition => 
        condition.id === updatedCondition.id ? updatedCondition : condition
      )
    });
  };

  const handleDeleteCondition = (conditionId: string) => {
    onChange({
      ...group,
      conditions: group.conditions.filter(condition => condition.id !== conditionId)
    });
  };

  return (
    <div className="border rounded-md p-4 bg-white mb-4">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-lg font-medium">AND Group</h3>
        {shouldShowDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label="Delete group"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {group.conditions.map((condition, index) => (
          <OrCondition
            key={condition.id}
            condition={condition}
            fields={fields}
            onChange={handleConditionChange}
            onDelete={() => handleDeleteCondition(condition.id)}
            onAddCondition={handleAddCondition}
          />
        ))}
        
        {group.conditions.length === 0 && (
          <button
            onClick={handleAddCondition}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400"
          >
            <Plus size={16} className="mr-2" />
            Add OR Condition
          </button>
        )}
      </div>
      
        <button
          onClick={onAddGroup}
          className="mt-4 w-full py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md flex items-center justify-center hover:bg-blue-100"
        >
          <Plus size={16} className="mr-2" />
          Add AND Group
        </button>
    </div>
  );
} 