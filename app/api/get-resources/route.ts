import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful assistant that recommends learning resources for a given topic.

Return ONLY a valid JSON array with exactly 5 resources. No markdown fences, no explanation, nothing else.

Each item must follow this exact shape:
{
  "title": "Specific, descriptive resource title",
  "description": "One sentence describing what this resource covers.",
  "type": "article" | "video" | "documentation" | "wikipedia" | "course",
  "searchQuery": "optimized search query to find this resource"
}

Rules:
- Do NOT include a "url" field — URLs will be constructed automatically
- For type "video": searchQuery should be a good YouTube search (e.g. "Python tutorial for beginners crash course")
- For type "wikipedia": searchQuery should be the Wikipedia article title (e.g. "Machine learning")
- For type "documentation": searchQuery should be like "React official documentation"
- For type "course": searchQuery should be like "Python for everybody Coursera"
- For type "article": searchQuery should be like "CSS flexbox guide MDN"
- Return exactly 5 items as a raw JSON array`;

export type ResourceType = "article" | "video" | "documentation" | "wikipedia" | "course";

export interface Resource {
  title: string;
  url: string;
  description: string;
  type: ResourceType;
}

interface RawResource {
  title: string;
  description: string;
  type: ResourceType;
  searchQuery: string;
}

function buildUrl(type: ResourceType, searchQuery: string): string {
  const q = encodeURIComponent(searchQuery);
  switch (type) {
    case "video":
      return `https://www.youtube.com/results?search_query=${q}`;
    case "wikipedia":
      return `https://en.wikipedia.org/w/index.php?search=${q}`;
    case "documentation":
      return `https://www.google.com/search?q=${q}`;
    case "course":
      return `https://www.google.com/search?q=${q}`;
    case "article":
      return `https://www.google.com/search?q=${q}`;
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  let topic: string;
  let context: string;
  try {
    const body = await request.json();
    topic = body.topic;
    context = body.context || "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!topic?.trim()) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  const userMessage = context
    ? `Find learning resources for: "${topic}" (in the context of: ${context})`
    : `Find learning resources for: "${topic}"`;

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.2,
    }),
  });

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    return NextResponse.json(
      { error: `Groq API error: ${errorText}` },
      { status: groqResponse.status }
    );
  }

  const data = await groqResponse.json();
  const content = data.choices[0].message.content as string;

  const match = content.match(/\[[\s\S]*\]/);
  if (!match) {
    return NextResponse.json(
      { error: "No JSON array found in model response" },
      { status: 500 }
    );
  }

  let parsed: RawResource[];
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse resources JSON" },
      { status: 500 }
    );
  }

  const resources: Resource[] = parsed.map((r) => ({
    title: r.title,
    description: r.description,
    type: r.type,
    url: buildUrl(r.type, r.searchQuery ?? r.title),
  }));

  return NextResponse.json({ resources });
}
