import React from 'react';
import Button from './Button';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleClearStorage = () => {
        if (window.confirm('This will clear all local data. Are you sure?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] p-4">
                    <div className="max-w-lg w-full bg-[var(--bg-glass)] border border-red-500/30 rounded-xl p-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <div className="flex items-center gap-4 mb-6 text-red-500">
                            <AlertTriangle className="w-12 h-12" />
                            <h1 className="text-2xl font-bold">Something went wrong</h1>
                        </div>

                        <div className="bg-black/30 p-4 rounded-lg mb-6 overflow-auto max-h-48">
                            <p className="font-mono text-sm text-red-400 mb-2">{this.state.error && this.state.error.toString()}</p>
                            <pre className="font-mono text-xs text-gray-500 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="primary" icon={RefreshCw} onClick={this.handleReset} className="flex-1">
                                Reload Page
                            </Button>
                            <Button variant="danger" icon={Trash2} onClick={this.handleClearStorage} className="flex-1">
                                Clear Data & Reset
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
