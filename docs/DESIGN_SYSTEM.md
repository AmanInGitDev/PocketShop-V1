# Design System
## PocketShop - UI Component Library & Style Guide

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Phase 2 - UI/UX Design

---

## Table of Contents

1. [Color Palette](#1-color-palette)
2. [Typography](#2-typography)
3. [Spacing & Layout](#3-spacing--layout)
4. [Components](#4-components)
5. [Icons](#5-icons)
6. [Animations & Transitions](#6-animations--transitions)
7. [Accessibility](#7-accessibility)

---

## 1. Color Palette

### 1.1 Primary Colors

```css
/* Primary Blue - Main brand color */
--primary-50:  #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

**Usage:**
- Primary buttons
- Links
- Active states
- Brand elements

### 1.2 Secondary Colors

```css
/* Secondary Slate - Neutral tones */
--secondary-50:  #f8fafc;
--secondary-100: #f1f5f9;
--secondary-200: #e2e8f0;
--secondary-300: #cbd5e1;
--secondary-400: #94a3b8;
--secondary-500: #64748b;  /* Main secondary */
--secondary-600: #475569;
--secondary-700: #334155;
--secondary-800: #1e293b;
--secondary-900: #0f172a;
```

**Usage:**
- Text colors
- Backgrounds
- Borders
- Disabled states

### 1.3 Semantic Colors

```css
/* Success - Green */
--success-50:  #f0fdf4;
--success-500: #10b981;  /* Main success */
--success-600: #059669;
--success-700: #047857;

/* Warning - Orange */
--warning-50:  #fffbeb;
--warning-500: #f59e0b;  /* Main warning */
--warning-600: #d97706;
--warning-700: #b45309;

/* Error - Red */
--error-50:  #fef2f2;
--error-500: #ef4444;  /* Main error */
--error-600: #dc2626;
--error-700: #b91c1c;

/* Info - Blue */
--info-50:  #eff6ff;
--info-500: #3b82f6;  /* Main info */
--info-600: #2563eb;
--info-700: #1d4ed8;
```

### 1.4 Status Colors

```css
/* Order Status Colors */
--status-pending:    #f59e0b;  /* Orange */
--status-progress:   #3b82f6;  /* Blue */
--status-ready:      #10b981;  /* Green */
--status-completed:  #64748b;  /* Gray */
--status-cancelled:  #ef4444;  /* Red */
```

### 1.5 Dark Mode Colors

```css
/* Dark Theme */
--dark-bg-primary:   #0f172a;
--dark-bg-secondary: #1e293b;
--dark-bg-tertiary:  #334155;
--dark-text-primary: #f8fafc;
--dark-text-secondary: #cbd5e1;
--dark-border:       #475569;
```

---

## 2. Typography

### 2.1 Font Family

```css
--font-family-primary: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'Fira Code', 'Courier New', monospace;
```

**Inter** is the primary typeface for all UI text.

### 2.2 Font Sizes

```css
/* Headings */
--text-4xl: 2.25rem;   /* 36px - Hero headings */
--text-3xl: 1.875rem; /* 30px - Page titles */
--text-2xl: 1.5rem;    /* 24px - Section headers */
--text-xl:  1.25rem;   /* 20px - Subsection headers */
--text-lg:  1.125rem;  /* 18px - Large body text */

/* Body */
--text-base: 1rem;     /* 16px - Default body text */
--text-sm:   0.875rem; /* 14px - Small text */
--text-xs:   0.75rem;  /* 12px - Extra small text */
```

### 2.3 Font Weights

```css
--font-light:   300;
--font-normal:  400;
--font-medium:  500;
--font-semibold: 600;
--font-bold:    700;
--font-extrabold: 800;
```

### 2.4 Line Heights

```css
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 2.5 Typography Scale

| Element | Font Size | Weight | Line Height | Usage |
|---------|-----------|--------|-------------|-------|
| H1 | 2.25rem (36px) | 800 | 1.2 | Hero titles |
| H2 | 1.875rem (30px) | 700 | 1.3 | Page titles |
| H3 | 1.5rem (24px) | 600 | 1.4 | Section headers |
| H4 | 1.25rem (20px) | 600 | 1.5 | Subsection headers |
| Body | 1rem (16px) | 400 | 1.5 | Default text |
| Small | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| Caption | 0.75rem (12px) | 400 | 1.5 | Labels, captions |

---

## 3. Spacing & Layout

### 3.1 Spacing Scale (4px base unit)

```css
--space-0:  0;
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 3.2 Container Widths

```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;
```

### 3.3 Grid System

- **12-column grid** for desktop layouts
- **Gap**: 24px (--space-6) between columns
- **Margins**: 16px on mobile, 24px on tablet, 32px on desktop

### 3.4 Border Radius

```css
--radius-none: 0;
--radius-sm:   0.25rem;  /* 4px */
--radius-md:   0.5rem;   /* 8px */
--radius-lg:   0.75rem;  /* 12px */
--radius-xl:   1rem;     /* 16px */
--radius-2xl:  1.5rem;   /* 24px */
--radius-full: 9999px;   /* Circle */
```

### 3.5 Shadows

```css
--shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## 4. Components

### 4.1 Buttons

#### Primary Button
```css
background: var(--primary-500);
color: white;
padding: 0.75rem 1.5rem;
border-radius: var(--radius-md);
font-weight: 600;
font-size: var(--text-base);
transition: all 0.2s ease;

/* Hover */
background: var(--primary-600);
transform: translateY(-1px);
box-shadow: var(--shadow-md);

/* Active */
background: var(--primary-700);
transform: translateY(0);
```

#### Secondary Button
```css
background: transparent;
color: var(--primary-500);
border: 2px solid var(--primary-500);
padding: 0.75rem 1.5rem;
border-radius: var(--radius-md);
font-weight: 600;
```

#### Size Variants
- **Small**: `padding: 0.5rem 1rem; font-size: 0.875rem;`
- **Medium**: `padding: 0.75rem 1.5rem; font-size: 1rem;` (default)
- **Large**: `padding: 1rem 2rem; font-size: 1.125rem;`

### 4.2 Cards

```css
background: white;
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-md);
border: 1px solid var(--secondary-200);

/* Hover */
box-shadow: var(--shadow-lg);
transform: translateY(-2px);
transition: all 0.2s ease;
```

### 4.3 Input Fields

```css
width: 100%;
padding: 0.75rem 1rem;
border: 2px solid var(--secondary-300);
border-radius: var(--radius-md);
font-size: var(--text-base);
transition: all 0.2s ease;

/* Focus */
border-color: var(--primary-500);
outline: none;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

/* Error */
border-color: var(--error-500);
```

### 4.4 Badges

```css
display: inline-flex;
align-items: center;
padding: 0.25rem 0.75rem;
border-radius: var(--radius-full);
font-size: var(--text-xs);
font-weight: 600;

/* Status variants */
--badge-success: background: var(--success-100); color: var(--success-700);
--badge-warning: background: var(--warning-100); color: var(--warning-700);
--badge-error: background: var(--error-100); color: var(--error-700);
```

### 4.5 Modals

```css
/* Overlay */
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);

/* Modal */
background: white;
border-radius: var(--radius-xl);
padding: var(--space-6);
max-width: 500px;
width: 90%;
box-shadow: var(--shadow-2xl);
```

### 4.6 Tables

```css
width: 100%;
border-collapse: collapse;

th {
  background: var(--secondary-50);
  padding: var(--space-4);
  text-align: left;
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--secondary-700);
  border-bottom: 2px solid var(--secondary-200);
}

td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--secondary-200);
}

tr:hover {
  background: var(--secondary-50);
}
```

---

## 5. Icons

### 5.1 Icon Library
- **Lucide React** - Primary icon library
- **Size variants**: 16px, 20px, 24px, 32px
- **Stroke width**: 2px (default), 1.5px (small)

### 5.2 Icon Usage
- **Navigation**: 20px
- **Actions**: 16px
- **Hero/Features**: 32px
- **Status indicators**: 16px

---

## 6. Animations & Transitions

### 6.1 Transitions

```css
/* Standard */
transition: all 0.2s ease;

/* Smooth */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Fast */
transition: all 0.15s ease;
```

### 6.2 Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 6.3 Loading States

- **Skeleton loaders** for content placeholders
- **Spinner** for async operations
- **Progress bars** for uploads/downloads

---

## 7. Accessibility

### 7.1 Color Contrast

- **Text on background**: Minimum 4.5:1 ratio (WCAG AA)
- **Large text**: Minimum 3:1 ratio
- **Interactive elements**: Clear focus indicators

### 7.2 Focus States

```css
outline: 2px solid var(--primary-500);
outline-offset: 2px;
```

### 7.3 Touch Targets

- **Minimum size**: 44x44px on mobile
- **Spacing**: 8px minimum between interactive elements

### 7.4 Keyboard Navigation

- **Tab order**: Logical flow
- **Skip links**: For main content
- **Keyboard shortcuts**: Documented in help

### 7.5 Screen Readers

- **ARIA labels** for all interactive elements
- **Alt text** for images
- **Semantic HTML** structure

---

## Design Tokens (Tailwind Config)

See `tailwind.config.js` for full implementation of these design tokens.

---

## Usage Guidelines

1. **Consistency**: Use predefined tokens, avoid custom values
2. **Responsive**: Mobile-first approach
3. **Accessibility**: Always check contrast and focus states
4. **Performance**: Optimize animations (use transform/opacity)
5. **Dark Mode**: Support both light and dark themes

---

**Next Steps:**
1. Implement component library in React
2. Create Storybook documentation
3. Build design system documentation site
4. User testing and refinement

