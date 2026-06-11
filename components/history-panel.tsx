"use client";

import React from "react";
import { type MindmapEntry, formatDate } from "@/lib/history";

interface HistoryPanelProps {
  isOpen: boolean;
  history: MindmapEntry[];
  activeId: string | null;
  onSelect: (entry: MindmapEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function HistoryPanel({
  isOpen,
  history,
  activeId,
  onSelect,
  onDelete,
  onClear,
  onClose,
}: HistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 h-full w-72 bg-white border-r shadow-xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-sm text-gray-900">History</h2>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close history"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No history yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {history.map((entry) => (
              <li
                key={entry.id}
                className={`group flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeId === entry.id ? "bg-gray-50 border-l-2 border-l-gray-900" : ""
                }`}
                onClick={() => onSelect(entry)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate font-medium">{entry.query}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry.id);
                  }}
                  className="mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                  aria-label="Delete entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
