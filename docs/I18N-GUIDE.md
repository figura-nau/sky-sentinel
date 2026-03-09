
# Complete Guide: React i18n with Vite & External JSON

Think of this setup as building a **global library system** for your app. Instead of forcing every user to carry every language dictionary in their backpack (a massive JavaScript bundle), your app will check the user's preference and fetch only the specific language book they need from the library shelf (the `public` folder).

## Overview
* **Situation:** You need a scalable multi-language React Vite app (English and Ukrainian) that handles complex grammar.
* **Task:** Set up `react-i18next` to load translations dynamically and automatically handle grammar rules like plurals.
* **Action:** Install core packages, build a `public/locales` folder structure, configure the HTTP backend, and use `count` variables in the `useTranslation` hook.
* **Result:** A highly performant app that only loads the text it needs and automatically formats dynamic numbers.

---

## Step 1: Install Dependencies

Install the core translation library, the React bindings, the browser language detector, and the HTTP backend (to fetch JSON files).

```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend

```

---

## Step 2: Create the File Structure (The "Library Shelf")

Vite serves the `public` folder directly over the network. Create your translation files here so they remain separate from your main code bundle.

Create this exact structure in your project root:

```text
your-project/
├── public/
│   └── locales/
│       ├── en/
│       │   └── translation.json
│       └── ua/
│           └── translation.json

```

---

## Step 3: Configure i18n

Create the configuration file. This is the "brain" that tells your app where to find the JSON files and how to detect the user's language.

**`src/i18n.js`**

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Fetches files from public/locales
  .use(LanguageDetector) // Detects browser language
  .use(initReactI18next) // Passes i18n down to React
  .init({
    supportedLngs: ['en', 'ua'],
    fallbackLng: 'en',
    debug: true, // Check the browser console to see it working
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

export default i18n;

```

---

## Step 4: Wrap the App in Suspense

Because fetching JSON files over the network takes a fraction of a second, React needs to know what to do while it waits.


#### After (With i18n & Suspense)

```jsx
// src/main.jsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './i18n.js' // IMPORTANT: Import your config here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
)

```

---

## Step 5: Handling Plurals (The "Smart Vending Machine")

Add `_one`, `_few`, `_many`, and `_other` suffixes to your JSON keys, and pass a `count` variable to your component.

**`public/locales/en/translation.json`**

```json
{
  "title": "Welcome to our App",
  "switch_lang": "Switch Language",
  "item_count_one": "You have {{count}} item in your cart",
  "item_count_other": "You have {{count}} items in your cart"
}

```

**`public/locales/ua/translation.json`**

```json
{
  "title": "Ласкаво просимо до нашого Додатку",
  "switch_lang": "Змінити Мову",
  "item_count_one": "У вас {{count}} товар у кошику",
  "item_count_few": "У вас {{count}} товари у кошику",
  "item_count_many": "У вас {{count}} товарів у кошику",
  "item_count_other": "У вас {{count}} товару у кошику"
}

```

## Step 6: Use Translations in Components

#### After (Clean Internationalized Plurals)

```jsx
// src/App.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();
  const [cartItems, setCartItems] = useState(3);

  return (
    <div>
      <h1>{t('title')}</h1>
      
      {/* Just pass the base key 'item_count' and the count variable. */}
      {/* i18next automatically adds the _one, _few, or _many suffix behind the scenes! */}
      <p>{t('item_count', { count: cartItems })}</p>

      {/* Test Buttons */}
      <button onClick={() => setCartItems(1)}>Set 1 Item</button>
      <button onClick={() => setCartItems(3)}>Set 3 Items</button>
      <button onClick={() => setCartItems(5)}>Set 5 Items</button>
      
      {/* Language Switcher */}
      <div style={{ marginTop: '20px' }}>
        <p>{t('switch_lang')}:</p>
        <button onClick={() => i18n.changeLanguage('en')}>English</button>
        <button onClick={() => i18n.changeLanguage('ua')}>Українська</button>
      </div>
    </div>
  );
}

```
