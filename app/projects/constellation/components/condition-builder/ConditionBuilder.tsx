import { useState, useEffect } from 'react';
import type { ConditionGroups, AndGroup as AndGroupType, DataItem, Condition } from '../../types';
import { AndGroup } from './AndGroup';
import { v4 as uuidv4 } from 'uuid';


interface ConditionBuilderProps {
  data: DataItem[];
  onFilteredDataChange: (filteredData: DataItem[]) => void;
}

export function ConditionBuilder({ data, onFilteredDataChange }: ConditionBuilderProps) {
  const [conditionGroups, setConditionGroups] = useState<ConditionGroups>([]);
  const [fields, setFields] = useState<string[]>([]);

  const defaultCondition: Condition = {
    id: uuidv4(),
    field: fields.length > 0 ? fields[0] : '',
    operator: 'equals',
    value: ''
  };

  // Extract field names from data when it changes
  useEffect(() => {
    if (data.length > 0) {
      const firstItem = data[0];
      setFields(Object.keys(firstItem));
      
      if (conditionGroups.length === 0) {
        addGroup();
      }
    }
  }, [data]);

  // Apply filters when conditions change
  useEffect(() => {
    // No conditions, return all data
    if (conditionGroups.length === 0 || conditionGroups.every(group => group.conditions.length === 0)) {
      onFilteredDataChange(data);
      return;
    }

    const filteredData = data.filter(item => {
      // AND logic between groups
      return conditionGroups.every(group => {
        // No conditions in group, treat as true
        if (group.conditions.length === 0) {
          return true;
        }
        
        // OR logic within a group
        return group.conditions.some(condition => {
          const { field, operator, value } = condition;
          
          if (!field || !operator || value === undefined) {
            return true; // Skip invalid conditions
          }
          
          const itemValue = item[field];
          
          // Handle different operators
          switch (operator) {
            case 'equals':
              return String(itemValue) === value;
              
            case 'greaterThan':
              return !isNaN(Number(itemValue)) && 
                     !isNaN(Number(value)) && 
                     Number(itemValue) > Number(value);
              
            case 'lessThan':
              return !isNaN(Number(itemValue)) && 
                     !isNaN(Number(value)) && 
                     Number(itemValue) < Number(value);
              
            case 'contain':
              return String(itemValue).toLowerCase().includes(value.toLowerCase());
              
            case 'notContain':
              return !String(itemValue).toLowerCase().includes(value.toLowerCase());
              
            case 'regex':
              try {
                const regex = new RegExp(value);
                return regex.test(String(itemValue));
              } catch (e) {
                return false; // Invalid regex
              }
              
            default:
              return false;
          }
        });
      });
    });
    
    onFilteredDataChange(filteredData);
  }, [conditionGroups, data, onFilteredDataChange]);

  const addGroup = () => {
    const newGroup: AndGroupType = {
      id: uuidv4(),
      conditions: [defaultCondition]
    };
    
    console.log(conditionGroups);
    setConditionGroups(prev => [...prev, newGroup]);
  };
  console.log(conditionGroups);

  const handleGroupChange = (updatedGroup: AndGroupType) => {
    setConditionGroups(prev => 
      prev.map(group => group.id === updatedGroup.id ? updatedGroup : group)
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    setConditionGroups(prev => 
      prev.filter(group => group.id !== groupId)
    );
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Condition Builder</h2>
      
      {conditionGroups.map((group) => (
        <AndGroup
          key={group.id}
          group={group}
          fields={fields}
          onChange={handleGroupChange}
          onDelete={() => handleDeleteGroup(group.id)}
          shouldShowDelete={conditionGroups.length > 1}
          onAddGroup={addGroup}
        />
      ))}
    </div>
  );
} 