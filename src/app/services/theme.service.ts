import { Injectable, signal } from '@angular/core';
import { AlbumTheme, ThemePreset } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  
  // Default theme presets
  private readonly themePresets: ThemePreset[] = [
    {
      id: 'classic',
      name: 'Classic Blue',
      description: 'Clean and professional blue theme',
      isPremium: false,
      theme: {
        id: 'classic',
        name: 'Classic Blue',
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        background: '#f8fafc',
        text: '#1e293b',
        cardBackground: '#ffffff'
      }
    },
    {
      id: 'elegant',
      name: 'Elegant Gray',
      description: 'Sophisticated grayscale theme',
      isPremium: false,
      theme: {
        id: 'elegant',
        name: 'Elegant Gray',
        primary: '#374151',
        secondary: '#1f2937',
        accent: '#6b7280',
        background: '#f9fafb',
        text: '#111827',
        cardBackground: '#ffffff'
      }
    },
    {
      id: 'warm',
      name: 'Warm Sunset',
      description: 'Warm oranges and yellows',
      isPremium: false,
      theme: {
        id: 'warm',
        name: 'Warm Sunset',
        primary: '#ea580c',
        secondary: '#c2410c',
        accent: '#fb923c',
        background: '#fefcfb',
        text: '#431407',
        cardBackground: '#ffffff'
      }
    },
    {
      id: 'nature',
      name: 'Nature Green',
      description: 'Fresh and natural green theme',
      isPremium: true,
      theme: {
        id: 'nature',
        name: 'Nature Green',
        primary: '#059669',
        secondary: '#047857',
        accent: '#10b981',
        background: '#f0fdf4',
        text: '#064e3b',
        cardBackground: '#ffffff',
        isPremium: true
      }
    },
    {
      id: 'romantic',
      name: 'Romantic Rose',
      description: 'Soft pinks and roses for special moments',
      isPremium: true,
      theme: {
        id: 'romantic',
        name: 'Romantic Rose',
        primary: '#e11d48',
        secondary: '#be123c',
        accent: '#f43f5e',
        background: '#fdf2f8',
        text: '#881337',
        cardBackground: '#ffffff',
        isPremium: true
      }
    },
    {
      id: 'ocean',
      name: 'Ocean Depths',
      description: 'Deep blues and teals like the ocean',
      isPremium: true,
      theme: {
        id: 'ocean',
        name: 'Ocean Depths',
        primary: '#0891b2',
        secondary: '#0e7490',
        accent: '#06b6d4',
        background: '#ecfeff',
        text: '#164e63',
        cardBackground: '#ffffff',
        isPremium: true
      }
    },
    {
      id: 'vintage',
      name: 'Vintage Sepia',
      description: 'Classic vintage photography feel',
      isPremium: true,
      theme: {
        id: 'vintage',
        name: 'Vintage Sepia',
        primary: '#92400e',
        secondary: '#78350f',
        accent: '#a16207',
        background: '#fefbf3',
        text: '#451a03',
        cardBackground: '#fffbeb',
        isPremium: true
      }
    },
    {
      id: 'midnight',
      name: 'Midnight Dark',
      description: 'Elegant dark theme for night viewing',
      isPremium: true,
      theme: {
        id: 'midnight',
        name: 'Midnight Dark',
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#8b5cf6',
        background: '#0f172a',
        text: '#f1f5f9',
        cardBackground: '#1e293b',
        isPremium: true
      }
    }
  ];

  // Current theme signal
  currentTheme = signal<AlbumTheme>(this.getDefaultTheme());

  getThemePresets(): ThemePreset[] {
    return this.themePresets;
  }

  getFreeThemes(): ThemePreset[] {
    return this.themePresets.filter(preset => !preset.isPremium);
  }

  getPremiumThemes(): ThemePreset[] {
    return this.themePresets.filter(preset => preset.isPremium);
  }

  getThemeById(id: string): AlbumTheme | null {
    const preset = this.themePresets.find(preset => preset.id === id);
    return preset ? preset.theme : null;
  }

  getDefaultTheme(): AlbumTheme {
    return this.themePresets[0].theme; // Classic Blue
  }

  setCurrentTheme(theme: AlbumTheme) {
    this.currentTheme.set(theme);
    this.applyThemeToDocument(theme);
  }

  private applyThemeToDocument(theme: AlbumTheme) {
    const root = document.documentElement;
    
    console.log('🎨 Applying theme to document:', theme.name);
    console.log('📋 Theme values:', {
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      background: theme.background,
      text: theme.text,
      cardBackground: theme.cardBackground
    });
    
    // Apply CSS custom properties
    root.style.setProperty('--album-primary', theme.primary);
    root.style.setProperty('--album-secondary', theme.secondary);
    root.style.setProperty('--album-accent', theme.accent);
    root.style.setProperty('--album-background', theme.background);
    root.style.setProperty('--album-text', theme.text);
    root.style.setProperty('--album-card-bg', theme.cardBackground);
    
    console.log('✅ Theme CSS variables applied');
  }

  removeThemeFromDocument() {
    const root = document.documentElement;
    
    // Remove CSS custom properties
    root.style.removeProperty('--album-primary');
    root.style.removeProperty('--album-secondary');
    root.style.removeProperty('--album-accent');
    root.style.removeProperty('--album-background');
    root.style.removeProperty('--album-text');
    root.style.removeProperty('--album-card-bg');
  }

  generateThemeCSS(theme: AlbumTheme): string {
    return `
      --album-primary: ${theme.primary};
      --album-secondary: ${theme.secondary};
      --album-accent: ${theme.accent};
      --album-background: ${theme.background};
      --album-text: ${theme.text};
      --album-card-bg: ${theme.cardBackground};
    `;
  }

  isThemePremium(themeId: string): boolean {
    const preset = this.themePresets.find(preset => preset.id === themeId);
    return preset ? preset.isPremium : false;
  }
}
