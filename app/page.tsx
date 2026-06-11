import MarkmapHooks from "@/components/markmap-hooks";

const initialMarkdown = `
# Welcome to Mindmap AI
## Type a query to generate a mindmap
`;

export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <MarkmapHooks markdown={initialMarkdown} />
    </div>
  );
}
