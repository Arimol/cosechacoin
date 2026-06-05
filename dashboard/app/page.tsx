import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import { getCrops, getDemoStatus } from "@/lib/api";
import { MOCK_CROPS, MOCK_METRICS } from "@/lib/mockData";

export default async function DashboardPage() {
  const crops = await getCrops();
  const demo = await getDemoStatus();

  // Usar datos reales si existen, sino mockData
  const displayCrops = crops && crops.length > 0 ? crops : MOCK_CROPS;
  const activeCrops = displayCrops.filter((c: any) =>
    c.status === "active" || c.status === "Activa"
  ).length;

  const contractId = demo?.crop?.contract_id || crops?.[0]?.contract_id || null;

  return (
    <div>
      <PageHeader
        title="Panel de inversión"
        description="Resumen de cosechas tokenizadas e impulsores agrícolas en Stellar Testnet."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Cosechas activas"
          value={String(activeCrops || MOCK_METRICS.activeCrops)}
          hint="Parcelas con tokens en venta"
        />
        <MetricCard
          label="Capital invertido"
          value={`$${MOCK_METRICS.capitalInvestedUsdc.toLocaleString("en-US")} USDC`}
          hint="Acumulado en testnet"
        />
        <MetricCard
          label="Rendimiento promedio"
          value={`${MOCK_METRICS.averageYieldPct}%`}
          hint="Proyección AI último ciclo"
        />
        <MetricCard
          label="Impulsores activos"
          value={String(MOCK_METRICS.activeBoosters)}
          hint="Drones, riego, semillas, IoT"
        />
      </section>

      {contractId && (
        <div className="mt-6 rounded-xl border border-border-subtle bg-brand-light/30 px-5 py-3 text-sm text-ink-secondary">
          🔗 Contrato activo en Stellar Testnet:{" "}
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-brand-dark underline"
          >
            {contractId.slice(0, 12)}…{contractId.slice(-6)}
          </a>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-base font-semibold text-ink-primary">
          Cosechas recientes
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border-subtle bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-brand-light/50 text-ink-secondary">
                <th className="px-5 py-3 font-medium">Cultivo</th>
                <th className="px-5 py-3 font-medium">Región</th>
                <th className="px-5 py-3 font-medium">Productor</th>
                <th className="px-5 py-3 font-medium">Tokens disponibles</th>
                <th className="px-5 py-3 font-medium">Precio / token</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Blockchain</th>
              </tr>
            </thead>
            <tbody>
              {displayCrops.map((crop: any) => (
                <tr
                  key={crop.id || crop.contract_id}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td className="px-5 py-4 font-medium text-ink-primary">
                    {crop.cropName || crop.crop_name}
                  </td>
                  <td className="px-5 py-4 text-ink-secondary">
                    {crop.region}
                  </td>
                  <td className="px-5 py-4 text-ink-primary">
                    {crop.farmer || crop.farmer_public_key?.slice(0, 8) + "…"}
                  </td>
                  <td className="px-5 py-4 text-ink-primary">
                    {(crop.tokensAvailable ?? crop.total_tokens)?.toLocaleString("es-CR")}
                  </td>
                  <td className="px-5 py-4 text-ink-primary">
                    {crop.priceLabel || `$${crop.price_per_token} USDC`}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-medium text-brand-dark">
                      {crop.status === "active" ? "Activa" : crop.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {crop.contract_id && (
                      <a
                        href={`https://stellar.expert/explorer/testnet/contract/${crop.contract_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-dark underline"
                      >
                        Ver en Stellar
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
