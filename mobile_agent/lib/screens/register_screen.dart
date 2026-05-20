import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../api_config.dart';
import '../data/burkina_geo.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomCtrl = TextEditingController();
  final _prenomCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _telCtrl = TextEditingController();
  final _matriculeCtrl = TextEditingController();
  final _uniteCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();

  String? _zone;
  bool _isLoading = false;
  bool _showPassword = false;
  bool _showConfirmPassword = false;
  bool _termsAccepted = false;
  
  String? _error;
  String? _success;

  @override
  void dispose() {
    _nomCtrl.dispose();
    _prenomCtrl.dispose();
    _emailCtrl.dispose();
    _telCtrl.dispose();
    _matriculeCtrl.dispose();
    _uniteCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_zone == null) {
      setState(() => _error = "Veuillez sélectionner une zone d'affectation.");
      return;
    }
    if (!_termsAccepted) {
      setState(() => _error = "Vous devez accepter les conditions d'utilisation.");
      return;
    }
    if (_passwordCtrl.text != _confirmPasswordCtrl.text) {
      setState(() => _error = "Les deux mots de passe ne correspondent pas.");
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
      _success = null;
    });

    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/api/auth/request-signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'nom': _nomCtrl.text.trim(),
          'prenom': _prenomCtrl.text.trim(),
          'email': _emailCtrl.text.trim(),
          'password': _passwordCtrl.text,
          'matricule': _matriculeCtrl.text.trim(),
          'unite': _uniteCtrl.text.trim(),
          'zone': _zone,
        }),
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        setState(() => _error = "La demande a été refusée ou l'email est déjà utilisé.");
        return;
      }

      setState(() {
        _success = "Demande enregistrée. Votre compte sera activé par un administrateur après vérification.";
      });
      _formKey.currentState!.reset();
      _nomCtrl.clear();
      _prenomCtrl.clear();
      _emailCtrl.clear();
      _passwordCtrl.clear();
      _confirmPasswordCtrl.clear();
      _telCtrl.clear();
      _matriculeCtrl.clear();
      _uniteCtrl.clear();
      setState(() {
        _zone = null;
        _termsAccepted = false;
      });
    } catch (e) {
      setState(() => _error = "Impossible de joindre le serveur: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color sadblue = Color(0xFFF0F4F8);
    const Color sadred = Color(0xFFD30000);

    return Scaffold(
      backgroundColor: sadblue,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 48),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade100),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))],
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Center(
                      child: ClipOval(
                        child: Image.asset('assets/logo.jpeg', width: 64, height: 64, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.security, size: 64)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'SAD-ALERTE - Demande d\'inscription',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      "Système d'Aide à la Décision pour l'Alerte Précoce",
                      style: TextStyle(color: Colors.black54, fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEA),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFFEF08A)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.warning_amber_rounded, color: Color(0xFFCA8A04), size: 24),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text('Accès réservé au personnel autorisé', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF854D0E))),
                                SizedBox(height: 4),
                                Text('Toute demande frauduleuse sera signalée aux autorités compétentes. Votre compte sera activé uniquement après vérification de votre identité par un administrateur.', style: TextStyle(fontSize: 12, color: Color(0xFFA16207))),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    if (_error != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.red.shade200)),
                        child: Text(_error!, style: TextStyle(color: Colors.red.shade700, fontSize: 14)),
                      ),
                    if (_success != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.green.shade200)),
                        child: Text(_success!, style: TextStyle(color: Colors.green.shade700, fontSize: 14)),
                      ),
                    Row(
                      children: [
                        Expanded(child: _buildTextField('Nom *', _nomCtrl, 'OUEDRAOGO')),
                        const SizedBox(width: 16),
                        Expanded(child: _buildTextField('Prénom(s) *', _prenomCtrl, 'Moumouni')),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildTextField('Email *', _emailCtrl, 'exemple@forces.bf', isEmail: true),
                    const SizedBox(height: 16),
                    _buildTextField('Téléphone *', _telCtrl, '+226 XX XX XX XX'),
                    const SizedBox(height: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Profil *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87)),
                        const SizedBox(height: 6),
                        TextFormField(
                          initialValue: 'Agent de terrain',
                          enabled: false,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            filled: true,
                            fillColor: Colors.grey.shade100,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Zone d\'affectation *', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87)),
                        const SizedBox(height: 6),
                        DropdownButtonFormField<String>(
                          value: _zone,
                          items: (burkinaRegionsAndProvinces.keys.toList()..sort()).map((String region) {
                            return DropdownMenuItem<String>(
                              value: region,
                              child: Text(region),
                            );
                          }).toList(),
                          onChanged: (v) => setState(() => _zone = v),
                          decoration: InputDecoration(
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                            hintText: 'Sélectionnez une région',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildTextField('Matricule / Numéro d\'identification *', _matriculeCtrl, 'Ex: FAN-12345'),
                    const SizedBox(height: 16),
                    _buildTextField('Unité / Service *', _uniteCtrl, 'Ex: 3ème Régiment d\'Infanterie'),
                    const SizedBox(height: 16),
                    _buildPasswordField('Mot de passe *', _passwordCtrl, 'Au moins 10 caractères', _showPassword, () => setState(() => _showPassword = !_showPassword)),
                    const SizedBox(height: 16),
                    _buildPasswordField('Confirmer le mot de passe *', _confirmPasswordCtrl, 'Retapez votre mot de passe', _showConfirmPassword, () => setState(() => _showConfirmPassword = !_showConfirmPassword)),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEBF3F9),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFD0E3F2)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.security, color: Colors.orange, size: 16),
                              SizedBox(width: 8),
                              Text('Sécurité de votre compte :', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black87)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text('• Votre mot de passe doit contenir au moins 10 caractères (politique serveur)\n• Utilisez un mélange de lettres, chiffres et caractères spéciaux\n• Ne partagez jamais vos identifiants\n• Double authentification (2FA) activée après validation', style: TextStyle(fontSize: 12, color: Color(0xFF1E40AF), height: 1.5)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 24, height: 24,
                          child: Checkbox(
                            value: _termsAccepted,
                            onChanged: (v) => setState(() => _termsAccepted = v ?? false),
                            activeColor: sadred,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            "J'accepte les conditions d'utilisation et je certifie que les informations fournies sont exactes. Je comprends que toute fausse déclaration peut entraîner des poursuites judiciaires.",
                            style: TextStyle(fontSize: 12, color: Colors.black54),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0A0A1A),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: _isLoading
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Soumettre ma demande', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text("Retour à la page de connexion", style: TextStyle(color: Colors.blue)),
                    )
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController ctrl, String hint, {bool isEmail = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87)),
        const SizedBox(height: 6),
        TextFormField(
          controller: ctrl,
          keyboardType: isEmail ? TextInputType.emailAddress : TextInputType.text,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          ),
          validator: (v) => v!.isEmpty ? 'Requis' : null,
        ),
      ],
    );
  }

  Widget _buildPasswordField(String label, TextEditingController ctrl, String hint, bool isObscure, VoidCallback onToggle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87)),
        const SizedBox(height: 6),
        TextFormField(
          controller: ctrl,
          obscureText: !isObscure,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
            suffixIcon: IconButton(icon: Icon(isObscure ? Icons.visibility_off : Icons.visibility, color: Colors.grey), onPressed: onToggle),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          ),
          validator: (v) => v!.length < 10 ? 'Min 10 caractères' : null,
        ),
      ],
    );
  }
}
