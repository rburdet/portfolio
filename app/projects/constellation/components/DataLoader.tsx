import { useState } from 'react';
import type { DataItem } from '../types';

const DATA_URL = 'https://jsonplaceholder.typicode.com/users';
interface DataLoaderProps {
  onDataLoaded: (data: DataItem[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export function DataLoader({ onDataLoaded, onLoadingChange }: DataLoaderProps) {
  const [url, setUrl] = useState<string>(DATA_URL);
  const [error, setError] = useState<string | null>(null);

  const handleLoadData = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setError(null);
    onLoadingChange(true);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Data is not an array');
      }
      
      onDataLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      onDataLoaded([]);
    } finally {
      onLoadingChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLoadData();
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-md bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter data URL"
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button
          onClick={handleLoadData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          Load Data
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-red-500">{error}</div>
      )}
    </div>
  );
}