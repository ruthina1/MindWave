import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mindwave_mobile/theme/app_theme.dart';

class TimelineScreen extends StatelessWidget {
  const TimelineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emotion Timeline', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: -0.5)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Period selector
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildTab('Today', true),
              _buildTab('7 Days', false),
              _buildTab('30 Days', false),
            ],
          ),
          const SizedBox(height: 20),
          
          // Chart
          Container(
            height: 200,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppTheme.bgSecondary,
              borderRadius: BorderRadius.circular(24),
              // No border line
            ),
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(color: AppTheme.bgTertiary, strokeWidth: 1),
                ),
                titlesData: FlTitlesData(
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 32,
                      interval: 2,
                      getTitlesWidget: (value, meta) {
                        return Text(value.toInt().toString(), style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.bold));
                      },
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      interval: 3,
                      getTitlesWidget: (value, meta) {
                        const times = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];
                        if (value.toInt() < times.length) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(times[value.toInt()], style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                          );
                        }
                        return const Text('');
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                minX: 0,
                maxX: 5,
                minY: 0,
                maxY: 10,
                lineBarsData: [
                  LineChartBarData(
                    spots: const [
                      FlSpot(0, 3), // 6am
                      FlSpot(1, 4), // 9am
                      FlSpot(1.5, 8), // 10:30am SPIKE
                      FlSpot(2, 5), // 12pm
                      FlSpot(3, 2), // 3pm
                      FlSpot(4, 7), // 6pm SPIKE
                      FlSpot(5, 3), // 9pm
                    ],
                    isCurved: true,
                    color: AppTheme.accent,
                    barWidth: 4,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      color: AppTheme.accent.withValues(alpha: 0.15),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          Row(
            children: [
              Icon(LucideIcons.list, size: 18, color: AppTheme.accent),
              const SizedBox(width: 10),
              const Text('Events Log', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 14),
          
          _buildEventLog('10:30 AM', 'STRESSED', 8, 'Gamma 40Hz played'),
          _buildEventLog('6:00 PM', 'ANXIOUS', 7, 'Binaural Alpha played'),
        ],
      ),
    );
  }

  Widget _buildTab(String label, bool active) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: active ? AppTheme.accent : AppTheme.bgTertiary,
        borderRadius: BorderRadius.circular(24),
        // No border line
      ),
      child: Text(
        label,
        style: TextStyle(
          color: active ? Colors.white : AppTheme.textSecondary,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildEventLog(String time, String state, int severity, String intervention) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        // No border line
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.clock, size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 6),
                  Text(time, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.getColorForState(state).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('Sev $severity', style: TextStyle(color: AppTheme.getColorForState(state), fontWeight: FontWeight.bold, fontSize: 11)),
              )
            ],
          ),
          const SizedBox(height: 10),
          Text('$state spike detected.', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: AppTheme.bgTertiary,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.headphones, size: 14, color: AppTheme.accent),
                const SizedBox(width: 8),
                Text(intervention, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
