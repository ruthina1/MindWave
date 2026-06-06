import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mindwave_mobile/theme/app_theme.dart';
import 'package:mindwave_mobile/services/api_service.dart';

class DeviceScreen extends StatefulWidget {
  const DeviceScreen({super.key});

  @override
  State<DeviceScreen> createState() => _DeviceScreenState();
}

class _DeviceScreenState extends State<DeviceScreen> with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();
  late AnimationController _waveController;
  
  bool _isConnected = false;
  bool _isConnecting = false;
  double _batteryLevel = 0.85;
  
  String _selectedState = 'CALM';
  int _selectedSeverity = 2;
  bool _isSyncing = false;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _waveController.dispose();
    super.dispose();
  }

  void _toggleConnection() async {
    if (_isConnected) {
      setState(() {
        _isConnected = false;
      });
    } else {
      setState(() {
        _isConnecting = true;
      });
      // Mock Bluetooth pairing delay
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() {
          _isConnecting = false;
          _isConnected = true;
        });
      }
    }
  }

  void _syncTelemetry() async {
    setState(() => _isSyncing = true);
    final success = await _api.updateCurrentReading(_selectedState, _selectedSeverity);
    if (mounted) {
      setState(() => _isSyncing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success ? 'BCI Telemetry synced to cloud!' : 'Sync failed. Check API connection.',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          backgroundColor: success ? AppTheme.calm : AppTheme.angry,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    Color stateColor = AppTheme.getColorForState(_selectedState);

    return Scaffold(
      appBar: AppBar(
        title: const Text('BCI Headset Controller', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: -0.5)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Headset Connection Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.bgSecondary,
              borderRadius: BorderRadius.circular(20),
              // No border line
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: _isConnected ? AppTheme.calm.withValues(alpha: 0.1) : AppTheme.bgTertiary,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _isConnected ? LucideIcons.headphones : LucideIcons.alertTriangle,
                        color: _isConnected ? AppTheme.calm : AppTheme.textSecondary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isConnected ? 'MindWave BCI Headset' : 'Headset Disconnected',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _isConnected ? 'Connected via BLE • Battery ${_batteryLevel * 100}%' : 'Simulating device offline mode',
                            style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                ElevatedButton(
                  onPressed: _isConnecting ? null : _toggleConnection,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isConnected ? AppTheme.bgTertiary : AppTheme.accent,
                    foregroundColor: _isConnected ? AppTheme.textPrimary : Colors.white,
                    minimumSize: const Size(double.infinity, 40),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isConnecting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Text(
                          _isConnected ? 'Disconnect Device' : 'Pair & Connect Headset',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),

          // Sensor Contact Check (Only if connected)
          if (_isConnected) ...[
            const Text('Electrode Contact Quality', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.bgSecondary,
                borderRadius: BorderRadius.circular(16),
                // No border line
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildElectrodeStatus('FP1', 'Frontal L', true),
                  _buildElectrodeStatus('FP2', 'Frontal R', true),
                  _buildElectrodeStatus('T3', 'Temporal L', true),
                  _buildElectrodeStatus('T4', 'Temporal R', true),
                  _buildElectrodeStatus('O1', 'Occipital L', true),
                  _buildElectrodeStatus('O2', 'Occipital R', true),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Animated EEG Waveform Card
          const Text('Live EEG Telemetry Stream', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Container(
            height: 90,
            decoration: BoxDecoration(
              color: AppTheme.bgSecondary,
              borderRadius: BorderRadius.circular(20),
              // No border line
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: AnimatedBuilder(
                animation: _waveController,
                builder: (context, child) {
                  return CustomPaint(
                    painter: EegWavePainter(
                      progress: _waveController.value,
                      isConnected: _isConnected,
                      stateColor: _isConnected ? stateColor : AppTheme.textSecondary,
                      severity: _selectedSeverity,
                    ),
                  );
                },
              ),
            ),
          ),

          const SizedBox(height: 20),

          // BCI Simulator Settings Card
          const Text('BCI Telemetry Simulator Panel', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.bgSecondary,
              borderRadius: BorderRadius.circular(20),
              // No border line
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Set Simulated Emotion State', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 10),
                
                // Segments
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ['CALM', 'STRESSED', 'ANXIOUS', 'DEPRESSED', 'ANGRY'].map((state) {
                    bool isSel = _selectedState == state;
                    Color currentStateColor = AppTheme.getColorForState(state);
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedState = state;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSel ? currentStateColor.withValues(alpha: 0.15) : AppTheme.bgTertiary,
                          borderRadius: BorderRadius.circular(10),
                          // No border line
                        ),
                        child: Text(
                          state,
                          style: TextStyle(
                            color: isSel ? currentStateColor : AppTheme.textSecondary,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                
                const SizedBox(height: 24),
                
                // Severity Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Emotional Severity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    Text(
                      '$_selectedSeverity/10',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: stateColor),
                    ),
                  ],
                ),
                Slider(
                  value: _selectedSeverity.toDouble(),
                  min: 1,
                  max: 10,
                  divisions: 9,
                  activeColor: stateColor,
                  inactiveColor: AppTheme.bgTertiary,
                  onChanged: (val) {
                    setState(() {
                      _selectedSeverity = val.toInt();
                    });
                  },
                ),
                
                const SizedBox(height: 20),
                
                // Action Sync Button
                ElevatedButton.icon(
                  onPressed: _isSyncing ? null : _syncTelemetry,
                  icon: const Icon(LucideIcons.cloudLightning, size: 16),
                  label: _isSyncing
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Sync Simulated Telemetry', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: stateColor,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 42),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildElectrodeStatus(String name, String desc, bool goodSignal) {
    return Column(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: goodSignal ? AppTheme.calm : AppTheme.textSecondary,
            boxShadow: goodSignal
                ? [
                    BoxShadow(
                      color: AppTheme.calm.withValues(alpha: 0.5),
                      blurRadius: 6,
                      spreadRadius: 1,
                    )
                  ]
                : null,
          ),
        ),
        const SizedBox(height: 6),
        Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
        const SizedBox(height: 2),
        Text(desc, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 8)),
      ],
    );
  }
}

// EEG Waveform Custom Painter
class EegWavePainter extends CustomPainter {
  final double progress;
  final bool isConnected;
  final Color stateColor;
  final int severity;

  EegWavePainter({
    required this.progress,
    required this.isConnected,
    required this.stateColor,
    required this.severity,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = stateColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    final backgroundPaint = Paint()
      ..color = AppTheme.bgTertiary.withValues(alpha: 0.2)
      ..style = PaintingStyle.fill;

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), backgroundPaint);

    final path = Path();
    final width = size.width;
    final height = size.height;
    final midY = height / 2;

    if (!isConnected) {
      // Draw flatline with occasional tiny noise
      path.moveTo(0, midY);
      for (double x = 0; x < width; x++) {
        final double noise = (math.sin(x * 0.1 + progress * 20) * 0.5) + (math.cos(x * 0.3) * 0.2);
        path.lineTo(x, midY + noise);
      }
    } else {
      // Dynamic wave depending on severity
      final frequency = 0.05 + (severity * 0.015);
      final amplitude = 5.0 + (severity * 2.5);
      
      path.moveTo(0, midY);
      for (double x = 0; x < width; x++) {
        // Compose multiple sine waves + random noise based on severity
        final wave1 = math.sin(x * frequency + progress * 15 * (1 + severity * 0.1)) * amplitude;
        final wave2 = math.cos(x * (frequency * 2.3) - progress * 8) * (amplitude * 0.3);
        final noise = math.sin(x * 0.8) * (severity * 0.5); // high severity is noisy/jittery
        
        path.lineTo(x, midY + wave1 + wave2 + noise);
      }
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant EegWavePainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.isConnected != isConnected ||
        oldDelegate.stateColor != stateColor ||
        oldDelegate.severity != severity;
  }
}
