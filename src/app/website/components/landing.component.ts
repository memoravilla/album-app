import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <img src="assets/icons/Memorabilia.png" alt="Memoravilla" class="h-40 w-auto mr-2">
            <span class="text-2xl font-bold text-primary-900">Memoravilla</span>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-700 hover:text-primary-600 transition-colors">Features</a>
            <a href="#demo" class="text-gray-700 hover:text-primary-600 transition-colors">Demo</a>
            <a href="#founders" class="text-gray-700 hover:text-primary-600 transition-colors">About</a>
            <a href="#pricing" class="text-gray-700 hover:text-primary-600 transition-colors">Pricing</a>
            <a href="#contact" class="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
            <a routerLink="/auth/login" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Sign In
            </a>
          </div>
          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button (click)="toggleMobileMenu()" class="text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
        <!-- Mobile menu -->
        @if (showMobileMenu()) {
          <div class="md:hidden border-t border-gray-200 py-4">
            <div class="flex flex-col space-y-4">
              <a href="#features" class="text-gray-700 hover:text-primary-600 transition-colors">Features</a>
              <a href="#demo" class="text-gray-700 hover:text-primary-600 transition-colors">Demo</a>
              <a href="#founders" class="text-gray-700 hover:text-primary-600 transition-colors">About</a>
              <a href="#pricing" class="text-gray-700 hover:text-primary-600 transition-colors">Pricing</a>
              <a href="#contact" class="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
              <a routerLink="/auth/login" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center">
                Sign In
              </a>
            </div>
          </div>
        }
      </div>
    </nav>

    <!-- Jumbotron -->
    <section class="pt-20 pb-16 bg-gradient-to-br from-primary-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span class="text-primary-600">Memoravilla</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Preserve, organize, and share your precious memories with family and friends. 
            Create beautiful photo albums that tell your story and last forever.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/auth/register" class="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors">
              Get Started Free
            </a>
            <a routerLink="/auth/login" class="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors">
              Sign In
            </a>
          </div>
        </div>
        <div class="mt-16 relative">
          <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div class="bg-gray-100 px-4 py-3 flex items-center space-x-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div class="p-8">
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-primary-100 rounded-lg p-4 text-center">
                  <div class="w-full h-24 bg-primary-200 rounded mb-2"></div>
                  <p class="text-sm text-primary-700 font-medium">Family Vacation</p>
                </div>
                <div class="bg-green-100 rounded-lg p-4 text-center">
                  <div class="w-full h-24 bg-green-200 rounded mb-2"></div>
                  <p class="text-sm text-green-700 font-medium">Wedding Album</p>
                </div>
                <div class="bg-purple-100 rounded-lg p-4 text-center">
                  <div class="w-full h-24 bg-purple-200 rounded mb-2"></div>
                  <p class="text-sm text-purple-700 font-medium">Baby's First Year</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to organize, share, and preserve your memories
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (feature of features; track feature.title) {
            <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="feature.icon">
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Albums Demo -->
    <section id="demo" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">See How Albums Work</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, organize, and share your photo albums with ease
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="space-y-8">
              @for (step of demoSteps; track step.step) {
                <div class="flex items-start space-x-4">
                  <div class="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {{ step.step }}
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ step.title }}</h3>
                    <p class="text-gray-600">{{ step.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div class="bg-primary-600 px-6 py-4">
                <h3 class="text-white font-semibold">My Photo Albums</h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 aspect-square flex items-center justify-center">
                    <span class="text-blue-700 font-medium text-sm">Summer 2024</span>
                  </div>
                  <div class="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg p-4 aspect-square flex items-center justify-center">
                    <span class="text-pink-700 font-medium text-sm">Wedding</span>
                  </div>
                  <div class="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 aspect-square flex items-center justify-center">
                    <span class="text-green-700 font-medium text-sm">Baby Photos</span>
                  </div>
                  <div class="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 aspect-square flex items-center justify-center">
                    <span class="text-purple-700 font-medium text-sm">Graduation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Founders -->
    <section id="founders" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Meet Our Founders</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            The passionate team behind Memoravilla
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          @for (founder of founders; track founder.name) {
            <div class="text-center">
              <div class="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                <span class="text-6xl text-primary-600 font-bold">{{ getInitials(founder.name) }}</span>
              </div>
              <h3 class="text-2xl font-semibold text-gray-900 mb-2">{{ founder.name }}</h3>
              <p class="text-primary-600 font-medium mb-4">{{ founder.role }}</p>
              <p class="text-gray-600 leading-relaxed">{{ founder.bio }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your memory preservation needs
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          @for (plan of pricingPlans; track plan.name) {
            <div class="bg-white rounded-xl shadow-lg p-8 relative" [class.ring-2]="plan.featured" [class.ring-primary-600]="plan.featured">
              @if (plan.featured) {
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span class="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
              }
              
              <div class="text-center">
                <h3 class="text-2xl font-semibold text-gray-900 mb-4">{{ plan.name }}</h3>
                <div class="mb-6">
                  <span class="text-5xl font-bold text-gray-900">\${{ plan.price }}</span>
                  <span class="text-gray-600">/{{ plan.period }}</span>
                </div>
                <p class="text-gray-600 mb-8">{{ plan.description }}</p>
                
                <ul class="space-y-3 mb-8">
                  @for (feature of plan.features; track feature) {
                    <li class="flex items-center">
                      <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {{ feature }}
                    </li>
                  }
                </ul>
                
                <button 
                  class="w-full py-3 px-6 rounded-lg font-semibold transition-colors"
                  [class.bg-primary-600]="plan.featured"
                  [class.text-white]="plan.featured"
                  [class.hover:bg-primary-700]="plan.featured"
                  [class.bg-gray-100]="!plan.featured"
                  [class.text-gray-900]="!plan.featured"
                  [class.hover:bg-gray-200]="!plan.featured"
                >
                  {{ plan.buttonText }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Contact Us -->
    <section id="contact" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you
          </p>
        </div>

        <div class="max-w-2xl mx-auto">
          <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  formControlName="name"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Your full name"
                >
                @if (contactForm.get('name')?.invalid && contactForm.get('name')?.touched) {
                  <p class="text-red-500 text-sm mt-1">Name is required</p>
                }
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="your@email.com"
                >
                @if (contactForm.get('email')?.invalid && contactForm.get('email')?.touched) {
                  <p class="text-red-500 text-sm mt-1">Valid email is required</p>
                }
              </div>
            </div>
            
            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input 
                type="text" 
                id="subject" 
                formControlName="subject"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="What's this about?"
              >
              @if (contactForm.get('subject')?.invalid && contactForm.get('subject')?.touched) {
                <p class="text-red-500 text-sm mt-1">Subject is required</p>
              }
            </div>
            
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea 
                id="message" 
                formControlName="message"
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                placeholder="Tell us more about your inquiry..."
              ></textarea>
              @if (contactForm.get('message')?.invalid && contactForm.get('message')?.touched) {
                <p class="text-red-500 text-sm mt-1">Message is required</p>
              }
            </div>
            
            <div class="text-center">
              <button 
                type="submit" 
                [disabled]="contactForm.invalid || isSubmitting()"
                class="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (isSubmitting()) {
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                } @else {
                  Send Message
                }
              </button>
            </div>
          </form>

          @if (showSuccessMessage()) {
            <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex">
                <svg class="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p class="text-green-800">Thank you for your message! We'll get back to you soon.</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <div class="md:col-span-2">
            <div class="flex items-center mb-4">
              <img src="assets/icons/Memorabilia.png" alt="Memoravilla" class="h-8 w-auto mr-2">
              <h3 class="text-2xl font-bold">Memoravilla</h3>
            </div>
            <p class="text-gray-300 mb-6 max-w-md">
              Preserve your precious memories with beautiful photo albums that last forever. 
              Share your story with those who matter most.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-300 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-300 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-300 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 class="text-lg font-semibold mb-4">Product</h4>
            <ul class="space-y-2">
              <li><a href="#features" class="text-gray-300 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" class="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
              <li><a routerLink="/auth/register" class="text-gray-300 hover:text-white transition-colors">Sign Up</a></li>
              <li><a routerLink="/auth/login" class="text-gray-300 hover:text-white transition-colors">Sign In</a></li>
            </ul>
          </div>
          
          <div>
            <h4 class="text-lg font-semibold mb-4">Support</h4>
            <ul class="space-y-2">
              <li><a href="#contact" class="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-12 pt-8 text-center">
          <p class="text-gray-300">&copy; 2025 Memoravilla. All rights reserved. Built with ❤️ by Seiji Villafranca & Michelle Mamaid.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Smooth scroll behavior */
    html {
      scroll-behavior: smooth;
    }
    
    /* Custom animations */
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .float-animation {
      animation: float 6s ease-in-out infinite;
    }
    
    /* Gradient backgrounds */
    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `]
})
export class LandingComponent implements OnInit {
  showMobileMenu = signal(false);
  isSubmitting = signal(false);
  showSuccessMessage = signal(false);
  
  contactForm: FormGroup;

  features = [
    {
      title: 'Secure Cloud Storage',
      description: 'Your memories are safely stored in the cloud with enterprise-grade security and automatic backups.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>'
    },
    {
      title: 'Easy Sharing',
      description: 'Share albums with family and friends through secure invitations. Control who can view and contribute.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>'
    },
    {
      title: 'Smart Organization',
      description: 'Automatically organize photos by date, event, or custom tags. Find any memory in seconds.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"></path>'
    },
    {
      title: 'Beautiful Albums',
      description: 'Create stunning photo albums with customizable themes and layouts that showcase your memories perfectly.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>'
    },
    {
      title: 'Collaborative Memories',
      description: 'Let family members add their own photos and memories to shared albums. Build stories together.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>'
    },
    {
      title: 'Cross-Platform Access',
      description: 'Access your memories anywhere, anytime. Works perfectly on desktop, tablet, and mobile devices.',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>'
    }
  ];

  demoSteps = [
    {
      step: 1,
      title: 'Create Your Album',
      description: 'Start by creating a new album and give it a meaningful name that captures the moment.'
    },
    {
      step: 2,
      title: 'Upload Your Photos',
      description: 'Drag and drop your favorite photos or select them from your device. We support all major formats.'
    },
    {
      step: 3,
      title: 'Invite Your Loved Ones',
      description: 'Share your album with family and friends. They can view, comment, and add their own memories.'
    },
    {
      step: 4,
      title: 'Enjoy Forever',
      description: 'Your memories are preserved and organized beautifully, ready to be cherished for generations.'
    }
  ];

  founders = [
    {
      name: 'Seiji Villafranca',
      role: 'Co-Founder & CEO',
      bio: 'Passionate about preserving memories and building meaningful connections through technology. Seiji leads the vision and strategy at Memoravilla with a focus on user experience and innovation.'
    },
    {
      name: 'Michelle Mamaid',
      role: 'Co-Founder & CTO',
      bio: 'Technology enthusiast with a love for creating beautiful, functional applications. Michelle oversees the technical development and ensures Memoravilla is built with the highest quality standards.'
    }
  ];

  pricingPlans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started with your first albums',
      features: [
        '3 photo albums',
        '100 photos per album',
        'Basic sharing',
        'Mobile & web access',
        'Community support'
      ],
      buttonText: 'Get Started Free',
      featured: false
    },
    {
      name: 'Pro',
      price: 9,
      period: 'month',
      description: 'For families who want to preserve all their memories',
      features: [
        'Unlimited albums',
        '1,000 photos per album',
        'Advanced sharing & permissions',
        'Priority support',
        'Custom themes',
        'Download originals'
      ],
      buttonText: 'Start Free Trial',
      featured: true
    },
    {
      name: 'Family',
      price: 19,
      period: 'month',
      description: 'Perfect for large families and special occasions',
      features: [
        'Everything in Pro',
        'Unlimited photos',
        'Family member accounts',
        'Advanced organization',
        'Premium themes',
        'Priority support'
      ],
      buttonText: 'Start Free Trial',
      featured: false
    }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Add smooth scroll behavior to anchor links
    document.addEventListener('DOMContentLoaded', () => {
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href')?.substring(1);
          const targetElement = document.getElementById(targetId || '');
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    });
  }

  toggleMobileMenu() {
    this.showMobileMenu.update(value => !value);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Contact form submitted:', this.contactForm.value);
        this.showSuccessMessage.set(true);
        this.contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.showSuccessMessage.set(false);
        }, 5000);
        
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }
}
