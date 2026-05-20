import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../api_config.dart';
import '../data/burkina_geo.dart';

class IncidentFormScreen extends StatefulWidget {
  const IncidentFormScreen({Key? key}) : super(key: key);

  @override
  _IncidentFormScreenState createState() => _IncidentFormScreenState();
}

class _IncidentFormScreenState extends State<IncidentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  
  int _locationMethod = 0; 
  String? _region;
  String? _province;
  String? _commune;
  String _village = '';
  String _lieuDit = '';
  String? _incidentType;
  String _description = '';
  late final List<String> _regions;

  XFile? _imageFile;
  final ImagePicker _picker = ImagePicker();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _regions = burkinaRegionsAndProvinces.keys.toList()..sort();
    _ensureSession();
  }

  Future<void> _ensureSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    if (!mounted) return;
    if (token == null || token.isEmpty) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final XFile? pickedFile = await _picker.pickImage(source: source);
    if (pickedFile != null) {
      setState(() {
        _imageFile = pickedFile;
      });
    }
  }

  Future<void> _submitIncident() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      setState(() => _isSubmitting = true);
      
      try {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('access_token') ?? '';

        var request = http.MultipartRequest('POST', Uri.parse('$apiBaseUrl/api/incidents'));
        request.headers['Authorization'] = 'Bearer $token'; // Ignored successfully if token empty but backend enforces
        
        request.fields['type'] = _incidentType ?? 'Autre';
        request.fields['description'] = _description;
        request.fields['locationMethod'] = _locationMethod.toString();
        
        if (_locationMethod == 0) {
          request.fields['region'] = _region ?? '';
          request.fields['province'] = _province ?? '';
          request.fields['commune'] = _commune ?? '';
        } else {
          request.fields['latitude'] = '14.0';
          request.fields['longitude'] = '-0.03';
          request.fields['region'] = 'Sahel';
          request.fields['province'] = 'Soum';
          request.fields['commune'] = 'Djibo';
        }

        if (_imageFile != null) {
          request.files.add(
            http.MultipartFile.fromBytes(
              'media',
              await _imageFile!.readAsBytes(),
              filename: _imageFile!.name,
            )
          );
        }

        var response = await request.send();
        if (response.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: const [
                  Icon(Icons.check_circle, color: Colors.white),
                  SizedBox(width: 10),
                  Text('Signalement envoyé avec succès !'),
                ],
              ),
              backgroundColor: Colors.green.shade600,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          );
          _formKey.currentState!.reset();
          setState(() {
            _imageFile = null;
            _locationMethod = 0;
            _region = null;
            _province = null;
            _commune = null;
          });
        } else {
          final respBody = await response.stream.bytesToString();
          throw Exception("Code ${response.statusCode}: $respBody");
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text("Échec de l'envoi : $e"), backgroundColor: Colors.red),
        );
      } finally {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), 
      appBar: AppBar(
        backgroundColor: const Color(0xFFD30000), 
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.security, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('SAD-ALERTE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white, letterSpacing: 0.5)),
                Text('Créer un signalement', style: TextStyle(fontSize: 12, color: Colors.white70)),
              ],
            ),
          ],
        ),
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person, color: Colors.white),
            onPressed: () {
              Navigator.pushNamed(context, '/profil');
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 40.0),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
              const Text(
                'Nouveau Signalement',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
              ),
              const SizedBox(height: 6),
              const Text(
                'Veuillez détailler l\'événement observé avec autant de précision que possible.',
                style: TextStyle(fontSize: 14, color: Colors.black54),
              ),
              const SizedBox(height: 24),

              _buildCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildSectionTitle(Icons.location_on, 'Localisation', color: const Color(0xFF3B82F6)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: _buildLocationToggleBtn(0, Icons.edit_location_alt, 'Saisie manuelle')),
                        const SizedBox(width: 12),
                        Expanded(child: _buildLocationToggleBtn(1, Icons.gps_fixed, 'Utiliser GPS')),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (_locationMethod == 0) ...[
                       _buildDropdown(
                         'Région *',
                         _regions,
                         (v) => setState(() {
                           _region = v;
                           _province = null;
                         }),
                         _region,
                       ),
                       const SizedBox(height: 12),
                       _buildDropdown(
                         'Province *',
                         _region == null ? const [] : (burkinaRegionsAndProvinces[_region] ?? const []),
                         (v) => setState(() => _province = v),
                         _province,
                       ),
                       const SizedBox(height: 12),
                       _buildTextField('Commune *', 'Nom de la commune', (v) => _commune = v),
                       const SizedBox(height: 12),
                       _buildTextField('Village (optionnel)', 'Nom du village', (v) => _village = v!),
                       const SizedBox(height: 12),
                       _buildTextField('Lieu-dit / Description', 'Ex: Près du grand marché', (v) => _lieuDit = v!),
                    ],
                    if (_locationMethod == 1) ...[
                       Container(
                         padding: const EdgeInsets.symmetric(vertical: 30),
                         decoration: BoxDecoration(
                           color: const Color(0xFFEFF6FF), 
                           borderRadius: BorderRadius.circular(12),
                           border: Border.all(color: const Color(0xFFBFDBFE)),
                         ),
                         child: Column(
                           children: const [
                             Icon(Icons.satellite_alt, size: 48, color: Color(0xFF3B82F6)),
                             SizedBox(height: 12),
                             Text('Acquisition de vos coordonnées...', style: TextStyle(color: Color(0xFF1E40AF), fontWeight: FontWeight.w500)),
                           ],
                         ),
                       ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              _buildCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildSectionTitle(Icons.assignment_late, 'Détails de l\'incident', color: const Color(0xFFF59E0B)),
                    const SizedBox(height: 16),
                    _buildDropdown('Type d\'incident *', ['Attaque', 'Mouvement suspect', 'Embuscade', 'Pillage', 'Autre'], (v) => setState(() => _incidentType = v), _incidentType),
                    const SizedBox(height: 16),
                    TextFormField(
                      maxLines: 5,
                      decoration: InputDecoration(
                        labelText: 'Description des faits *',
                        alignLabelWithHint: true,
                        hintText: 'Décrivez précisément ce que vous avez observé...',
                        filled: true,
                        fillColor: const Color(0xFFF1F5F9),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFD30000), width: 1.5)),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Ce champ est requis' : null,
                      onSaved: (v) => _description = v!,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              _buildCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildSectionTitle(Icons.perm_media, 'Pièces jointes', color: const Color(0xFF10B981)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: _buildMediaBtn(Icons.camera_alt, 'Caméra', onTap: () => _pickImage(ImageSource.camera))),
                        const SizedBox(width: 12),
                        Expanded(child: _buildMediaBtn(Icons.photo_library, 'Galerie', onTap: () => _pickImage(ImageSource.gallery))),
                      ],
                    ),
                    if (_imageFile != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text("Fichier : ${_imageFile!.name}", style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                      )
                  ],
                ),
              ),

              const SizedBox(height: 32),
              
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitIncident,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD30000),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  elevation: 2,
                  shadowColor: const Color(0xFFD30000).withOpacity(0.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSubmitting 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.send_rounded),
                        SizedBox(width: 10),
                        Text('SOUMETTRE LE SIGNALEMENT', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                      ],
                    ),
              ),
            ],
          ),
        ),
      ),
    ),
  ),
);
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: child,
    );
  }

  Widget _buildSectionTitle(IconData icon, String title, {required Color color}) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
      ],
    );
  }

  Widget _buildLocationToggleBtn(int index, IconData icon, String label) {
    bool isSelected = _locationMethod == index;
    return InkWell(
      onTap: () => setState(() => _locationMethod = index),
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF3B82F6) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: isSelected ? Colors.white : const Color(0xFF64748B)),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isSelected ? Colors.white : const Color(0xFF475569))),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown(String label, List<String> items, Function(String?) onChanged, String? value) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
        filled: true,
        fillColor: const Color(0xFFF1F5F9),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFD30000), width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      icon: const Icon(Icons.expand_more, color: Color(0xFF64748B)),
      value: value,
      items: items.map((i) => DropdownMenuItem(value: i, child: Text(i))).toList(),
      onChanged: onChanged,
      validator: (val) {
        if (label.contains('*') && (val == null || val.isEmpty)) {
          return 'Ce champ est requis';
        }
        return null;
      },
    );
  }

  Widget _buildTextField(String label, String hint, Function(String?) onSaved) {
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
        filled: true,
        fillColor: const Color(0xFFF1F5F9),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFD30000), width: 1.5)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      validator: (val) {
        if (label.contains('*') && (val == null || val.trim().isEmpty)) {
          return 'Ce champ est requis';
        }
        return null;
      },
      onSaved: onSaved,
    );
  }

  Widget _buildMediaBtn(IconData icon, String label, {required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: const Color(0xFF475569), size: 24),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
          ],
        ),
      ),
    );
  }
}
