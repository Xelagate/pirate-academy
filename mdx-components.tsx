import type { ComponentType, ReactNode } from "react";

type MDXComponents = Record<
  string,
  ComponentType<{ children?: ReactNode; [key: string]: unknown }>
>;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
