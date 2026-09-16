import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  routePath?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo: errorInfo.componentStack || null });
    // Log to console for debugging
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const text = [
      `Error: ${error?.message}`,
      error?.stack && `\nStack:\n${error.stack}`,
      errorInfo && `\nComponent Stack:\n${errorInfo}`,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      // copied
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-xl font-bold text-foreground">
            خطا در بارگذاری صفحه
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            صفحه مورد نظر بارگذاری نشد. لطفاً صفحه را رفرش کنید.
          </p>

          {/* Error message */}
          {this.state.error && (
            <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-destructive">
                  پیام خطا:
                </p>
                <button
                  onClick={this.handleCopyError}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline"
                >
                  کپی جزئیات
                </button>
              </div>
              <p className="text-xs text-foreground/80 font-mono break-all">
                {this.state.error.message}
              </p>
              {/* Stack trace */}
              {this.state.error.stack && (
                <details className="mt-2">
                  <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                    نمایش Stack Trace
                  </summary>
                  <pre className="mt-1 text-[10px] text-muted-foreground font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto bg-muted/50 rounded-lg p-2">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              {/* Component stack */}
              {this.state.errorInfo && (
                <details className="mt-1">
                  <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                    نمایش Component Stack
                  </summary>
                  <pre className="mt-1 text-[10px] text-muted-foreground font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto bg-muted/50 rounded-lg p-2">
                    {this.state.errorInfo}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="clay-button px-6 py-2 text-sm font-semibold"
            >
              رفرش صفحه
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="clay-button px-6 py-2 text-sm bg-muted text-foreground"
            >
              بازگشت به داشبورد
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
