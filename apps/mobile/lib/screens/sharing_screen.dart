import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mindwave_mobile/theme/app_theme.dart';
import 'package:mindwave_mobile/services/api_service.dart';

class SharingScreen extends StatefulWidget {
  const SharingScreen({super.key});

  @override
  State<SharingScreen> createState() => _SharingScreenState();
}

class _SharingScreenState extends State<SharingScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  List<dynamic> _consents = [];

  @override
  void initState() {
    super.initState();
    _fetchConsents();
  }

  Future<void> _fetchConsents() async {
    final consents = await _api.getConsents();
    if (mounted) {
      setState(() {
        _consents = consents;
        _isLoading = false;
      });
    }
  }

  Future<void> _toggleConsent(String doctorId, bool currentValue) async {
    setState(() => _isLoading = true);
    final success = await _api.toggleConsent(doctorId, !currentValue);
    if (success) {
      await _fetchConsents(); // Refresh
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(!currentValue ? 'Data shared with doctor.' : 'Data access revoked.', style: const TextStyle(fontWeight: FontWeight.bold)),
            backgroundColor: !currentValue ? AppTheme.calm : AppTheme.angry,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          )
        );
      }
    } else {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Sharing', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: -0.5)),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppTheme.accent))
        : RefreshIndicator(
            onRefresh: _fetchConsents,
            color: AppTheme.accent,
            backgroundColor: AppTheme.bgSecondary,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.bgSecondary,
                    borderRadius: BorderRadius.circular(16),
                    // No border line
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.accent.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.lock, color: AppTheme.accent, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Your data is private by default. Only share with doctors you trust.',
                          style: TextStyle(color: AppTheme.textPrimary.withValues(alpha: 0.9), fontSize: 13, height: 1.4),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Icon(LucideIcons.users, size: 18, color: AppTheme.accent),
                    const SizedBox(width: 10),
                    const Text('My Doctors', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 14),
                
                if (_consents.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(40.0),
                    child: Column(
                      children: [
                        Icon(LucideIcons.userX, size: 48, color: AppTheme.textSecondary.withValues(alpha: 0.5)),
                        const SizedBox(height: 16),
                        const Text('No doctors added yet.', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                      ],
                    ),
                  ),

                ..._consents.map((consent) => _buildDoctorCard(consent)),
                
                const SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(LucideIcons.plus, size: 16),
                  label: const Text('Add a Doctor', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.bgTertiary,
                    foregroundColor: AppTheme.accent,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                )
              ],
            ),
          ),
    );
  }

  Widget _buildDoctorCard(dynamic consent) {
    bool isActive = consent['active'] ?? false;
    String doctorName = consent['doctorName'] ?? 'Unknown Doctor';
    String doctorRole = consent['doctorRole'] ?? 'Specialist';
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(20),
        // No border line
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppTheme.bgTertiary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(LucideIcons.stethoscope, color: AppTheme.textPrimary, size: 20),
              ),
              const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(doctorName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(doctorRole, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Share Live Data & Reports', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
              Switch(
                value: isActive,
                activeTrackColor: AppTheme.calm.withValues(alpha: 0.5),
                activeColor: AppTheme.calm,
                inactiveTrackColor: AppTheme.bgTertiary,
                inactiveThumbColor: AppTheme.textSecondary,
                onChanged: (val) => _toggleConsent(consent['doctorId'], consent['active']),
              ),
            ],
          ),
          if (isActive)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Row(
                children: [
                  Icon(LucideIcons.checkCircle2, color: AppTheme.calm, size: 14),
                  const SizedBox(width: 6),
                  Text('Doctor can view your dashboard', style: TextStyle(color: AppTheme.calm, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
            )
        ],
      ),
    );
  }
}
