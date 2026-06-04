import 'package:flutter/material.dart';

import '../../config/constants.dart';
import '../../data/mock_data.dart';
import '../../models/booster.dart';
import '../../models/crop.dart';
import '../../services/api_service.dart';
import '../../widgets/booster_card.dart';
import '../../widgets/loading_overlay.dart';
import '../../widgets/metric_card.dart';
import '../../widgets/primary_button.dart';

/// Dashboard del productor: estado de cosecha e impulsores.
class ProducerHomeScreen extends StatefulWidget {
  const ProducerHomeScreen({super.key});

  @override
  State<ProducerHomeScreen> createState() => _ProducerHomeScreenState();
}

class _ProducerHomeScreenState extends State<ProducerHomeScreen> {
  final _api = ApiService();
  bool _loading = true;
  Crop _crop = MockData.producerCrop;
  List<Booster> _boosters = MockData.catalogBoosters.take(3).toList();
  double _capitalUsdc = MockData.producerMetrics.capitalUsdc;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final info = await _api.getCropInfo();
      if (info != null) {
        _crop = info;
        _capitalUsdc = info.tokensSold * info.pricePerToken;
      }
      final onChain = await _api.listBoosters();
      if (onChain.isNotEmpty) {
        _boosters = onChain;
      }
    } catch (_) {
      // Mantener mock
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: colorBackground,
      appBar: AppBar(
        title: const Text('Panel productor'),
        backgroundColor: colorPrimaryDark,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              Navigator.pushNamedAndRemoveUntil(context, routeRoleSelection, (_) => false),
        ),
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _load,
            color: colorAccent,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: colorBorderSubtle),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Tu cosecha tokenizada',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: colorTextPrimary,
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: colorCardMint,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _crop.status,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: colorAccent,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${_crop.cropName} · ${_crop.region}',
                        style: const TextStyle(
                          fontSize: 15,
                          color: colorTextSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: MetricCard(
                        label: 'Tokens vendidos',
                        value: '${_crop.tokensSold}',
                        hint: 'de ${_crop.totalTokens}',
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: MetricCard(
                        label: 'Capital recibido',
                        value: '\$${_capitalUsdc.toStringAsFixed(0)}',
                        hint: 'USDC estimado',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                MetricCard(
                  label: 'Fecha de cosecha',
                  value: _crop.harvestDate,
                ),
                const SizedBox(height: 24),
                PrimaryButton(
                  label: 'Registrar nueva cosecha',
                  onPressed: () async {
                    await Navigator.pushNamed(context, routeRegisterCrop);
                    _load();
                  },
                ),
                const SizedBox(height: 28),
                const Text(
                  'Impulsores en tu parcela',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: colorTextPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Servicios financiados por inversores para mejorar rendimiento.',
                  style: TextStyle(fontSize: 14, color: colorTextSecondary),
                ),
                const SizedBox(height: 16),
                ..._boosters.map(
                  (b) => BoosterCard(
                    booster: b,
                    onFund: null,
                  ),
                ),
              ],
            ),
          ),
          LoadingOverlay(visible: _loading),
        ],
      ),
    );
  }
}
