import 'package:flutter/material.dart';

import '../../config/constants.dart';
import '../../data/mock_data.dart';
import '../../models/booster.dart';
import '../../services/ai_service.dart';
import '../../services/api_service.dart';
import '../../widgets/booster_card.dart';
import '../../widgets/loading_overlay.dart';

/// Catálogo de impulsores y financiación on-chain.
class BoostersScreen extends StatefulWidget {
  const BoostersScreen({super.key});

  @override
  State<BoostersScreen> createState() => _BoostersScreenState();
}

class _BoostersScreenState extends State<BoostersScreen> {
  final _api = ApiService();
  final _ai = AiService();
  final List<Booster> _boosters = List<Booster>.from(MockData.catalogBoosters);
  bool _loading = false;
  int? _fundingIndex;

  Future<void> _fund(int index) async {
    final booster = _boosters[index];
    setState(() {
      _loading = true;
      _fundingIndex = index;
    });
    try {
      final result = await _api.fundBooster(
        investorSecret: demoInvestorSecret,
        boosterType: booster.apiType,
        amount: booster.amountUsdc,
        providerPublicKey: demoProviderPublicKey,
      );
      final data = result['data'];
      int? boosterId;
      if (data is Map) {
        boosterId = (data['boosterId'] as num?)?.toInt() ??
            (data['booster_id'] as num?)?.toInt();
      }

      if (booster.apiType == 'drone_ndvi') {
        await _showNdviReport(
          cropType: booster.cropType ?? 'cafe',
          region: booster.region ?? 'Tarrazú',
          boosterId: boosterId,
        );
      } else if (!mounted) {
        return;
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              boosterId != null
                  ? 'Impulsor financiado (ID $boosterId)'
                  : 'Impulsor financiado correctamente',
            ),
          ),
        );
      }
    } on ApiException catch (e) {
      _error(e.message);
    } catch (e) {
      _error('Error al financiar: $e');
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _fundingIndex = null;
        });
      }
    }
  }

  Future<void> _showNdviReport({
    required String cropType,
    required String region,
    int? boosterId,
  }) async {
    try {
      final report = await _ai.analyzeDrone(
        cropType: cropType,
        region: region,
        boosterId: boosterId,
      );
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Reporte NDVI'),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Índice NDVI: ${report['ndvi_index'] ?? report['mean_ndvi'] ?? '—'}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Text(
                  'Salud del cultivo: ${report['health_status'] ?? '—'}',
                ),
                const SizedBox(height: 8),
                Text(
                  report['recommended_action']?.toString() ??
                      report['recommendation']?.toString() ??
                      'Sin acción recomendada',
                  style: const TextStyle(
                    fontSize: 14,
                    color: colorTextSecondary,
                    height: 1.4,
                  ),
                ),
                if (report['report_hash'] != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    'Hash: ${report['report_hash']}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cerrar'),
            ),
          ],
        ),
      );
    } on AiException catch (e) {
      _error('NDVI: ${e.message}');
    } catch (e) {
      _error('No se pudo obtener el análisis NDVI: $e');
    }
  }

  void _error(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red.shade800),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: colorBackground,
      appBar: AppBar(
        title: const Text('Impulsores'),
        backgroundColor: colorPrimaryDark,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const Text(
                'Financia servicios que mejoran el rendimiento de las parcelas tokenizadas.',
                style: TextStyle(
                  fontSize: 14,
                  color: colorTextSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),
              ...List.generate(_boosters.length, (i) {
                return BoosterCard(
                  booster: _boosters[i],
                  funding: _fundingIndex == i,
                  onFund: () => _fund(i),
                );
              }),
            ],
          ),
          LoadingOverlay(visible: _loading, message: 'Financiando…'),
        ],
      ),
    );
  }
}
