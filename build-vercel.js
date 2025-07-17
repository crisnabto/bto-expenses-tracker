#!/usr/bin/env node

// Script de build personalizado para Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // 1. Instalar dependências na raiz (para TypeScript e shared)
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // 2. Entrar na pasta client e instalar dependências
  console.log('📦 Installing client dependencies...');
  process.chdir('./client');
  
  // Verificar se package.json existe
  if (!fs.existsSync('package.json')) {
    console.error('❌ client/package.json not found!');
    process.exit(1);
  }
  
  execSync('npm install', { stdio: 'inherit' });

  // 3. Buildar o frontend
  console.log('🔨 Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  // 4. Verificar se o build foi criado
  if (!fs.existsSync('dist')) {
    console.error('❌ Build failed - dist folder not created!');
    process.exit(1);
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Build output in client/dist');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}