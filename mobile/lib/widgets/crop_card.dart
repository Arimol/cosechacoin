import 'package:flutter/material.dart';

import '../config/constants.dart';
import '../models/crop.dart';

/// Tarjeta de cosecha para el marketplace del inversor.
class CropCard extends StatelessWidget {
  const CropCard({
    super.key,
    required this.crop,
    required this.onTap,
    this.compact = false,
  });

  final Crop crop;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: colorBorderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      crop.cropName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: colorTextPrimary,
                      ),
                    ),
                  ),
                  _StatusChip(status: crop.status),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                crop.region,
                style: const TextStyle(
                  fontSize: 14,
                  color: colorTextSecondary,
                ),
              ),
              if (!compact) ...[
                const SizedBox(height: 8),
                Text(
                  'Productor: ${crop.farmer}',
                  style: const TextStyle(
                    fontSize: 13,
                    color: colorTextSecondary,
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  _InfoChip(
                    label: 'Disponibles',
                    value: '${crop.tokensAvailable}',
                  ),
                  const SizedBox(width: 12),
                  _InfoChip(
                    label: 'Precio',
                    value: crop.displayPrice,
                  ),
                ],
              ),
              if (crop.projectedYield != null) ...[
                const SizedBox(height: 10),
                Text(
                  'Rendimiento proyectado: ${crop.projectedYield!.toStringAsFixed(1)}%',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: colorAccent,
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Invertir',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: colorAccent.withValues(alpha: 0.95),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 14,
                    color: colorAccent.withValues(alpha: 0.95),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final isActive = status.toLowerCase().contains('activ');
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? colorCardMint : colorBackground,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: colorBorderSubtle),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: isActive ? colorAccent : colorTextSecondary,
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: colorTextSecondary),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: colorTextPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
