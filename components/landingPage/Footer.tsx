'use client';

import React from 'react';
import { FaBus, FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-12 gap-x-8">
          
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1E40AF' }}>
                <FaBus className="text-white text-xl" />
              </div>
              <span className="font-bold text-2xl tracking-tight" style={{ color: '#1E40AF' }}>
                AngkotGo
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-[220px]">
              Solusi transportasi cerdas untuk perjalanan yang lebih mudah di Kota Malang.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><a href="#beranda" className="hover:text-blue-600 transition-colors">Beranda</a></li>
              <li><a href="#benefits" className="hover:text-blue-600 transition-colors">Benefits</a></li>
              <li><a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a></li>
              <li><a href="#about" className="hover:text-blue-600 transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Informasi</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Cara Penggunaan</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Bantuan</a></li>
            </ul>
          </div>

          {/* Hubungi Kami */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <a href="tel:+6281234567890" className="hover:text-blue-600 transition-colors flex items-center gap-2">
                  +62 812-3456-7890
                </a>
              </li>
              <li>
                <a href="mailto:hello@angkotgo.id" className="hover:text-blue-600 transition-colors">
                  hello@angkotgo.id
                </a>
              </li>
              <li className="flex items-center gap-4 pt-2">
                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">
                  <FaInstagram className="text-xl" />
                </a>
                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">
                  <FaTwitter className="text-xl" />
                </a>
                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">
                  <FaFacebookF className="text-xl" />
                </a>
              </li>
            </ul>
          </div>

          {/* Download Aplikasi */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Download Aplikasi</h4>
            <div className="space-y-3">
              <a 
                href="#" 
                className="flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-900 transition-colors w-fit"
              >
                <div>
                  <div className="text-[10px] leading-none">GET IT ON</div>
                  <div className="font-semibold text-base tracking-tight">Google Play</div>
                </div>
              </a>

              <a 
                href="#" 
                className="flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-900 transition-colors w-fit"
              >
                <div>
                  <div className="text-[10px] leading-none">Download on the</div>
                  <div className="font-semibold text-base tracking-tight">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            © 2024 AngkotGo. All rights reserved. Made with <span className="text-red-500">♥</span> for Malang
          </p>
        </div>
      </div>
    </footer>
  );
}