"use client";

import React, { useEffect, useRef, useState } from "react";
import { Markmap } from "markmap-view";
import { transformer } from "./markmap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResourcePanel from "@/components/resource-panel";
import HistoryPanel from "@/components/history-panel";
import ExportMenu from "@/components/export-menu";
import { type Resource } from "@/app/api/get-resources/route";
import {
  type MindmapEntry,
  loadHistory,
  saveEntry,
  deleteEntry,
  clearHistory,
} from "@/lib/history";

interface MarkmapHooksProps {
  markdown: string;
}

export default function MarkmapHooks({ markdown }: MarkmapHooksProps) {
  const refSvg = useRef<SVGSVGElement>(null);
  const refMm = useRef<Markmap>();
  const [currentMarkdown, setCurrentMarkdown] = useState(markdown);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Resource panel
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const rootTopicRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const selectedTopicRef = useRef<string | null>(null);
  const fetchResourcesRef = useRef<(topic: string) => void>(() => {});

  // History
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<MindmapEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (!refMm.current && refSvg.current) {
      const mm = Markmap.create(refSvg.current);
      refMm.current = mm;
    }
  }, []);

  useEffect(() => {
    const mm = refMm.current;
    if (!mm) return;

    const { root } = transformer.transform(currentMarkdown);
    mm.setData(root);

    const rootMatch = currentMarkdown.match(/^#\s+(.+)/m);
    if (rootMatch) rootTopicRef.current = rootMatch[1].trim();

    const timer = setTimeout(() => mm.fit(), 100);
    return () => clearTimeout(timer);
  }, [currentMarkdown]);

  useEffect(() => {
    const handleResize = () => refMm.current?.fit();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keep ref in sync so the stable click handler always calls latest fetchResources
  fetchResourcesRef.current = fetchResources;

  // Node click → resource panel
  useEffect(() => {
    const svg = refSvg.current;
    if (!svg) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      const nodeEl = target.closest(".markmap-node");
      if (!nodeEl) return;

      const text = nodeEl.querySelector("foreignObject")?.textContent?.trim();
      if (!text) return;

      // Skip if same node clicked again
      if (selectedTopicRef.current === text) return;
      selectedTopicRef.current = text;

      setSelectedTopic(text);
      fetchResourcesRef.current(text);
    };

    svg.addEventListener("click", handleClick);
    return () => svg.removeEventListener("click", handleClick);
  }, []);

  const fetchResources = async (topic: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setResources([]);
    setResourcesLoading(true);
    try {
      const response = await fetch("/api/get-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, context: rootTopicRef.current }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Resource API error:", data);
        throw new Error(data.error ?? "Failed to fetch resources");
      }
      setResources(data.resources ?? []);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Resource fetch error:", err);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setSelectedTopic(null);
    setResources([]);
    selectedTopicRef.current = null;
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userInput }),
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const data = await response.json();
      if (!data.markdown) throw new Error("Missing 'markdown' key.");

      const processedMarkdown = data.markdown.replace(/\\n/g, "\n");
      setCurrentMarkdown(processedMarkdown);

      // Save to history
      const entry = saveEntry(userInput, processedMarkdown);
      setHistory(loadHistory());
      setActiveId(entry.id);

      setUserInput("");
    } catch (error) {
      console.error("Error fetching mindmap:", error);
      alert("Failed to generate mindmap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (entry: MindmapEntry) => {
    setCurrentMarkdown(entry.markdown);
    setActiveId(entry.id);
    setSelectedTopic(null);
    setResources([]);
    setHistoryOpen(false);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteEntry(id);
    setHistory(updated);
    if (activeId === id) setActiveId(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setActiveId(null);
  };

  return (
    <div className="relative w-full h-full">
      <svg ref={refSvg} className="w-full h-full" />

      {/* History toggle button */}
      <button
        onClick={() => setHistoryOpen((o) => !o)}
        className="fixed top-4 left-4 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        aria-label="Toggle history"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History
        {history.length > 0 && (
          <span className="ml-0.5 bg-gray-200 text-gray-600 text-xs rounded-full px-1.5 py-0.5 leading-none">
            {history.length}
          </span>
        )}
      </button>

      <HistoryPanel
        isOpen={historyOpen}
        history={history}
        activeId={activeId}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
        onClose={() => setHistoryOpen(false)}
      />

      <ExportMenu
        svgRef={refSvg}
        markdown={currentMarkdown}
        rootTopic={rootTopicRef.current}
      />

      <ResourcePanel
        topic={selectedTopic}
        resources={resources}
        isLoading={resourcesLoading}
        onClose={() => { setSelectedTopic(null); setResources([]); selectedTopicRef.current = null; }}
      />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex space-x-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your query (e.g., How to prepare for a marathon)"
            className="w-full py-2 px-4 text-sm border rounded-lg"
          />
          <Button
            type="submit"
            className="rounded-lg"
            disabled={isLoading || !userInput.trim()}
          >
            {isLoading ? "Loading..." : "Generate"}
          </Button>
        </form>
      </div>
    </div>
  );
}
