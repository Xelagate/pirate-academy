declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const meta: {
    title: string;
    lessonId: string;
    initialCode: string;
  };

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
