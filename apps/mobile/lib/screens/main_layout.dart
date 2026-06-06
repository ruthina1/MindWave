import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mindwave_mobile/screens/home_screen.dart';
import 'package:mindwave_mobile/screens/timeline_screen.dart';
import 'package:mindwave_mobile/screens/reports_screen.dart';
import 'package:mindwave_mobile/screens/sharing_screen.dart';
import 'package:mindwave_mobile/screens/chat_screen.dart';
import 'package:mindwave_mobile/theme/app_theme.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const TimelineScreen(),
    const ChatScreen(),
    const ReportsScreen(),
    const SharingScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppTheme.bgSecondary,
        selectedItemColor: AppTheme.accent,
        unselectedItemColor: AppTheme.textSecondary,
        items: const [
          BottomNavigationBarItem(icon: Icon(LucideIcons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.activity), label: 'Timeline'),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.bot), 
            label: 'AI Guide',
          ),
          BottomNavigationBarItem(icon: Icon(LucideIcons.fileText), label: 'Reports'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.share2), label: 'Sharing'),
        ],
      ),
    );
  }
}
