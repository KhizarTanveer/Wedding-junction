import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Always log errors for debugging purposes
    const errorDetails = {
      message: error?.message || "Unknown error",
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Log error to console (always, for debugging)
    console.error("ErrorBoundary caught an error:", errorDetails);

    // In production, attempt to log to localStorage for later debugging
    // (This is a simple approach for a university project - in a real app, use a service like Sentry)
    if (process.env.NODE_ENV === "production") {
      try {
        const existingErrors = JSON.parse(localStorage.getItem("app_errors") || "[]");
        existingErrors.push(errorDetails);
        // Keep only last 10 errors to prevent storage bloat
        const trimmedErrors = existingErrors.slice(-10);
        localStorage.setItem("app_errors", JSON.stringify(trimmedErrors));
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50 flex items-center justify-center px-6">
          <div className="text-center max-w-lg">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Message */}
            <h1 className="text-2xl md:text-3xl font-serif text-slate-800 mb-4">
              Something Went Wrong
            </h1>
            <p className="text-stone-500 mb-8 leading-relaxed">
              We're sorry, but something unexpected happened. Please try refreshing
              the page or go back to the home page.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-red-700 text-sm font-mono break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-red-600 text-xs cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="text-red-600 text-xs mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3 rounded-full font-medium shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-8 py-3 bg-white border border-stone-200 text-slate-700 rounded-full font-medium hover:bg-stone-50 transition-all duration-300"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
