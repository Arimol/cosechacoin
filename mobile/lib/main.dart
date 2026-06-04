import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'config/constants.dart';
import 'screens/investor/boosters_screen.dart';
import 'screens/investor/invest_screen.dart';
import 'screens/investor/investor_home_screen.dart';
import 'screens/producer/producer_home_screen.dart';
import 'screens/producer/register_crop_screen.dart';
import 'screens/role_selection_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const CosechaCoinApp());
}

class CosechaCoinApp extends StatelessWidget {
  const CosechaCoinApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CosechaCoin',
      debugShowCheckedModeBanner: false,
      theme: _buildTheme(),
      initialRoute: routeRoleSelection,
      routes: {
        routeRoleSelection: (_) => const RoleSelectionScreen(),
        routeProducerHome: (_) => const ProducerHomeScreen(),
        routeRegisterCrop: (_) => const RegisterCropScreen(),
        routeInvestorHome: (_) => const InvestorHomeScreen(),
        routeInvest: (_) => const InvestScreen(),
        routeBoosters: (_) => const BoostersScreen(),
      },
    );
  }

  ThemeData _buildTheme() {
    const seed = colorAccent;
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: seed,
        primary: colorPrimaryDark,
        secondary: colorAccent,
        surface: colorBackground,
        onPrimary: Colors.white,
      ),
      scaffoldBackgroundColor: colorBackground,
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: colorBorderSubtle),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      fontFamily: 'Roboto',
    );
  }
}
