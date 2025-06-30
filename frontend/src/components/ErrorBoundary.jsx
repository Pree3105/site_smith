import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-4 border border-red-700 rounded bg-red-900">
          <strong>Editor failed to load:</strong>
          <div>{this.state.error?.message}</div>
        </div>
      );
    }

    return this.props.children;
  }
}
