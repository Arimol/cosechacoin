import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/constants.dart';
import '../models/booster.dart';
import '../models/crop.dart';

/// Cliente HTTP para el backend Node (puerto 4000).
class ApiService {
  ApiService({String? baseUrl}) : _base = baseUrl ?? apiBaseUrl;

  final String _base;

  Map<String, String> get _jsonHeaders => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  Future<Map<String, dynamic>> getHealth() async {
    final res = await http.get(Uri.parse('$_base/api/health'));
    return _parseResponse(res);
  }

  /// GET /api/crops/info — null si falla o sin datos.
  Future<Crop?> getCropInfo() async {
    try {
      final res = await http.get(Uri.parse('$_base/api/crops/info'));
      final body = _parseResponse(res);
      final data = body['data'];
      if (data is Map<String, dynamic>) {
        return Crop.fromApi(data);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Lista de cosechas: una on-chain + mock si hace falta.
  Future<List<Crop>> fetchMarketplaceCrops({
    required List<Crop> fallback,
  }) async {
    final onChain = await getCropInfo();
    if (onChain != null) {
      return [onChain, ...fallback.where((c) => c.id != onChain.id)];
    }
    return fallback;
  }

  Future<Map<String, dynamic>> initializeCrop({
    required String cropName,
    required String farmerPublicKey,
    required int totalTokens,
    required double pricePerToken,
    required int harvestDateUnix,
  }) async {
    final res = await http.post(
      Uri.parse('$_base/api/crops/initialize'),
      headers: _jsonHeaders,
      body: jsonEncode({
        'crop_name': cropName,
        'farmer_public_key': farmerPublicKey,
        'total_tokens': totalTokens,
        'price_per_token': pricePerToken.toString(),
        'harvest_date': harvestDateUnix,
      }),
    );
    return _parseResponse(res);
  }

  Future<Map<String, dynamic>> investInCrop({
    required String investorSecret,
    required int amount,
  }) async {
    final res = await http.post(
      Uri.parse('$_base/api/crops/invest'),
      headers: _jsonHeaders,
      body: jsonEncode({
        'investor_secret': investorSecret,
        'amount': amount,
      }),
    );
    return _parseResponse(res);
  }

  Future<Map<String, dynamic>> fundBooster({
    required String investorSecret,
    required String boosterType,
    required double amount,
    required String providerPublicKey,
  }) async {
    final res = await http.post(
      Uri.parse('$_base/api/boosters/fund'),
      headers: _jsonHeaders,
      body: jsonEncode({
        'investor_secret': investorSecret,
        'booster_type': boosterType,
        'amount': amount.toString(),
        'provider_public_key': providerPublicKey,
      }),
    );
    return _parseResponse(res);
  }

  Future<List<Booster>> listBoosters() async {
    try {
      final res = await http.get(Uri.parse('$_base/api/boosters/list'));
      final body = _parseResponse(res);
      final data = body['data'];
      if (data is Map<String, dynamic>) {
        final list = data['boosters'];
        if (list is List) {
          return list
              .whereType<Map<String, dynamic>>()
              .map(Booster.fromApi)
              .toList();
        }
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  String stellarContractUrl(String contractId) =>
      '$stellarExplorerBase/$contractId';

  Map<String, dynamic> _parseResponse(http.Response res) {
    Map<String, dynamic> body;
    try {
      body = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      throw ApiException(
        'Respuesta inválida del servidor (${res.statusCode})',
      );
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (body['success'] == false) {
        throw ApiException(
          body['error']?.toString() ?? 'Error desconocido',
        );
      }
      return body;
    }

    throw ApiException(
      body['error']?.toString() ??
          'Error HTTP ${res.statusCode}: ${res.body}',
    );
  }
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}
