import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "monospace", color: "red" }}>
          <h1>Something went wrong!</h1>
          <p>{this.state.error?.message}</p>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error?.stack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
