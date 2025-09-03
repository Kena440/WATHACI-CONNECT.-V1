# Internationalization (i18n) Setup

This project is configured with `i18next` and `react-i18next` for internationalization support.

## Usage

### Basic Translation Hook

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('save')}</button>
    </div>
  );
}
```

### Translation with Variables

```tsx
// In your translation file (src/i18n.ts)
const resources = {
  en: {
    translation: {
      greeting: "Hello, {{name}}!"
    }
  }
};

// In your component
function Greeting({ userName }: { userName: string }) {
  const { t } = useTranslation();
  
  return <h1>{t('greeting', { name: userName })}</h1>;
}
```

### Language Switching

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>
    </div>
  );
}
```

## Setup in Your App

To use i18n in your application, import the configuration in your main file:

```tsx
// In src/main.tsx
import './i18n'; // Import i18n configuration
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById("root")!).render(<App />);
```

## Adding New Languages

1. Add translations to the resources object in `src/i18n.ts`
2. Update the language switcher component
3. Test with the new language

## Translation Keys Organization

Keep translation keys organized by feature:

```typescript
const resources = {
  en: {
    translation: {
      // Authentication
      auth: {
        login: "Login",
        register: "Register",
        logout: "Logout"
      },
      
      // Navigation
      nav: {
        home: "Home",
        dashboard: "Dashboard",
        profile: "Profile"
      },
      
      // Forms
      forms: {
        email: "Email",
        password: "Password",
        submit: "Submit"
      }
    }
  }
};
```

Then use nested keys in components:
```tsx
{t('auth.login')}
{t('nav.home')}
{t('forms.email')}
```