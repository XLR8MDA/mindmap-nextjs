"use client";

import React from "react";
import { type Resource } from "@/app/api/get-resources/route";

const TYPE_STYLES: Record<Resource["type"], { label: string; className: string }> = {
  wikipedia:     { label: "Wikipedia",      className: "bg-gray-100 text-gray-700" },
  article:       { label: "Article",        className: "bg-blue-100 text-blue-700" },
  video:         { label: "Video",          className: "bg-red-100 text-red-700" },
  documentation: { label: "Docs",           className: "bg-yellow-100 text-yellow-700" },
  course:        { label: "Course",         className: "bg-green-100 text-green-700" },
};

interface ResourcePanelProps {
  topic: string | null;
  resources: Resource[];
  isLoading: boolean;
  onClose: () => void;
}

export default function ResourcePanel({ topic, resources, isLoading, onClose }: ResourcePanelProps) {
  if (!topic) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white border-l shadow-xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Resources for</p>
          <h2 className="font-semibold text-sm text-gray-900 leading-tight">{topic}</h2>
        </div>
        <button
          onClick={onClose}
          className="ml-2 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Finding resources…</p>
          </div>
        ) : resources.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-10">No resources found.</p>
        ) : (
          resources.map((r, i) => {
            const badge = TYPE_STYLES[r.type] ?? TYPE_STYLES.article;
            return (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 leading-tight">
                    {r.title}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{r.description}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{r.url}</p>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
