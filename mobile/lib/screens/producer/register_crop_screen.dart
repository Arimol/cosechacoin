import 'package:flutter/material.dart';

import '../../config/constants.dart';
import '../../services/ai_service.dart';
import '../../services/api_service.dart';
import '../../widgets/loading_overlay.dart';
import '../../widgets/primary_button.dart';

/// Formulario de registro y tokenización de cosecha.
class RegisterCropScreen extends StatefulWidget {
  const RegisterCropScreen({super.key});

  @override
  State<RegisterCropScreen> createState() => _RegisterCropScreenState();
}

class _RegisterCropScreenState extends State<RegisterCropScreen> {
  final _formKey = GlobalKey<FormState>();
  final _api = ApiService();
  final _ai = AiService();
  final _areaCtrl = TextEditingController(text: '2.5');
  final _tokensCtrl = TextEditingController(text: '1000');
  final _priceCtrl = TextEditingController(text: '2.5');
  final _farmerKeyCtrl = TextEditingController(text: demoFarmerPublicKey);

  String _crop = cropOptions.first;
  String _region = regionOptions.first;
  DateTime _harvestDate = DateTime.now().add(const Duration(days: 90));
  bool _loading = false;
  Map<String, dynamic>? _prediction;

  @override
  void dispose() {
    _areaCtrl.dispose();
    _tokensCtrl.dispose();
    _priceCtrl.dispose();
    _farmerKeyCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _harvestDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 730)),
    );
    if (picked != null) setState(() => _harvestDate = picked);
  }

  Future<void> _predict() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _prediction = null;
    });
    try {
      final area = double.parse(_areaCtrl.text.replaceAll(',', '.'));
      final cropApi = cropToApiType[_crop] ?? 'cafe';
      final data = await _ai.predictYield(
        cropType: cropApi,
        region: _region,
        areaHectares: area,
      );
      setState(() => _prediction = data);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Predicción IA obtenida')),
      );
    } on AiException catch (e) {
      _showError(e.message);
    } catch (e) {
      _showError('No se pudo conectar al servicio IA: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _tokenize() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final tokens = int.parse(_tokensCtrl.text.trim());
      final price = double.parse(_priceCtrl.text.replaceAll(',', '.'));
      final harvestUnix = _harvestDate.millisecondsSinceEpoch ~/ 1000;
      final result = await _api.initializeCrop(
        cropName: '$_crop · $_region',
        farmerPublicKey: _farmerKeyCtrl.text.trim(),
        totalTokens: tokens,
        pricePerToken: price,
        harvestDateUnix: harvestUnix,
      );
      if (!mounted) return;
      final tx = result['data']?['hash'] ??
          result['data']?['txHash'] ??
          result['data']?.toString();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            tx != null
                ? 'Cosecha tokenizada. Tx: $tx'
                : 'Cosecha tokenizada correctamente',
          ),
        ),
      );
      Navigator.pop(context);
    } on ApiException catch (e) {
      _showError(e.message);
    } catch (e) {
      _showError('Error al tokenizar: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String msg) {
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
        title: const Text('Registrar cosecha'),
        backgroundColor: colorPrimaryDark,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _dropdown(
                  label: 'Cultivo',
                  value: _crop,
                  items: cropOptions,
                  onChanged: (v) => setState(() => _crop = v!),
                ),
                const SizedBox(height: 16),
                _dropdown(
                  label: 'Región',
                  value: _region,
                  items: regionOptions,
                  onChanged: (v) => setState(() => _region = v!),
                ),
                const SizedBox(height: 16),
                _field(
                  controller: _areaCtrl,
                  label: 'Área (hectáreas)',
                  keyboard: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) {
                    final n = double.tryParse(v?.replaceAll(',', '.') ?? '');
                    if (n == null || n <= 0) return 'Ingrese un área válida';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                _field(
                  controller: _tokensCtrl,
                  label: 'Total de tokens a emitir',
                  keyboard: TextInputType.number,
                  validator: (v) {
                    final n = int.tryParse(v?.trim() ?? '');
                    if (n == null || n <= 0) return 'Cantidad de tokens inválida';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                _field(
                  controller: _priceCtrl,
                  label: 'Precio por token (USDC)',
                  keyboard: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) {
                    final n = double.tryParse(v?.replaceAll(',', '.') ?? '');
                    if (n == null || n <= 0) return 'Precio inválido';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text(
                    'Fecha estimada de cosecha',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: colorTextSecondary,
                    ),
                  ),
                  subtitle: Text(
                    '${_harvestDate.day}/${_harvestDate.month}/${_harvestDate.year}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: colorTextPrimary,
                    ),
                  ),
                  trailing: const Icon(Icons.calendar_today_outlined),
                  onTap: _pickDate,
                ),
                const SizedBox(height: 16),
                _field(
                  controller: _farmerKeyCtrl,
                  label: 'Clave pública Stellar del productor',
                  validator: (v) {
                    if (v == null || v.trim().length != 56) {
                      return 'La clave pública debe tener 56 caracteres';
                    }
                    return null;
                  },
                ),
                if (_prediction != null) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: colorCardMint,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: colorBorderSubtle),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Predicción IA',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: colorPrimaryDark,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Rendimiento proyectado: ${_prediction!['yield_percentage'] ?? '—'}%',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _prediction!['recommendation']?.toString() ??
                              'Sin recomendación',
                          style: const TextStyle(
                            fontSize: 14,
                            color: colorTextSecondary,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                PrimaryButton(
                  label: 'Obtener predicción IA',
                  outlined: true,
                  onPressed: _loading ? null : _predict,
                  enabled: !_loading,
                ),
                const SizedBox(height: 12),
                PrimaryButton(
                  label: 'Tokenizar cosecha',
                  onPressed: _loading ? null : _tokenize,
                  enabled: !_loading,
                ),
              ],
            ),
          ),
          LoadingOverlay(
            visible: _loading,
            message: 'Procesando…',
          ),
        ],
      ),
    );
  }

  Widget _dropdown({
    required String label,
    required String value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      items: items
          .map((e) => DropdownMenuItem(value: e, child: Text(e)))
          .toList(),
      onChanged: onChanged,
    );
  }

  Widget _field({
    required TextEditingController controller,
    required String label,
    TextInputType? keyboard,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboard,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
