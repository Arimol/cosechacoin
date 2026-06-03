import 'package:flutter_test/flutter_test.dart';
import 'package:cosechacoin_mobile/main.dart';

void main() {
  testWidgets('Muestra pantalla de productor', (WidgetTester tester) async {
    await tester.pumpWidget(const CosechaCoinApp());
    expect(find.text('CosechaCoin — Productor'), findsOneWidget);
    expect(find.text('Predecir rendimiento'), findsOneWidget);
  });
}
