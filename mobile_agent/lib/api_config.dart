import 'package:flutter/foundation.dart';

String get defaultApiBaseUrl {
  if (kIsWeb) return 'http://127.0.0.1:4000';
  // Remplacer 192.168.142.1 par l'adresse IP locale (Wi-Fi) de votre PC si nécessaire
  if (defaultTargetPlatform == TargetPlatform.android) return 'http://192.168.142.1:4000';
  return 'http://192.168.142.1:4000';
}

const String _envApiBase = String.fromEnvironment('API_BASE');

final String apiBaseUrl = _envApiBase.isNotEmpty ? _envApiBase : defaultApiBaseUrl;
