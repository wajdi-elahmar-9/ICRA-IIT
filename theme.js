/**
 * Theme Manager
 * Handles dark/light theme switching with localStorage persistence
 */

class ThemeManager {
  constructor() {
    this.themes = {
      dark: 'dark',
      light: 'light'
    };

    this.themeOrder = ['dark', 'light'];
    this.currentTheme = localStorage.getItem('theme') || this.themes.dark;
    this.themeToggleBtn = document.getElementById('themeToggle');
    
    this.themeLabels = {
      dark: {
        en: 'Dark',
        ar: 'داكن'
      },
      light: {
        en: 'Light',
        ar: 'فاتح'
      }
    };

    this.themeTitles = {
      dark: {
        en: 'Dark Mode (Click to toggle)',
        ar: 'الوضع الداكن'
      },
      light: {
        en: 'Light Mode (Click to toggle)',
        ar: 'الوضع الفاتح'
      }
    };

    this.init();
  }

  init() {
    if (!this.themeToggleBtn) return;

    // Set initial theme
    if (!this.themeOrder.includes(this.currentTheme)) {
      this.currentTheme = this.themes.dark;
    }

    this.applyTheme(this.currentTheme);
    this.updateButton();

    // Add event listener
    this.themeToggleBtn.addEventListener('click', () => this.toggle());
    window.addEventListener('languagechange', () => this.updateButton());
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.currentTheme = theme;
  }

  toggle() {
    const currentIndex = this.themeOrder.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themeOrder.length;
    const nextTheme = this.themeOrder[nextIndex];
    
    this.applyTheme(nextTheme);
    this.updateButton();
  }

  updateButton() {
    const lang = document.documentElement.getAttribute('lang') === 'ar' ? 'ar' : 'en';
    this.themeToggleBtn.textContent = this.themeLabels[this.currentTheme][lang];
    this.themeToggleBtn.title = this.themeTitles[this.currentTheme][lang];
  }

  getTheme() {
    return this.currentTheme;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}

document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});
