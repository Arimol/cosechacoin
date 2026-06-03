import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:cosechacoin_mobile/services/api_client.dart';

void main() {
  runApp(const CosechaCoinApp());
}

class CosechaCoinApp extends StatelessWidget {
  const CosechaCoinApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CosechaCoin',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4CAF50),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const FarmerHomePage(),
    );
  }
}

class FarmerHomePage extends StatefulWidget {
  const FarmerHomePage({super.key});

  @override
  State<FarmerHomePage> createState() => _FarmerHomePageState();
}

class _FarmerHomePageState extends State<FarmerHomePage> {
  final _api = ApiClient();
  final _regionController = TextEditingController(text: 'Huila');
  final _areaController = TextEditingController(text: '2.5');

  String _cropType = 'coffee';
  bool _loading = false;
  String? _error;
  Map<String, dynamic>? _health;
  Map<String, dynamic>? _prediction;
  Map<String, dynamic>? _stellar;

  @override
  void dispose() {
    _regionController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  Future<void> _loadHealth() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final health = await _api.getHealth();
      final stellar = await _api.getStellarConfig();
      setState(() {
        _health = health;
        _stellar = stellar;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _predict() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final area = double.parse(_areaController.text.replaceAll(',', '.'));
      final prediction = await _api.predictYield(
        cropType: _cropType,
        region: _regionController.text.trim(),
        areaHectares: area,
      );
      setState(() => _prediction = prediction);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CosechaCoin — Productor'),
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Tokeniza tu cosecha y accede a impulsores (drones NDVI, riego, semillas).',
            style: TextStyle(fontSize: 15),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _cropType,
            decoration: const InputDecoration(labelText: 'Cultivo'),
            items: const [
              DropdownMenuItem(value: 'coffee', child: Text('Café')),
              DropdownMenuItem(value: 'beans', child: Text('Frijoles')),
              DropdownMenuItem(value: 'cacao', child: Text('Cacao')),
            ],
            onChanged: (v) => setState(() => _cropType = v ?? 'coffee'),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _regionController,
            decoration: const InputDecoration(labelText: 'Región'),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _areaController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(labelText: 'Hectáreas'),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton(
                onPressed: _loading ? null : _predict,
                child: const Text('Predecir rendimiento'),
              ),
              OutlinedButton(
                onPressed: _loading ? null : _loadHealth,
                child: const Text('Estado API / Stellar'),
              ),
            ],
          ),
          if (_loading) const LinearProgressIndicator(),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          if (_prediction != null) _JsonCard(title: 'Predicción', data: _prediction!),
          if (_health != null) _JsonCard(title: 'Salud del sistema', data: _health!),
          if (_stellar != null) _JsonCard(title: 'Stellar', data: _stellar!),
        ],
      ),
    );
  }
}

class _JsonCard extends StatelessWidget {
  const _JsonCard({required this.title, required this.data});

  final String title;
  final Map<String, dynamic> data;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(top: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            SelectableText(
              JsonEncoder.withIndent('  ').convert(data),
              style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
