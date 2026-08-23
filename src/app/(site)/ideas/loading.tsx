export default function IdeasLoading() {
  return (
    <main className="route-skeleton ideas-index-skeleton" aria-busy="true" aria-label="Loading business ideas">
      <span className="sr-only">Loading business ideas</span>
      <section className="skeleton-hero"><div className="container narrow skeleton-copy"><span className="skeleton-line short" /><span className="skeleton-line heading wide" /><span className="skeleton-line medium" /></div></section>
      <div className="skeleton-filter"><span /><span /><span /><span /></div>
      <section className="section"><div className="container skeleton-card-grid">{Array.from({ length: 6 }, (_, index) => <div className="skeleton-glass skeleton-content-card" key={index}><span className="skeleton-image" /><span className="skeleton-line short" /><span className="skeleton-line skeleton-line-large wide" /><span className="skeleton-line medium" /></div>)}</div></section>
    </main>
  );
}
