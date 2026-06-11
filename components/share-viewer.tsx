"use client";

import React, { useEffect, useRef } from "react";
import { Markmap } from "markmap-view";
import { transformer } from "./markmap";
import { decompressMarkdown } from "@/lib/share";

export default function ShareViewer({ data }: { data: string }) {
  const refSvg = useRef<SVGSVGElement>(null);

  const markdown = data ? (decompressMarkdown(data) ?? "") : "";

  useEffect(() => {
    if (!refSvg.current || !markdown) return;
    const mm = Markmap.create(refSvg.current);
    const { root } = transformer.transform(markdown);
    mm.setData(root);
    setTimeout(() => mm.fit(), 100);
  }, [markdown]);

  if (!markdown) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Invalid or expired share link.
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden relative">
      <svg ref={refSvg} className="w-full h-full" />
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white border rounded-full px-4 py-1.5 shadow text-sm text-gray-500">
        Shared mindmap — <a href="/" className="text-gray-900 font-medium hover:underline">Create your own</a>
      </div>
    </div>
  );
}
