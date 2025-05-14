import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import type { DataItem } from '../types';
import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 10;

interface DataTableProps {
  data: DataItem[];
}

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => {
    if (!data.length) return [];
    
    const firstItem = data[0];
    const columnHelper = createColumnHelper<DataItem>();
    
    return Object.keys(firstItem).map((key) => {
      return columnHelper.accessor(key, {
        header: ({ column }) => (
          <button
            className="flex items-center justify-between w-full px-2 group hover:bg-gray-50 focus:outline-none"
            onClick={() => column.toggleSorting()}
          >
            <span className="font-semibold">{key}</span>
            <span className="text-gray-400">
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp size={16} />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown size={16} />
              ) : (
                <ArrowUpDown size={16} className="opacity-0 group-hover:opacity-100" />
              )}
            </span>
          </button>
        ),
        cell: (info) => {
          const value = info.getValue();
          return typeof value === 'object' 
            ? JSON.stringify(value) 
            : String(value);
        },
      });
    });
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: DEFAULT_PAGE_SIZE,
      },
    },
  });

  if (!data.length) {
    return <div className="text-center p-4">No data available</div>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between mt-4 px-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
        <span className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
      </div>
    </div>
  );
} 