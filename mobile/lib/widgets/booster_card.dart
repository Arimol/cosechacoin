import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../models/booster.dart';
import 'primary_button.dart';

/// Tarjeta de impulsor agrícola.
class BoosterCard extends StatelessWidget {
  const BoosterCard({
    super.key,
    required this.booster,
    required this.onFund,
    this.funding = false,
  });

  final Booster booster;
  final VoidCallback? onFund;
  final bool funding;

  IconData get _icon {
    switch (booster.apiType) {
      case 'smart_irrigation':
        return Icons.water_drop_outlined;
      case 'certified_seeds':
        return Icons.grass_outlined;
      case 'iot_sensors':
        return Icons.sensors_outlined;
      case 'organic_certification':
        return Icons.verified_outlined;
      case 'drone_ndvi':
      default:
        return Icons.flight_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colorBorderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: colorCardMint,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(_icon, color: colorAccent, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      booster.title,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: colorTextPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '\$${booster.amountUsdc.toStringAsFixed(0)} USDC',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: colorAccent,
                      ),
                    ),
                  ],
                ),
              ),
              if (booster.status.isNotEmpty)
                Text(
                  booster.status,
                  style: const TextStyle(
                    fontSize: 12,
                    color: colorTextSecondary,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            booster.description,
            style: const TextStyle(
              fontSize: 14,
              color: colorTextSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            booster.benefit,
            style: const TextStyle(
              fontSize: 13,
              color: colorPrimaryDark,
              fontWeight: FontWeight.w500,
              height: 1.35,
            ),
          ),
          if (booster.parcel != null) ...[
            const SizedBox(height: 8),
            Text(
              booster.parcel!,
              style: const TextStyle(fontSize: 12, color: colorTextSecondary),
            ),
          ],
          const SizedBox(height: 16),
          PrimaryButton(
            label: funding ? 'Procesando…' : 'Financiar impulsor',
            onPressed: funding ? null : onFund,
            enabled: !funding && onFund != null,
          ),
        ],
      ),
    );
  }
}
