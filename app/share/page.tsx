import ShareViewer from "@/components/share-viewer";

interface Props {
  searchParams: Promise<{ d?: string }>;
}

export default async function SharePage({ searchParams }: Props) {
  const { d = "" } = await searchParams;
  return <ShareViewer data={d} />;
}
