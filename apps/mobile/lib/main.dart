import 'package:flutter/material.dart';
import 'package:mindwave_mobile/theme/app_theme.dart';
import 'package:mindwave_mobile/screens/main_layout.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  runApp(const MindWaveApp());
}

class MindWaveApp extends StatelessWidget {
  const MindWaveApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MindWave',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: const MainLayout(),
    );
  }
}
