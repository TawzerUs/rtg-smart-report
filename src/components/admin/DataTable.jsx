import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import Button from '../Button';

const DataTable = ({ columns, data, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-[var(--border-glass)]">
            <table className="w-full text-sm text-left text-[var(--text-muted)]">
                <thead className="text-xs uppercase bg-[var(--bg-glass)] text-[var(--text-main)]">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-6 py-4">{col.label}</th>
                        ))}
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((item) => (
                            <tr key={item.id} className="border-b border-[var(--border-glass)] hover:bg-[var(--bg-glass)] transition-colors">
                                {columns.map((col) => (
                                    <td key={`${item.id}-${col.key}`} className="px-6 py-4">
                                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => onDelete(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-[var(--text-muted)]">
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
