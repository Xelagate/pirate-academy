"use client";

import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function ErrorFallback({ message }: { message: string }) {
  return (
    <div className="bg-[#0a0f18] border border-white/10 rounded-2xl p-6 text-slate-400 text-sm text-center">
      {message}
    </div>
  );
}
