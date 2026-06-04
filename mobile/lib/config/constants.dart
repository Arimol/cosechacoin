import 'package:flutter/material.dart';

/// URL del backend Node (puerto 4000).
/// Emulador Android: 10.0.2.2 | Dispositivo físico: IP de tu PC.
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:4000',
);

/// Microservicio IA FastAPI (puerto 8000).
const String aiBaseUrl = String.fromEnvironment(
  'AI_BASE_URL',
  defaultValue: 'http://10.0.2.2:8000',
);

/// Clave opcional del servicio IA (vacío si no está configurada en el servidor).
const String aiApiKey = String.fromEnvironment(
  'AI_API_KEY',
  defaultValue: '',
);

/// Contratos Soroban testnet (alineados con backend .env).
const String cropTokenContractId =
    'CACA6KZBXCRY53TEZGOHVYGCBJ6T7D5U2ILC6PYPM4OVUXADKH67PPCQ';
const String boosterContractId =
    'CCLA6DMWBHUHUEFMBSMKYSZDZ723NAMYJZEJKRQ73U6WRSNC6WZOSJCN';

const String stellarExplorerBase =
    'https://stellar.expert/explorer/testnet/contract';

/// Claves de demostración testnet — reemplazar en producción.
/// Claves demo testnet (56 caracteres — reemplazar con cuentas reales).
const String demoFarmerPublicKey = String.fromEnvironment(
  'DEMO_FARMER_PUBLIC_KEY',
  defaultValue:
      'GCOSECHACOINMOBILEDEMOFARMERPUBLICKEYTESTNET000000000000',
);
const String demoInvestorSecret = String.fromEnvironment(
  'DEMO_INVESTOR_SECRET',
  defaultValue:
      'SCOSECHACOINMOBILEDEMOINVESTORSECRETTESTNET0000000000000',
);
const String demoProviderPublicKey = String.fromEnvironment(
  'DEMO_PROVIDER_PUBLIC_KEY',
  defaultValue:
      'GCOSECHACOINMOBILEDEMOPROVIDERPUBLICKEYTESTNET00000000000',
);

// —— Paleta CosechaCoin ——
const Color colorPrimaryDark = Color(0xFF1A3C2E);
const Color colorAccent = Color(0xFF2D6A4F);
const Color colorCardMint = Color(0xFFF0F7F4);
const Color colorBackground = Color(0xFFF8F6F1);
const Color colorTextPrimary = Color(0xFF1A1A1A);
const Color colorTextSecondary = Color(0xFF6B7280);
const Color colorBorderSubtle = Color(0xFFE5E7EB);

// —— Rutas ——
const String routeRoleSelection = '/';
const String routeProducerHome = '/producer/home';
const String routeRegisterCrop = '/producer/register';
const String routeInvestorHome = '/investor/home';
const String routeInvest = '/investor/invest';
const String routeBoosters = '/investor/boosters';

// —— Cultivos y regiones ——
const List<String> cropOptions = ['Café', 'Frijol', 'Cacao', 'Maíz'];
const List<String> regionOptions = [
  'Tarrazú',
  'Brunca',
  'Limón',
  'Guanacaste',
  'Cartago',
];

const Map<String, String> cropToApiType = {
  'Café': 'cafe',
  'Frijol': 'frijol',
  'Cacao': 'cacao',
  'Maíz': 'maiz',
};

/// Tipos de impulsor para POST /api/boosters/fund
const Map<String, String> boosterTypeApi = {
  'Dron NDVI': 'drone_ndvi',
  'Riego inteligente': 'smart_irrigation',
  'Semillas certificadas': 'certified_seeds',
  'Sensores IoT': 'iot_sensors',
  'Certificación orgánica': 'organic_certification',
};
