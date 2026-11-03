export default function Welcome({ searchParams }: { searchParams: { dev?: string } }) {
  return (
    <main className="wrap form-page">
      <div style={{ display: "grid", gap: "1rem" }}>
        <p className="eyebrow">Welcome</p>
        <h1 style={{ fontSize: "var(--step-3)" }}>You're a member.</h1>
        <p className="muted">
          We'll email you when your service is active. In the meantime, the member forum has router setup
          guides for your network.
        </p>
        {searchParams.dev && (
          <p className="alert">Dev mode: Stripe isn't configured, so no payment was taken.</p>
        )}
      </div>
    </main>
  );
}
