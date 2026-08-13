type RouteSkeletonProps = {
  admin?: boolean;
};

function Line({ width = "100%", large = false }: { width?: string; large?: boolean }) {
  return <span className={large ? "skeleton-line skeleton-line-large" : "skeleton-line"} style={{ width }} />;
}

export function RouteSkeleton({ admin = false }: RouteSkeletonProps) {
  if (admin) {
    return (
      <div className="admin-skeleton" aria-busy="true" aria-label="Loading dashboard">
        <span className="sr-only">Loading dashboard</span>
        <div className="skeleton-heading"><Line width="18%" /><Line width="46%" large /><Line width="34%" /></div>
        <div className="skeleton-metrics">{Array.from({ length: 3 }, (_, index) => <div className="skeleton-glass" key={index}><span className="skeleton-circle" /><Line width="42%" large /><Line width="62%" /></div>)}</div>
        <div className="skeleton-admin-grid">{Array.from({ length: 2 }, (_, index) => <div className="skeleton-glass skeleton-table" key={index}><Line width="35%" large />{Array.from({ length: 4 }, (__, row) => <Line width={`${84 - row * 7}%`} key={row} />)}</div>)}</div>
      </div>
    );
  }

  return (
    <main className="route-skeleton" aria-busy="true" aria-label="Loading page">
      <span className="sr-only">Loading page</span>
      <section className="skeleton-hero">
        <div className="container skeleton-hero-grid">
          <div className="skeleton-heading"><Line width="28%" /><Line large /><Line width="82%" large /><Line width="74%" /><div className="skeleton-actions"><span /><span /></div></div>
          <div className="skeleton-visual skeleton-glass"><span className="skeleton-orbit" /><span className="skeleton-logo" /></div>
        </div>
      </section>
      <section className="section"><div className="container skeleton-card-grid">{Array.from({ length: 3 }, (_, index) => <div className="skeleton-glass skeleton-content-card" key={index}><span className="skeleton-image" /><Line width="38%" /><Line width="86%" large /><Line width="72%" /></div>)}</div></section>
    </main>
  );
}
