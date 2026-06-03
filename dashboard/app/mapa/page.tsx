import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";
import { MOCK_CROPS } from "@/lib/mockData";

const CostaRicaMap = dynamic(() => import("@/components/CostaRicaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-xl border border-border-subtle bg-white text-sm text-ink-secondary">
      Cargando mapa…
    </div>
  ),
});

export default function MapaPage() {
  return (
    <div>
      <PageHeader
        title="Mapa de parcelas"
        description="Ubicación geográfica de cosechas tokenizadas en Costa Rica. Datos OpenStreetMap."
      />
      <CostaRicaMap crops={MOCK_CROPS} />
    </div>
  );
}
