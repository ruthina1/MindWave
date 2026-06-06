import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mindwave_mobile/theme/app_theme.dart';
import 'package:mindwave_mobile/services/api_service.dart';
import 'package:mindwave_mobile/screens/device_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _api = ApiService();
  Timer? _timer;
  
  String _currentState = 'CALM';
  int _currentSeverity = 2;
  bool _isLoading = true;

  // Dynamic summary stats
  double _avgSeverity = 3.2;
  int _stressEpisodes = 2;
  int _interventions = 3;
  String _calmTime = '6h 20m';

  @override
  void initState() {
    super.initState();
    _fetchReading();
    _fetchSummary();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      _fetchReading();
      _fetchSummary();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchReading() async {
    final reading = await _api.getCurrentReading();
    if (mounted) {
      setState(() {
        _currentState = reading['state'] ?? 'CALM';
        _currentSeverity = reading['severity'] ?? 2;
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchSummary() async {
    final reports = await _api.getReports();
    if (reports.isNotEmpty && mounted) {
      final latestReport = reports[0];
      setState(() {
        _avgSeverity = (latestReport['avgSeverity'] as num?)?.toDouble() ?? 3.2;
        _stressEpisodes = (latestReport['episodes'] as num?)?.toInt() ?? 2;
        _interventions = _stressEpisodes + 1;
        _calmTime = '${12 - _stressEpisodes}h 20m';
      });
    }
  }

  String _formatTodayDate() {
    final now = DateTime.now();
    final weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    final months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    final weekday = weekdays[now.weekday - 1];
    final month = months[now.month - 1];
    return '$weekday, $month ${now.day}';
  }

  String _formatSummaryDate() {
    final now = DateTime.now();
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[now.month - 1]} ${now.day}, ${now.year}';
  }

  IconData _getIconForState(String state) {
    switch (state) {
      case 'CALM': return LucideIcons.smile;
      case 'STRESSED': return LucideIcons.frown;
      case 'ANXIOUS': return LucideIcons.alertTriangle;
      case 'DEPRESSED': return LucideIcons.cloudRain;
      case 'ANGRY': return LucideIcons.flame;
      default: return LucideIcons.activity;
    }
  }

  @override
  Widget build(BuildContext context) {
    Color stateColor = AppTheme.getColorForState(_currentState);

    return Scaffold(
      appBar: AppBar(
        title: const Text('MindWave', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: -0.5)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.headphones),
            tooltip: 'BCI Headset Controller',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const DeviceScreen()),
              );
            },
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0, left: 8.0),
            child: CircleAvatar(
              backgroundColor: AppTheme.bgTertiary,
              child: const Icon(LucideIcons.user, color: AppTheme.textPrimary, size: 20),
            ),
          )
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppTheme.accent))
        : RefreshIndicator(
            onRefresh: () async {
              await _fetchReading();
              await _fetchSummary();
            },
            color: AppTheme.accent,
            backgroundColor: AppTheme.bgSecondary,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text(
                  'Good morning, Abenezer',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: -0.5),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatTodayDate(),
                  style: TextStyle(fontSize: 13, color: AppTheme.textSecondary, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  'Your real-time emotional state',
                  style: TextStyle(fontSize: 12, color: AppTheme.textSecondary.withValues(alpha: 0.8), fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 28),
                
                // Premium Dynamic Emotion Severity Gauge
                Center(
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.bgSecondary,
                      boxShadow: [
                        BoxShadow(
                          color: stateColor.withValues(alpha: 0.1),
                          blurRadius: 40,
                          spreadRadius: 5,
                        )
                      ],
                    ),
                    child: CustomPaint(
                      painter: SeverityGaugePainter(
                        severity: _currentSeverity,
                        color: stateColor,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(_getIconForState(_currentState), size: 36, color: stateColor),
                          const SizedBox(height: 12),
                          Text(
                            _currentState,
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.5,
                              color: stateColor,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: stateColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              'Severity: $_currentSeverity/10',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: stateColor),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Premium Dynamic Summary Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.bgSecondary,
                    borderRadius: BorderRadius.circular(24),
                    // No border line to follow clean flat-panel design guidelines
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(LucideIcons.calendar, size: 18, color: AppTheme.accent),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Summary - ${_formatSummaryDate()}',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _buildSummaryRow(LucideIcons.barChart2, 'Avg Severity', _avgSeverity.toStringAsFixed(1), AppTheme.accent),
                      _buildSummaryRow(LucideIcons.activity, 'Stress Episodes', _stressEpisodes.toString(), AppTheme.stressed),
                      _buildSummaryRow(LucideIcons.music, 'Interventions', _interventions.toString(), AppTheme.calm),
                      _buildSummaryRow(LucideIcons.clock, 'Calm Time', _calmTime, AppTheme.textPrimary),
                    ],
                  ),
                )
              ],
            ),
          ),
    );
  }

  Widget _buildSummaryRow(IconData icon, String label, String value, Color iconColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.bgTertiary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 15, color: iconColor),
          ),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.textSecondary)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

// Circular progress gauge custom painter for severity
class SeverityGaugePainter extends CustomPainter {
  final int severity;
  final Color color;

  SeverityGaugePainter({required this.severity, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 12;

    final backgroundPaint = Paint()
      ..color = AppTheme.bgTertiary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6.0;

    final foregroundPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8.0
      ..strokeCap = StrokeCap.round;

    // Draw track circle
    canvas.drawCircle(center, radius, backgroundPaint);

    // Draw progress sweep arc based on severity (max 10 scale)
    final double sweepAngle = (math.max(1, math.min(10, severity)) / 10.0) * 2 * math.pi;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2, // 12 o'clock start
      sweepAngle,
      false,
      foregroundPaint,
    );
  }

  @override
  bool shouldRepaint(covariant SeverityGaugePainter oldDelegate) {
    return oldDelegate.severity != severity || oldDelegate.color != color;
  }
}
