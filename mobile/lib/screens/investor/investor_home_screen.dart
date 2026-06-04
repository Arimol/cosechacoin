import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/constants.dart';
import '../../data/mock_data.dart';
import '../../models/crop.dart';
import '../../services/api_service.dart';
import '../../widgets/crop_card.dart';
import '../../widgets/loading_overlay.dart';

/// Marketplace de cosechas para inversores.
class InvestorHomeScreen extends StatefulWidget {
  const InvestorHomeScreen({super.key});

  @override
  State<InvestorHomeScreen> createState() => _InvestorHomeScreenState();
}

class _InvestorHomeScreenState extends State<InvestorHomeScreen> {
  final _api = ApiService();
  bool _loading = true;
  bool _usingMock = false;
  List<Crop> _crops = MockData.crops;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await _api.fetchMarketplaceCrops(fallback: MockData.crops);
      _crops = list;
      _usingMock = list.length == MockData.crops.length &&
          await _api.getCropInfo() == null;
    } catch (_) {
      _crops = MockData.crops;
      _usingMock = true;
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openStellar() async {
    final url = Uri.parse(_api.stellarContractUrl(cropTokenContractId));
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo abrir el explorador Stellar')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: colorBackground,
      appBar: AppBar(
        title: const Text('Marketplace'),
        backgroundColor: colorPrimaryDark,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              Navigator.pushNamedAndRemoveUntil(context, routeRoleSelection, (_) => false),
        ),
        actions: [
          IconButton(
            tooltip: 'Impulsores',
            icon: const Icon(Icons.bolt_outlined),
            onPressed: () => Navigator.pushNamed(context, routeBoosters),
          ),
        ],
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: _load,
            color: colorAccent,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                if (_usingMock)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: colorCardMint,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: colorBorderSubtle),
                    ),
                    child: const Text(
                      'Mostrando datos de demostración. Conecte el backend en el puerto 4000.',
                      style: TextStyle(fontSize: 13, color: colorTextSecondary),
                    ),
                  ),
                const Text(
                  'Cosechas disponibles',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: colorTextPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                ..._crops.map(
                  (crop) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: CropCard(
                      crop: crop,
                      onTap: () => Navigator.pushNamed(
                        context,
                        routeInvest,
                        arguments: crop,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: _openStellar,
                  icon: const Icon(Icons.open_in_new, size: 18),
                  label: const Text('Ver en Stellar'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: colorAccent,
                    side: const BorderSide(color: colorAccent),
                    padding: const EdgeInsets.symmetric(vertical: 14),
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
