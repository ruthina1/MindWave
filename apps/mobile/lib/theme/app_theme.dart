import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Calm Light Colors
  static const Color bgPrimary = Color(0xFFF8FAFC);   // slate 50
  static const Color bgSecondary = Color(0xFFFFFFFF); // white
  static const Color bgTertiary = Color(0xFFF1F5F9);  // slate 100
  
  static const Color accent = Color(0xFF4F46E5);      // calm indigo
  static const Color accentGlow = Color(0xFFEEF2F6);  // soft slate glow
  
  static const Color textPrimary = Color(0xFF0F172A);  // slate 900
  static const Color textSecondary = Color(0xFF64748B); // slate 500
  
  // Softer Calming Emotion Colors
  static const Color calm = Color(0xFF10B981);      // Emerald green
  static const Color stressed = Color(0xFFF59E0B);  // Amber warm yellow
  static const Color anxious = Color(0xFFEF4444);   // Coral red
  static const Color depressed = Color(0xFF8B5CF6); // Soft purple
  static const Color angry = Color(0xFFEC4899);     // Soft pink

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: bgPrimary,
      primaryColor: accent,
      canvasColor: bgSecondary,
      cardColor: bgSecondary,
      dialogBackgroundColor: bgSecondary,
      dividerColor: bgTertiary,
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
        displayLarge: GoogleFonts.inter(color: textPrimary, fontWeight: FontWeight.bold),
        bodyLarge: GoogleFonts.inter(color: textPrimary),
        bodyMedium: GoogleFonts.inter(color: textSecondary),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgPrimary,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textPrimary),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgSecondary,
        selectedItemColor: accent,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  static Color getColorForState(String state) {
    switch (state.toUpperCase()) {
      case 'CALM': return calm;
      case 'STRESSED': return stressed;
      case 'ANXIOUS': return anxious;
      case 'DEPRESSED': return depressed;
      case 'ANGRY': return angry;
      default: return textSecondary;
    }
  }

  static String getEmojiForState(String state) {
    switch (state.toUpperCase()) {
      case 'CALM': return '😌';
      case 'STRESSED': return '😰';
      case 'ANXIOUS': return '😟';
      case 'DEPRESSED': return '😔';
      case 'ANGRY': return '😡';
      default: return '😶';
    }
  }
}
