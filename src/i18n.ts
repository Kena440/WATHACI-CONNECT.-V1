import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common translations
      welcome: "Welcome",
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      
      // Navigation
      home: "Home",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      
      // Forms
      email: "Email",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone",
      
      // Messages
      loginSuccess: "Successfully logged in",
      loginError: "Login failed",
      registrationSuccess: "Registration successful",
      registrationError: "Registration failed",
    }
  },
  // Add more languages as needed
  // fr: {
  //   translation: {
  //     welcome: "Bienvenue",
  //     // ... other translations
  //   }
  // }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // react already does escaping
    },
    
    // Development options
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;