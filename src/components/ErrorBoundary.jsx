import React from 'react';
import { RefreshCw, AlertTriangle, Home, RotateCcw, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

/**
 * Sanitizes technical error message and stack trace to prevent
 * leaking auth tokens, passwords, API keys, or private user data.
 */
function sanitizeErrorInfo(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/(password|token|secret|authorization|key)=([^&]+)/gi, '$1=[REDACTED]')
    .replace(/(mongodb(\+srv)?:\/\/)[^@]+@/gi, '$1[REDACTED]@')
    .replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+/g, '[JWT_TOKEN_REDACTED]');
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    const safeMsg = sanitizeErrorInfo(error?.message || '');
    const safeStack = sanitizeErrorInfo(error?.stack || '');
    console.error('[ErrorBoundary] Caught runtime rendering error:', {
      name: error?.name || 'Error',
      message: safeMsg,
      componentStack: sanitizeErrorInfo(errorInfo?.componentStack || '')
    });
  }

  handleTryAgain = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false
    });
    window.location.href = '/';
  };

  handleToggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  handleCopyDetails = () => {
    const { error, errorInfo } = this.state;
    const details = [
      `Error: ${error?.name || 'Error'}: ${sanitizeErrorInfo(error?.message || 'Unknown')}`,
      `Time: ${new Date().toISOString()}`,
      `URL: ${window.location.pathname}${window.location.search}`,
      `Component Stack:`,
      sanitizeErrorInfo(errorInfo?.componentStack || 'Not available'),
      `Stack Trace:`,
      sanitizeErrorInfo(error?.stack || 'Not available')
    ].join('\n');

    try {
      navigator.clipboard.writeText(details);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (e) {
      // Clipboard fallback
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails, copied } = this.state;
      const safeMessage = sanitizeErrorInfo(error?.message || 'An unexpected rendering error occurred.');
      const safeComponentStack = sanitizeErrorInfo(errorInfo?.componentStack || '');

      return (
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6 text-zinc-900 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-zinc-200/60 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                Something went wrong
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                An unexpected error occurred while rendering this section. Don't worry, your data and cart remain safe.
              </p>
            </div>

            {/* Action Buttons: Try Again, Reload Page, Go to Home */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleTryAgain}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-sm hover:shadow"
                title="Retry rendering this view"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-all cursor-pointer"
                title="Reload the entire browser page"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-all cursor-pointer"
                title="Return to the store homepage"
              >
                <Home className="w-3.5 h-3.5" />
                Go to Home
              </button>
            </div>

            {/* Technical Diagnostics Collapsible Accordion */}
            <div className="pt-2 border-t border-zinc-150 text-left">
              <button
                type="button"
                onClick={this.handleToggleDetails}
                className="w-full flex items-center justify-between text-xs font-semibold text-zinc-500 hover:text-zinc-800 py-1 transition-colors cursor-pointer select-none"
              >
                <span>Technical details for debugging</span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {showDetails && (
                <div className="mt-3 space-y-2.5 text-xs animate-in fade-in duration-200">
                  <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-zinc-700 font-mono text-[11px] leading-relaxed break-words">
                    <div className="font-semibold text-red-600 mb-1">
                      {error?.name || 'Error'}: {safeMessage}
                    </div>
                    {safeComponentStack && (
                      <div className="text-zinc-500 max-h-36 overflow-y-auto mt-2 pt-2 border-t border-zinc-200 text-[10px] whitespace-pre-wrap">
                        {safeComponentStack}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={this.handleCopyDetails}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
