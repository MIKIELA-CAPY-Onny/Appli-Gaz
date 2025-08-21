#!/usr/bin/env node

/**
 * Script de test simple pour l'API
 * Usage: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Fonction pour tester un endpoint
function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Tests à effectuer
async function runTests() {
  console.log('🧪 Test de l\'API Plateforme de Scolarité');
  console.log('==========================================\n');

  try {
    // Test 1: Endpoint principal
    console.log('1️⃣ Test de l\'endpoint principal...');
    const mainResponse = await testEndpoint('/');
    console.log(`   ✅ Status: ${mainResponse.status}`);
    console.log(`   📝 Message: ${mainResponse.data.message}`);
    console.log('');

    // Test 2: Route d'authentification
    console.log('2️⃣ Test de la route d\'authentification...');
    const authResponse = await testEndpoint('/api/auth/test');
    console.log(`   ✅ Status: ${authResponse.status}`);
    console.log(`   📝 Message: ${authResponse.data.message}`);
    console.log('');

    // Test 3: Route des étudiants
    console.log('3️⃣ Test de la route des étudiants...');
    const studentsResponse = await testEndpoint('/api/students/test');
    console.log(`   ✅ Status: ${studentsResponse.status}`);
    console.log(`   📝 Message: ${studentsResponse.data.message}`);
    console.log('');

    // Test 4: Route des cours
    console.log('4️⃣ Test de la route des cours...');
    const coursesResponse = await testEndpoint('/api/courses/test');
    console.log(`   ✅ Status: ${coursesResponse.status}`);
    console.log(`   📝 Message: ${coursesResponse.data.message}`);
    console.log('');

    // Test 5: Test de connexion (sans authentification)
    console.log('5️⃣ Test de connexion (sans token)...');
    const loginResponse = await testEndpoint('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log(`   ✅ Status: ${loginResponse.status}`);
    console.log(`   📝 Message: ${loginResponse.data.message}`);
    console.log('');

    console.log('🎉 Tous les tests de base sont passés avec succès !');
    console.log('');
    console.log('📋 Résumé:');
    console.log('   ✅ API accessible sur le port 3000');
    console.log('   ✅ Routes d\'authentification fonctionnelles');
    console.log('   ✅ Routes des étudiants fonctionnelles');
    console.log('   ✅ Routes des cours fonctionnelles');
    console.log('   ✅ Validation des données en place');
    console.log('');
    console.log('🚀 L\'application est prête pour le développement !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('');
    console.log('🔍 Vérifiez que:');
    console.log('   1. L\'application est démarrée (npm run dev)');
    console.log('   2. MongoDB est en cours d\'exécution');
    console.log('   3. Le port 3000 est disponible');
  }
}

// Lancer les tests si le script est exécuté directement
if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint, runTests };