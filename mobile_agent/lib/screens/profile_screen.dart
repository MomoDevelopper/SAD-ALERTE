import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../api_config.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _profileData;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('access_token') ?? '';

      final response = await http.get(
        Uri.parse('$apiBaseUrl/api/auth/profile'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _profileData = data['profile'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Session expirée ou non autorisé';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Erreur réseau';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Mon Profil', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFFD30000),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFD30000)))
          : _error.isNotEmpty
              ? Center(child: Text(_error, style: const TextStyle(color: Colors.red)))
              : _profileData == null 
                  ? const Center(child: Text('Aucune donnée', style: TextStyle(color: Colors.black54)))
                  : _buildProfileContent(),
    );
  }

  Widget _buildProfileContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const CircleAvatar(
            radius: 50,
            backgroundColor: Color(0xFFD30000),
            child: Icon(Icons.person, size: 50, color: Colors.white),
          ),
          const SizedBox(height: 20),
          Text(
            '${_profileData!['prenom']} ${_profileData!['nom']}',
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          ),
          Text(
            _profileData!['role']?.toUpperCase() ?? 'AGENT',
            style: const TextStyle(fontSize: 14, color: Color(0xFF3B82F6), fontWeight: FontWeight.w600, letterSpacing: 1.2),
          ),
          const SizedBox(height: 30),
          _buildInfoCard(Icons.email, "Adresse Email", _profileData!['email']),
          const SizedBox(height: 12),
          _buildInfoCard(Icons.verified_user, "Score de Confiance", "${(_profileData!['score_confiance'] * 100).toInt()}%"),
          const SizedBox(height: 12),
          _buildInfoCard(Icons.calendar_today, "Inscrit le", _profileData!['date_creation'].substring(0, 10)),
          const SizedBox(height: 40),
          OutlinedButton.icon(
            icon: const Icon(Icons.logout, color: Color(0xFFD30000)),
            label: const Text('Se déconnecter', style: TextStyle(color: Color(0xFFD30000), fontWeight: FontWeight.bold)),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 32),
              side: const BorderSide(color: Color(0xFFD30000), width: 1.5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
               final prefs = await SharedPreferences.getInstance();
               await prefs.clear();
               if (!mounted) return;
               Navigator.pushReplacementNamed(context, '/login');
            },
          )
        ],
      ),
    );
  }

  Widget _buildInfoCard(IconData icon, String title, String value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ]
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: const Color(0xFF64748B), size: 24),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
            ],
          )
        ],
      ),
    );
  }
}
