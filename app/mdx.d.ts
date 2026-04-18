declare module "*.mdx" {
  import type React from "react";
  const MDXContent: React.ComponentType<Record<string, never>>;
  export default MDXContent;
}
