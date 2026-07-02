'use client';
import { Pencil, Trash2 } from 'lucide-react';

export interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface Props<T extends { id: string }> {
  readonly columns: Column<T>[];
  readonly data: T[];
  readonly onEdit: (item: T) => void;
  readonly onDelete: (id: string) => void;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-[#0a1128]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-slate-300">
                  {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-8 text-center text-slate-600"
              >
                Aucun élément
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}