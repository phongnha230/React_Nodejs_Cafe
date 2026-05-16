import React from 'react';

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App render failed:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-error">
        <section className="app-error-panel">
          <h1>App bi loi render</h1>
          <p>{this.state.error.message || 'Da co loi xay ra khi tai giao dien.'}</p>
          <div className="app-error-actions">
            <button className="btn" onClick={this.handleReload}>Tai lai</button>
            <button className="btn secondary" onClick={this.handleClearCache}>Xoa cache va tai lai</button>
          </div>
        </section>
      </main>
    );
  }
}
