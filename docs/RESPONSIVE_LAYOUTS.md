# Responsive Layout Guidelines
## PocketShop - Mobile-First Design System

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Phase 2 - UI/UX Design

---

## Table of Contents

1. [Breakpoints](#1-breakpoints)
2. [Grid System](#2-grid-system)
3. [Layout Patterns](#3-layout-patterns)
4. [Navigation](#4-navigation)
5. [Component Responsiveness](#5-component-responsiveness)
6. [Best Practices](#6-best-practices)

---

## 1. Breakpoints

### Standard Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm:  640px;   /* Small devices (phones) */
--breakpoint-md:  768px;   /* Medium devices (tablets) */
--breakpoint-lg:  1024px;  /* Large devices (laptops) */
--breakpoint-xl:  1280px;  /* Extra large devices (desktops) */
--breakpoint-2xl: 1536px;  /* 2X Extra large devices */
```

### Tailwind CSS Breakpoints

```javascript
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### Usage Example

```tsx
// Mobile-first: base styles for mobile, then override for larger screens
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  <Card />
</div>
```

---

## 2. Grid System

### 12-Column Grid

- **Desktop (lg+)**: 12 columns, 24px gaps
- **Tablet (md)**: 8 columns, 20px gaps
- **Mobile (sm)**: 4 columns, 16px gaps

### Container Widths

```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;
```

### Container Usage

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Grid Examples

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// Stats cards: 1 column mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard />
  <StatsCard />
  <StatsCard />
  <StatsCard />
</div>
```

---

## 3. Layout Patterns

### 3.1 Dashboard Layout

#### Desktop (1024px+)
```
┌────────────────────────────────────────────────────┐
│ Header (Full Width)                                │
├──────────┬─────────────────────────────────────────┤
│ Sidebar  │ Main Content Area                       │
│ (240px)  │ (Flexible)                              │
│          │                                         │
│          │ ┌─────────────────────────────────────┐ │
│          │ │ Stats Grid (4 columns)              │ │
│          │ └─────────────────────────────────────┘ │
│          │ ┌─────────────────────────────────────┐ │
│          │ │ Content Cards                        │ │
│          │ └─────────────────────────────────────┘ │
└──────────┴─────────────────────────────────────────┘
```

#### Tablet (768px - 1023px)
```
┌────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ [☰] Sidebar (Drawer)               │
├─────────────────────────────────────┤
│ Main Content                        │
│ ┌─────────────────────────────────┐ │
│ │ Stats Grid (2 columns)           │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Content Cards                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Mobile (< 768px)
```
┌─────────────────────┐
│ [☰] Header          │
├─────────────────────┤
│ Stats (1 column)    │
│ ┌─────────────────┐ │
│ │ Stats Card      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Stats Card      │ │
│ └─────────────────┘ │
│                     │
│ Content Cards       │
│ ┌─────────────────┐ │
│ │ Card            │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### 3.2 Kanban Board Layout

#### Desktop
- **3 columns** side-by-side
- Column width: ~33% each
- Scrollable columns if content overflows

#### Tablet
- **2 columns** side-by-side
- Third column scrolls horizontally or collapses

#### Mobile
- **Single column** stack
- Tabs or accordion for column switching
- Horizontal scroll as alternative

### 3.3 Product Grid Layout

#### Desktop
- **4 columns** grid
- Grid gap: 24px

#### Tablet
- **3 columns** grid
- Grid gap: 20px

#### Mobile
- **2 columns** grid
- Grid gap: 16px

---

## 4. Navigation

### 4.1 Desktop Navigation

```tsx
// Fixed sidebar, always visible
<aside className="hidden lg:flex fixed left-0 top-0 h-full w-64">
  <Navigation />
</aside>
```

### 4.2 Tablet Navigation

```tsx
// Collapsible drawer
<button onClick={toggleDrawer}>☰</button>
<Drawer isOpen={isOpen} onClose={closeDrawer}>
  <Navigation />
</Drawer>
```

### 4.3 Mobile Navigation

```tsx
// Bottom navigation bar or hamburger menu
<nav className="fixed bottom-0 left-0 right-0 lg:hidden">
  <BottomNav />
</nav>
```

### Navigation Breakpoints

- **Mobile (< 768px)**: Hamburger menu or bottom nav
- **Tablet (768px - 1023px)**: Drawer navigation
- **Desktop (1024px+)**: Fixed sidebar

---

## 5. Component Responsiveness

### 5.1 Button Sizes

```tsx
// Responsive button sizing
<Button 
  size="sm"      // Mobile
  className="md:size-md lg:size-lg"
>
  Click Me
</Button>
```

### 5.2 Card Padding

```tsx
// Responsive padding
<Card 
  padding="sm"    // Mobile: 16px
  className="md:p-md lg:p-lg"  // Tablet: 24px, Desktop: 32px
>
  Content
</Card>
```

### 5.3 Typography Scale

```tsx
// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Responsive body text
</p>
```

### 5.4 Tables

#### Desktop
- Full table with all columns visible
- Horizontal scroll if needed

#### Tablet
- Hide less important columns
- Stack on mobile or use cards

```tsx
// Responsive table
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Desktop: Show all columns */}
    <thead className="hidden md:table-header-group">
      {/* All columns */}
    </thead>
    {/* Mobile: Card layout */}
    <tbody className="md:table-row-group">
      {/* Cards on mobile, rows on desktop */}
    </tbody>
  </table>
</div>
```

---

## 6. Best Practices

### 6.1 Mobile-First Approach

Always start with mobile styles, then add larger breakpoints:

```tsx
// ✅ Good: Mobile-first
<div className="w-full md:w-1/2 lg:w-1/3">

// ❌ Bad: Desktop-first
<div className="w-1/3 md:w-1/2 lg:w-full">
```

### 6.2 Touch Targets

- **Minimum size**: 44x44px on mobile
- **Spacing**: 8px minimum between interactive elements

```tsx
<button className="min-h-[44px] min-w-[44px] p-3">
  Touch Target
</button>
```

### 6.3 Image Responsiveness

```tsx
<img 
  src="image.jpg"
  alt="Description"
  className="w-full h-auto"
  loading="lazy"
/>
```

### 6.4 Hide/Show Content

```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">
  Desktop Content
</div>

// Show on mobile, hide on desktop
<div className="md:hidden">
  Mobile Content
</div>
```

### 6.5 Spacing Scale

Use consistent spacing that scales appropriately:

```tsx
// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>

<div className="gap-4 md:gap-6 lg:gap-8">
  {/* Responsive gaps */}
</div>
```

### 6.6 Container Padding

```tsx
// Responsive container padding
<div className="px-4 sm:px-6 lg:px-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>
```

---

## Responsive Utility Classes

### Common Patterns

```tsx
// Responsive grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Responsive flex direction
className="flex flex-col md:flex-row"

// Responsive text alignment
className="text-center md:text-left"

// Responsive visibility
className="hidden md:block lg:hidden xl:block"

// Responsive width
className="w-full md:w-1/2 lg:w-1/3"

// Responsive margins
className="mt-4 md:mt-6 lg:mt-8"
```

---

## Testing Checklist

- [ ] Test on actual mobile devices (iOS, Android)
- [ ] Test on tablets (iPad, Android tablets)
- [ ] Test on different screen sizes (Chrome DevTools)
- [ ] Verify touch targets are adequate
- [ ] Check text readability at all sizes
- [ ] Ensure images scale properly
- [ ] Test navigation on all breakpoints
- [ ] Verify forms are usable on mobile
- [ ] Check modals/dialogs on small screens
- [ ] Test horizontal scrolling where needed

---

## Performance Considerations

1. **Lazy Loading**: Load images and heavy components on demand
2. **Conditional Rendering**: Render mobile/desktop components separately
3. **CSS over JS**: Use CSS media queries over JavaScript when possible
4. **Optimize Images**: Use responsive images with `srcset`
5. **Minimize Layout Shifts**: Set explicit dimensions for images

---

**Next Steps:**
1. Implement responsive layouts in components
2. Test on real devices
3. Optimize for performance
4. Gather user feedback

