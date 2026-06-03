import { useCallback, useEffect, useState } from "react";
import Head from "next/head";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function InvestorDashboard() {
  const [health, setHealth] = useState(null);
  const [crops, setCrops] = useState(null);
  const [boosters, setBoosters] = useState(null);
  const [stellar, setStellar] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, c, b, s] = await Promise.all([
        fetch(`${API_URL}/api/health`).then((r) => r.json()),
        fetch(`${API_URL}/api/crops`).then((r) => r.json()),
        fetch(`${API_URL}/api/boosters`).then((r) => r.json()),
        fetch(`${API_URL}/api/stellar/config`).then((r) => r.json()),
      ]);
      setHealth(h);
      setCrops(c);
      setBoosters(b);
      setStellar(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Head>
        <title>CosechaCoin — Panel de inversores</title>
        <meta name="description" content="Tokenización de cosechas en Stellar" />
      </Head>
      <main className="container">
        <header>
          <h1>CosechaCoin</h1>
          <p>Plataforma de tokenización agrícola en Stellar Soroban</p>
        </header>

        {loading && <p className="muted">Cargando datos del backend…</p>}
        {error && (
          <p className="error">
            No se pudo conectar al API ({API_URL}): {error}
          </p>
        )}

        <section className="grid">
          <article className="card">
            <h2>Estado del sistema</h2>
            <pre>{health ? JSON.stringify(health, null, 2) : "—"}</pre>
          </article>
          <article className="card">
            <h2>Stellar / Soroban</h2>
            <pre>{stellar ? JSON.stringify(stellar, null, 2) : "—"}</pre>
          </article>
          <article className="card">
            <h2>Cosechas ({crops?.source || "—"})</h2>
            <pre>
              {crops?.data?.length
                ? JSON.stringify(crops.data, null, 2)
                : "Sin registros. Configura Supabase o registra cosechas."}
            </pre>
          </article>
          <article className="card">
            <h2>Impulsores ({boosters?.source || "—"})</h2>
            <pre>
              {boosters?.data?.length
                ? JSON.stringify(boosters.data, null, 2)
                : "Sin impulsores. Drones NDVI, riego inteligente, semillas certificadas."}
            </pre>
          </article>
        </section>

        <footer>
          <button type="button" onClick={load}>
            Actualizar
          </button>
        </footer>
      </main>
    </>
  );
}
