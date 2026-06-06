import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulator, 127.0.0.1 for Web to avoid Windows localhost DNS issues
  static String get baseUrl => kIsWeb ? 'http://127.0.0.1:4000/api' : 'http://10.0.2.2:4000/api';
  static const String userId = 'u1'; // Hardcoded mock user for hackathon

  Future<Map<String, dynamic>> getCurrentReading() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/readings/$userId/current'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Error fetching reading: $e');
    }
    return {'state': 'UNKNOWN', 'severity': 0};
  }

  Future<bool> updateCurrentReading(String state, int severity) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/readings/$userId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'state': state,
          'severity': severity,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error updating reading: $e');
      return false;
    }
  }

  Future<List<dynamic>> getReports() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/reports/$userId'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Error fetching reports: $e');
    }
    return [];
  }

  Future<List<dynamic>> getConsents() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/consent/$userId'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Error fetching consents: $e');
    }
    return [];
  }

  Future<bool> toggleConsent(String doctorId, bool active) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/consent/toggle'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'patientId': userId,
          'doctorId': doctorId,
          'active': active,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error toggling consent: $e');
      return false;
    }
  }
}
