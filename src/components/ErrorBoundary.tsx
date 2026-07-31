import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#090d16] text-[#111827] dark:text-[#f9fafb] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#171a21] border border-[#e5e7eb] dark:border-[#2d3340] rounded-2xl p-6 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Application Error</h2>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                An unexpected interface issue occurred.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-left text-xs font-mono text-red-800 dark:text-red-300 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#111827] text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
