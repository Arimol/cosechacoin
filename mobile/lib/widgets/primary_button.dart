import 'package:flutter/material.dart';

import '../config/constants.dart';

/// Botón principal de la marca CosechaCoin.
class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.enabled = true,
    this.outlined = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool enabled;
  final bool outlined;

  @override
  Widget build(BuildContext context) {
    final child = Text(
      label,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
      ),
    );

    if (outlined) {
      return SizedBox(
        width: double.infinity,
        height: 48,
        child: OutlinedButton(
          onPressed: enabled ? onPressed : null,
          style: OutlinedButton.styleFrom(
            foregroundColor: colorPrimaryDark,
            side: const BorderSide(color: colorAccent, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: child,
        ),
      );
    }

    return SizedBox(
      width: double.infinity,
      height: 48,
      child: FilledButton(
        onPressed: enabled ? onPressed : null,
        style: FilledButton.styleFrom(
          backgroundColor: colorAccent,
          disabledBackgroundColor: colorBorderSubtle,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: child,
      ),
    );
  }
}
