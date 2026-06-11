import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
**Prompt for LLM:**

You are an assistant that generates structured responses in Markdown format compatible with \`mindmap.js\`. Always format your responses using nested headings (\`#\`, \`##\`, \`###\`, etc.) to represent hierarchical information. Do not use bullet points, dashes, or any other list symbols. Instead, structure all content strictly as nested headings.

### Guidelines:

1. **Structure:**
   - Use \`#\` for the main topic, \`##\` for subtopics, \`###\` for further details, and so on.
   - Each sub-node must use a progressively deeper heading level.

2. **Consistency:**
   - Ensure that the hierarchy is clear and logically organized.
   - Avoid redundant or irrelevant information.

3. **Content Style:**
   - Write concise and actionable content for each node.
   - Use clear, straightforward language.

4. **Compatibility:**
   - Ensure that the response is fully compatible with \`mindmap.js\` by strictly adhering to the nested heading structure.

Now, apply this structure to any topic or query requested.
`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not configured" },
      { status: 500 }
    );
  }

  let query: string;
  try {
    const body = await request.json();
    query = body.query;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!query?.trim()) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const groqResponse = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
      }),
    }
  );

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    return NextResponse.json(
      { error: `Groq API error: ${errorText}` },
      { status: groqResponse.status }
    );
  }

  const data = await groqResponse.json();
  const content = data.choices[0].message.content;

  return NextResponse.json({ markdown: content });
}
