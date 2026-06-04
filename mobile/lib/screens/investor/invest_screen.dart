import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../config/constants.dart';
import '../../models/crop.dart';
import '../../services/api_service.dart';
import '../../widgets/loading_overlay.dart';
import '../../widgets/primary_button.dart';

/// Pantalla de inversión en tokens de una cosecha.
class InvestScreen extends StatefulWidget {
  const InvestScreen({super.key});

  @override
  State<InvestScreen> createState() => _InvestScreenState();
}

class _InvestScreenState extends State<InvestScreen> {
  final _api = ApiService();
  final _amountCtrl = TextEditingController(text: '10');
  final _secretCtrl = TextEditingController(text: demoInvestorSecret);
  bool _loading = false;
  String? _txHash;
  late Crop _crop;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _crop = ModalRoute.of(context)!.settings.arguments as Crop;
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    _secretCtrl.dispose();
    super.dispose();
  }

  int get _amount => int.tryParse(_amountCtrl.text.trim()) ?? 0;

  double get _totalUsdc => _amount * _crop.pricePerToken;

  Future<void> _confirm() async {
    final amount = _amount;
    if (amount <= 0) {
      _snack('Ingrese una cantidad válida de tokens');
      return;
    }
    if (amount > _crop.tokensAvailable) {
      _snack('No hay suficientes tokens disponibles');
      return;
    }
    if (_secretCtrl.text.trim().length < 56) {
      _snack('La clave secreta del inversor debe tener al menos 56 caracteres');
      return;
    }

    setState(() {
      _loading = true;
      _txHash = null;
    });
    try {
      final result = await _api.investInCrop(
        investorSecret: _secretCtrl.text.trim(),
        amount: amount,
      );
      final data = result['data'];
      final hash = data is Map
          ? (data['hash'] ?? data['txHash'] ?? data['transactionHash'])
              ?.toString()
          : null;
      setState(() => _txHash = hash ?? data?.toString());
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Inversión registrada en Stellar testnet')),
      );
    } on ApiException catch (e) {
      _snack(e.message);
    } catch (e) {
      _snack('Error al invertir: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red.shade800),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: colorBackground,
      appBar: AppBar(
        title: const Text('Invertir'),
        backgroundColor: colorPrimaryDark,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          ListView(
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
                    Text(
                      _crop.cropName,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: colorTextPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${_crop.region} · ${_crop.farmer}',
                      style: const TextStyle(color: colorTextSecondary),
                    ),
                    const Divider(height: 24),
                    _row('Tokens disponibles', '${_crop.tokensAvailable}'),
                    _row('Precio por token', _crop.displayPrice),
                    _row('Cosecha estimada', _crop.harvestDate),
                    _row('Estado', _crop.status),
                    if (_crop.projectedYield != null)
                      _row(
                        'Rendimiento proyectado',
                        '${_crop.projectedYield!.toStringAsFixed(1)}%',
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _amountCtrl,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  labelText: 'Cantidad de tokens',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colorCardMint,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Total: \$${_totalUsdc.toStringAsFixed(2)} USDC',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: colorPrimaryDark,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _secretCtrl,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Clave secreta inversor (testnet)',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  helperText: 'Solo para pruebas en testnet',
                ),
              ),
              if (_txHash != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: colorAccent),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: SelectableText(
                    'Hash: $_txHash',
                    style: const TextStyle(
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: colorTextPrimary,
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 24),
              PrimaryButton(
                label: 'Confirmar inversión',
                onPressed: _loading ? null : _confirm,
                enabled: !_loading,
              ),
            ],
          ),
          LoadingOverlay(visible: _loading, message: 'Enviando transacción…'),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: colorTextSecondary)),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
