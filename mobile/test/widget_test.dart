import 'package:flutter_test/flutter_test.dart';
import 'package:cosechacoin_mobile/main.dart';

void main() {
  testWidgets('Muestra selección de rol', (WidgetTester tester) async {
    await tester.pumpWidget(const CosechaCoinApp());
    expect(find.text('CosechaCoin'), findsOneWidget);
    expect(find.text('Soy Productor'), findsOneWidget);
    expect(find.text('Soy Inversor'), findsOneWidget);
  });
}
