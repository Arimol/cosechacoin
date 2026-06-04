import 'package:flutter/material.dart';

import '../config/constants.dart';

/// Métrica con valor destacado y etiqueta.
class MetricCard extends StatelessWidget {
  const MetricCard({
    super.key,
    required this.label,
    required this.value,
    this.hint,
  });

  final String label;
  final String value;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorCardMint,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colorBorderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: colorTextSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: colorPrimaryDark,
              height: 1.1,
            ),
          ),
          if (hint != null) ...[
            const SizedBox(height: 4),
            Text(
              hint!,
              style: const TextStyle(
                fontSize: 12,
                color: colorTextSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
