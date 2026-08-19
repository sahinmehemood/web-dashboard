import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            fontFamily: "monospace",
            background: "#0a0a0a",
            color: "#fafafa",
            minHeight: "100vh",
          }}
        >
          <h1 style={{ color: "#ef4444" }}>Something went wrong</h1>
          <pre
            style={{
              background: "#111",
              padding: "1rem",
              borderRadius: "8px",
              overflow: "auto",
              fontSize: "12px",
              marginTop: "1rem",
            }}
          >
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
