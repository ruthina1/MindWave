import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mindwave_mobile/theme/app_theme.dart';
import 'package:mindwave_mobile/services/api_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  List<dynamic> _reports = [];

  @override
  void initState() {
    super.initState();
    _fetchReports();
  }

  Future<void> _fetchReports() async {
    final reports = await _api.getReports();
    if (mounted) {
      setState(() {
        _reports = reports;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily AI Reports', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: -0.5)),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppTheme.accent))
        : RefreshIndicator(
            onRefresh: _fetchReports,
            color: AppTheme.accent,
            backgroundColor: AppTheme.bgSecondary,
            child: _reports.isEmpty 
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(LucideIcons.fileSearch, size: 48, color: AppTheme.textSecondary.withValues(alpha: 0.5)),
                      const SizedBox(height: 16),
                      const Text('No reports generated yet.', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _reports.length,
                  itemBuilder: (context, index) {
                    final report = _reports[index];
                    return _buildReportCard(report);
                  },
                ),
          ),
    );
  }

  Widget _buildReportCard(dynamic report) {
    final List<dynamic> patterns = report['patterns'] ?? [];
    
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(24),
        // No border line
      ),child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(LucideIcons.calendar, size: 16, color: AppTheme.accent),
                  const SizedBox(width: 8),
                  Text(
                    report['date'],
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.stressed.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Avg Sev: ${report['avgSeverity']}',
                  style: const TextStyle(color: AppTheme.stressed, fontWeight: FontWeight.bold, fontSize: 11),
                ),
              )
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.bgTertiary,
              borderRadius: BorderRadius.circular(16),
              // No border line
            ),
            child: Text(
              report['summary'] ?? '',
              style: const TextStyle(fontSize: 13, height: 1.6, color: AppTheme.textPrimary),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Icon(LucideIcons.brain, size: 15, color: AppTheme.textSecondary),
              const SizedBox(width: 6),
              const Text('Patterns Found', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 10),
          ...patterns.map((p) => Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 4, right: 10),
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: AppTheme.accent.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(LucideIcons.check, size: 8, color: AppTheme.accent),
                ),
                Expanded(
                  child: Text(
                    p.toString(), 
                    style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4)
                  )
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
