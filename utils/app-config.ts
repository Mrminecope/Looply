export const TOAST_CONFIG = {
  position: "bottom-center" as const,
  theme: "light" as const,
  richColors: true,
  closeButton: true,
  toastOptions: {
    duration: 3000,
    style: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(124, 58, 237, 0.1)',
      borderRadius: '12px',
      color: '#0f172a',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12)'
    }
  }
};

export const APP_META = {
  name: 'Looply',
  version: '3.0.0',
  description: 'Mobile-first social media platform with AI assistance'
};

export const ENVIRONMENT_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};