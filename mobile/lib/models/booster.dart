/// Impulsor agrícola financiado on-chain.
class Booster {
  const Booster({
    required this.id,
    required this.title,
    required this.description,
    required this.benefit,
    required this.apiType,
    required this.amountUsdc,
    required this.status,
    this.parcel,
    this.cropType,
    this.region,
  });

  final int id;
  final String title;
  final String description;
  final String benefit;
  final String apiType;
  final double amountUsdc;
  final String status;
  final String? parcel;
  final String? cropType;
  final String? region;

  factory Booster.fromApi(Map<String, dynamic> data) {
    final typeRaw = data['booster_type']?.toString() ?? 'drone_ndvi';
    final title = _titleFromType(typeRaw);
    final amountRaw = data['amount'];
    final amount = amountRaw is num
        ? amountRaw.toDouble()
        : double.tryParse(amountRaw?.toString() ?? '') ?? 0;

    return Booster(
      id: (data['id'] as num?)?.toInt() ?? 0,
      title: title,
      description: _descriptionFromType(typeRaw),
      benefit: _benefitFromType(typeRaw),
      apiType: typeRaw,
      amountUsdc: amount,
      status: data['status']?.toString() ?? 'Pendiente',
      parcel: data['parcel']?.toString(),
      cropType: data['crop_type']?.toString(),
      region: data['region']?.toString(),
    );
  }

  static String _titleFromType(String type) {
    switch (type) {
      case 'smart_irrigation':
        return 'Riego inteligente';
      case 'certified_seeds':
        return 'Semillas certificadas';
      case 'iot_sensors':
        return 'Sensores IoT';
      case 'organic_certification':
        return 'Certificación orgánica';
      case 'drone_ndvi':
      default:
        return 'Dron NDVI';
    }
  }

  static String _descriptionFromType(String type) {
    switch (type) {
      case 'smart_irrigation':
        return 'Optimización de riego por humedad de suelo y clima local.';
      case 'certified_seeds':
        return 'Material vegetal certificado con trazabilidad en cadena.';
      case 'iot_sensors':
        return 'Red de sensores para temperatura, humedad y alertas.';
      case 'organic_certification':
        return 'Auditoría y sello orgánico para mercados premium.';
      case 'drone_ndvi':
      default:
        return 'Vuelo y análisis espectral NDVI de la parcela tokenizada.';
    }
  }

  static String _benefitFromType(String type) {
    switch (type) {
      case 'smart_irrigation':
        return 'Reduce estrés hídrico y mejora consistencia de rendimiento.';
      case 'certified_seeds':
        return 'Mayor germinación y calidad uniforme de lote.';
      case 'iot_sensors':
        return 'Decisiones en tiempo real con datos de campo.';
      case 'organic_certification':
        return 'Acceso a compradores que pagan prima por orgánico.';
      case 'drone_ndvi':
      default:
        return 'Detección temprana de zonas con estrés vegetativo.';
    }
  }
}
