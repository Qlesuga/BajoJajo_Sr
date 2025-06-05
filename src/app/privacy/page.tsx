"use server";

import ReactMarkdown from "react-markdown";
import fs from "fs";
import path from "path";

export default async function Terms() {
  const markdownFilePath = path.join(process.cwd(), "PRIVACY.md");
  const markdown = fs.readFileSync(markdownFilePath, "utf-8");

  return (
    <div className="container mx-auto px-4 py-8">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-8 text-3xl font-semibold" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-medium" {...props} />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
