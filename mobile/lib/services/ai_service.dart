import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/constants.dart';

/// Cliente para el microservicio IA FastAPI (puerto 8000).
class AiService {
  AiService({String? baseUrl}) : _base = baseUrl ?? aiBaseUrl;

  final String _base;

  Map<String, String> get _headers {
    final h = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (aiApiKey.isNotEmpty) {
      h['X-Api-Key'] = aiApiKey;
    }
    return h;
  }

  /// POST /predict/yield
  Future<Map<String, dynamic>> predictYield({
    required String cropType,
    required String region,
    required double areaHectares,
  }) async {
    final res = await http.post(
      Uri.parse('$_base/predict/yield'),
      headers: _headers,
      body: jsonEncode({
        'crop_type': cropType,
        'region': region,
        'planted_area_hectares': areaHectares,
      }),
    );
    return _parseAiResponse(res);
  }

  /// POST /drone/analyze — reporte NDVI.
  Future<Map<String, dynamic>> analyzeDrone({
    required String cropType,
    required String region,
    int? boosterId,
  }) async {
    final res = await http.post(
      Uri.parse('$_base/drone/analyze'),
      headers: _headers,
      body: jsonEncode({
        'crop_type': cropType,
        'region': region,
        if (boosterId != null) 'booster_id': boosterId,
      }),
    );
    return _parseAiResponse(res);
  }

  Map<String, dynamic> _parseAiResponse(http.Response res) {
    Map<String, dynamic> body;
    try {
      body = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      throw AiException(
        'Respuesta inválida del servicio IA (${res.statusCode})',
      );
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (body['success'] == false) {
        throw AiException(
          body['error']?.toString() ?? 'Error en predicción IA',
        );
      }
      final data = body['data'];
      if (data is Map<String, dynamic>) return data;
      return body;
    }

    final detail = body['detail'] ?? body['error'] ?? res.body;
    throw AiException(detail.toString());
  }
}

class AiException implements Exception {
  AiException(this.message);
  final String message;

  @override
  String toString() => message;
}
