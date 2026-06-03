import PageHeader from "@/components/PageHeader";
import MetricCard from "@/components/MetricCard";
import { MOCK_CROPS, MOCK_METRICS } from "@/lib/mockData";

export default function DashboardPage() {
  const metrics = MOCK_METRICS;

  return (
    <div>
      <PageHeader
        title="Panel de inversión"
        description="Resumen de cosechas tokenizadas e impulsores agrícolas en Stellar Testnet."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Cosechas activas"
          value={String(metrics.activeCrops)}
          hint="Parcelas con tokens en venta"
        />
        <MetricCard
          label="Capital invertido"
          value={`$${metrics.capitalInvestedUsdc.toLocaleString("en-US")} USDC`}
          hint="Acumulado en testnet"
        />
        <MetricCard
          label="Rendimiento promedio"
          value={`${metrics.averageYieldPct}%`}
          hint="Proyección AI último ciclo"
        />
        <MetricCard
          label="Impulsores activos"
          value={String(metrics.activeBoosters)}
          hint="Drones, riego, semillas, IoT"
        />
      </section>

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
              </tr>
            </thead>
            <tbody>
              {MOCK_CROPS.map((crop) => (
                <tr
                  key={crop.id}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td className="px-5 py-4 font-medium text-ink-primary">
                    {crop.cropName}
                  </td>
                  <td className="px-5 py-4 text-ink-secondary">{crop.region}</td>
                  <td className="px-5 py-4 text-ink-primary">{crop.farmer}</td>
                  <td className="px-5 py-4 text-ink-primary">
                    {crop.tokensAvailable.toLocaleString("es-CR")}
                  </td>
                  <td className="px-5 py-4 text-ink-primary">{crop.priceLabel}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-medium text-brand-dark">
                      {crop.status}
                    </span>
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
