import { useState } from 'react';
import { DataLoader } from './components/DataLoader';
import { DataTable } from './components/DataTable';
import { TableSkeleton } from './components/TableSkeleton';
import { ConditionBuilder } from './components/condition-builder/ConditionBuilder';
import type { DataItem } from './types';

function App() {
  const [data, setData] = useState<DataItem[]>([]);
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDataLoaded = (newData: DataItem[]) => {
    setData(newData);
    setFilteredData(newData);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Condition Builder</h1>
      
      <DataLoader 
        onDataLoaded={handleDataLoaded} 
        onLoadingChange={setIsLoading}
      />
      
      {data.length > 0 && (
        <ConditionBuilder 
          data={data} 
          onFilteredDataChange={setFilteredData}
        />
      )}

      <div className="bg-white p-4 border rounded-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Data Results</h2>
          {data.length > 0 && (
            <span className="text-sm text-gray-500">
              Showing {filteredData.length} of {data.length} items
            </span>
          )}
        </div>
        
        {isLoading ? (
          <TableSkeleton />
        ) : filteredData.length > 0 ? (
          <DataTable data={filteredData} />
        ) : data.length > 0 ? (
          <div className="text-center p-4 text-gray-500">
            No data matches the current filters
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">
            No data loaded. Please use the data loader above to fetch data.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
