import '../models/booster.dart';
import '../models/crop.dart';

/// Datos de respaldo cuando el backend no está disponible.
class MockData {
  MockData._();

  static const List<Crop> crops = [
    Crop(
      id: '1',
      cropName: 'Café',
      region: 'Tarrazú',
      farmer: 'Don Carlos Mora',
      tokensAvailable: 620,
      totalTokens: 1000,
      tokensSold: 380,
      pricePerToken: 2.5,
      priceLabel: '\$2.50 USDC',
      harvestDate: '2026-03-15',
      status: 'Activa',
      projectedYield: 88.5,
    ),
    Crop(
      id: '2',
      cropName: 'Frijol',
      region: 'Brunca',
      farmer: 'Cooperativa Los Ángeles',
      tokensAvailable: 210,
      totalTokens: 500,
      tokensSold: 290,
      pricePerToken: 1.2,
      priceLabel: '\$1.20 USDC',
      harvestDate: '2026-02-28',
      status: 'Activa',
      projectedYield: 76.0,
    ),
    Crop(
      id: '3',
      cropName: 'Cacao',
      region: 'Limón',
      farmer: 'María Fernández',
      tokensAvailable: 95,
      totalTokens: 300,
      tokensSold: 205,
      pricePerToken: 4.8,
      priceLabel: '\$4.80 USDC',
      harvestDate: '2026-04-10',
      status: 'Activa',
      projectedYield: 82.0,
    ),
    Crop(
      id: '4',
      cropName: 'Maíz',
      region: 'Guanacaste',
      farmer: 'Familia Solano',
      tokensAvailable: 140,
      totalTokens: 200,
      tokensSold: 60,
      pricePerToken: 0.9,
      priceLabel: '\$0.90 USDC',
      harvestDate: '2026-01-20',
      status: 'Validada',
      projectedYield: 71.0,
    ),
  ];

  static const List<Booster> catalogBoosters = [
    Booster(
      id: 0,
      title: 'Dron NDVI',
      description:
          'Vuelo y análisis espectral NDVI de la parcela tokenizada.',
      benefit: 'Detección temprana de zonas con estrés vegetativo.',
      apiType: 'drone_ndvi',
      amountUsdc: 850,
      status: 'Disponible',
      parcel: 'Café Tarrazú',
      cropType: 'cafe',
      region: 'Tarrazú',
    ),
    Booster(
      id: 0,
      title: 'Riego inteligente',
      description:
          'Optimización de riego por humedad de suelo y clima local.',
      benefit: 'Reduce estrés hídrico y mejora consistencia de rendimiento.',
      apiType: 'smart_irrigation',
      amountUsdc: 1200,
      status: 'Disponible',
    ),
    Booster(
      id: 0,
      title: 'Semillas certificadas',
      description:
          'Material vegetal certificado con trazabilidad en cadena.',
      benefit: 'Mayor germinación y calidad uniforme de lote.',
      apiType: 'certified_seeds',
      amountUsdc: 450,
      status: 'Disponible',
    ),
    Booster(
      id: 0,
      title: 'Sensores IoT',
      description:
          'Red de sensores para temperatura, humedad y alertas.',
      benefit: 'Decisiones en tiempo real con datos de campo.',
      apiType: 'iot_sensors',
      amountUsdc: 680,
      status: 'Disponible',
    ),
    Booster(
      id: 0,
      title: 'Certificación orgánica',
      description: 'Auditoría y sello orgánico para mercados premium.',
      benefit: 'Acceso a compradores que pagan prima por orgánico.',
      apiType: 'organic_certification',
      amountUsdc: 1500,
      status: 'Disponible',
    ),
  ];

  static const producerCrop = Crop(
    id: 'producer-1',
    cropName: 'Café',
    region: 'Tarrazú',
    farmer: 'Tu parcela',
    tokensAvailable: 620,
    totalTokens: 1000,
    tokensSold: 380,
    pricePerToken: 2.5,
    harvestDate: '2026-03-15',
    status: 'Activa',
    projectedYield: 88.5,
  );

  static const producerMetrics = (
    capitalUsdc: 950.0,
    tokensSold: 380,
  );
}
