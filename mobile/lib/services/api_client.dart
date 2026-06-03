import 'dart:convert';
import 'package:http/http.dart' as http;

/// URL del backend. En emulador Android usa 10.0.2.2; en iOS simulador usa localhost.
const String kDefaultApiBase = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:4000',
);

class ApiClient {
  ApiClient({String? baseUrl}) : baseUrl = baseUrl ?? kDefaultApiBase;

  final String baseUrl;

  Future<Map<String, dynamic>> getHealth() async {
    final res = await http.get(Uri.parse('$baseUrl/api/health'));
    _ensureOk(res);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> predictYield({
    required String cropType,
    required String region,
    required double areaHectares,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/crops/predict-yield'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'crop_type': cropType,
        'region': region,
        'area_hectares': areaHectares,
      }),
    );
    _ensureOk(res);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getStellarConfig() async {
    final res = await http.get(Uri.parse('$baseUrl/api/stellar/config'));
    _ensureOk(res);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  void _ensureOk(http.Response res) {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception('API ${res.statusCode}: ${res.body}');
    }
  }
}
