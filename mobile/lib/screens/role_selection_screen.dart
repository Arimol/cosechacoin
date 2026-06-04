import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../widgets/primary_button.dart';

/// Pantalla inicial: el usuario elige rol Productor o Inversor.
class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: colorBackground,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            children: [
              Image.asset(
                'assets/images/logo_cosecha.png',
                height: 88,
                width: 88,
                fit: BoxFit.contain,
              ),
              const SizedBox(height: 20),
              const Text(
                'CosechaCoin',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: colorPrimaryDark,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Tokenización de cosechas en Stellar Soroban',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: colorTextSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 40),
              _RoleCard(
                icon: Icons.agriculture_outlined,
                title: 'Soy Productor',
                description:
                    'Registra tu cosecha, obtén predicción IA y tokeniza tu parcela en testnet.',
                onTap: () =>
                    Navigator.pushNamed(context, routeProducerHome),
              ),
              const SizedBox(height: 16),
              _RoleCard(
                icon: Icons.trending_up,
                title: 'Soy Inversor',
                description:
                    'Explora cosechas tokenizadas, invierte en tokens y financia impulsores.',
                onTap: () =>
                    Navigator.pushNamed(context, routeInvestorHome),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: colorBorderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: colorCardMint,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 32, color: colorAccent),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: colorTextPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                description,
                style: const TextStyle(
                  fontSize: 14,
                  color: colorTextSecondary,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Continuar',
                onPressed: onTap,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
