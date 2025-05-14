export type Operator = 'equals' | 'greaterThan' | 'lessThan' | 'contain' | 'notContain' | 'regex';

export interface Condition {
  id: string;
  field: string;
  operator: Operator;
  value: string;
}

export interface AndGroup {
  id: string;
  conditions: Condition[];
}

export type ConditionGroups = AndGroup[];

export interface DataItem {
  [key: string]: any;
} 