/// Cosecha tokenizada para marketplace y detalle de inversión.
class Crop {
  const Crop({
    required this.id,
    required this.cropName,
    required this.region,
    required this.farmer,
    required this.tokensAvailable,
    required this.totalTokens,
    required this.tokensSold,
    required this.pricePerToken,
    required this.harvestDate,
    required this.status,
    this.projectedYield,
    this.priceLabel,
  });

  final String id;
  final String cropName;
  final String region;
  final String farmer;
  final int tokensAvailable;
  final int totalTokens;
  final int tokensSold;
  final double pricePerToken;
  final String harvestDate;
  final String status;
  final double? projectedYield;
  final String? priceLabel;

  String get displayPrice =>
      priceLabel ?? '\$${pricePerToken.toStringAsFixed(2)} USDC';

  /// Parsea respuesta GET /api/crops/info (envoltura success/data).
  factory Crop.fromApi(Map<String, dynamic> data, {String id = 'on-chain'}) {
    final harvestTs = data['harvest_date'];
    final harvestStr = harvestTs is int
        ? DateTime.fromMillisecondsSinceEpoch(harvestTs * 1000)
            .toIso8601String()
            .split('T')
            .first
        : (data['harvest_date']?.toString() ?? '—');

    final priceRaw = data['price_per_token'];
    final price = priceRaw is num
        ? priceRaw.toDouble()
        : double.tryParse(priceRaw?.toString() ?? '') ?? 0;

    final total = (data['total_tokens'] as num?)?.toInt() ?? 0;
    final sold = (data['tokens_sold'] as num?)?.toInt() ?? 0;
    final available = (data['tokens_available'] as num?)?.toInt() ?? (total - sold);

    return Crop(
      id: id,
      cropName: data['crop_name']?.toString() ?? 'Cosecha',
      region: data['region']?.toString() ?? 'Costa Rica',
      farmer: _shortAddress(data['farmer']?.toString() ?? 'Productor'),
      tokensAvailable: available,
      totalTokens: total,
      tokensSold: sold,
      pricePerToken: price,
      harvestDate: harvestStr,
      status: _formatStatus(data['status']?.toString()),
      projectedYield: (data['yield_percentage'] as num?)?.toDouble(),
    );
  }

  static String _shortAddress(String value) {
    if (value.length <= 12) return value;
    return '${value.substring(0, 4)}…${value.substring(value.length - 4)}';
  }

  static String _formatStatus(String? raw) {
    if (raw == null || raw.isEmpty) return 'Activa';
    final s = raw.toLowerCase();
    if (s.contains('active') || s.contains('activ')) return 'Activa';
    if (s.contains('valid')) return 'Validada';
    return raw;
  }
}
