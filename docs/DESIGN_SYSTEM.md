# Design System Documentation

This document defines the design system for the Handwritten Note Web App, ensuring consistency across all components and pages.

## Table of Contents

- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Layout](#layout)
- [Animations](#animations)
- [Icons & Emojis](#icons--emojis)
- [Responsive Design](#responsive-design)

## Color Palette

### Primary Colors (Blues)

Used for main brand elements, buttons, and interactive components.

```css
primary-50:  #f0f9ff  /* Very light blue - backgrounds */
primary-100: #e0f2fe  /* Light blue - hover states */
primary-200: #bae6fd  /* Soft blue - borders */
primary-300: #7dd3fc  /* Medium light blue */
primary-400: #38bdf8  /* Medium blue */
primary-500: #0ea5e9  /* Base primary - main actions */
primary-600: #0284c7  /* Dark blue - buttons */
primary-700: #0369a1  /* Darker blue - navbar */
primary-800: #075985  /* Very dark blue - text on light backgrounds */
primary-900: #0c4a6e  /* Deepest blue - emphasis */
```

**Usage:**
- `primary-600`: Primary buttons, links
- `primary-700-900`: Navigation bar gradient
- `primary-50-100`: Backgrounds for sections
- `primary-200`: Borders and dividers

### Accent Colors (Reds)

Used for secondary actions, highlights, and CTAs.

```css
accent-50:  #fef2f2  /* Very light red */
accent-100: #fee2e2  /* Light red */
accent-200: #fecaca  /* Soft red */
accent-300: #fca5a5  /* Medium light red */
accent-400: #f87171  /* Medium red */
accent-500: #ef4444  /* Base accent */
accent-600: #dc2626  /* Dark red - CTAs */
accent-700: #b91c1c  /* Darker red */
accent-800: #991b1b  /* Very dark red */
accent-900: #7f1d1d  /* Deepest red */
```

**Usage:**
- `accent-600-800`: Secondary CTAs, special actions
- `accent-50-100`: Background highlights
- Error states and warnings

### Neutral Colors

Grays for text, backgrounds, and UI elements.

```css
gray-50:  #f9fafb  /* Page backgrounds */
gray-100: #f3f4f6  /* Section backgrounds */
gray-200: #e5e7eb  /* Borders */
gray-300: #d1d5db  /* Disabled states */
gray-400: #9ca3af  /* Placeholder text */
gray-500: #6b7280  /* Secondary text */
gray-600: #4b5563  /* Body text */
gray-700: #374151  /* Headings */
gray-800: #1f2937  /* Emphasized text */
gray-900: #111827  /* Primary text */
```

**Usage:**
- `gray-50`: Main page background
- `gray-600-900`: Text hierarchy
- `gray-200-300`: Borders and dividers
- White (#FFFFFF): Card backgrounds

## Typography

### Font Families

```css
font-sans: 'Inter', 'system-ui', '-apple-system', 'sans-serif'
font-handwriting: 'Caveat', 'cursive'
font-mono: 'Monaco', 'Courier New', 'monospace'
```

**Usage:**
- `font-sans`: Body text, UI elements (default)
- `font-handwriting`: Logo, decorative headings
- `font-mono`: Code, technical content, character input

### Font Sizes

```css
text-xs:   0.75rem   /* 12px */
text-sm:   0.875rem  /* 14px */
text-base: 1rem      /* 16px - body text */
text-lg:   1.125rem  /* 18px */
text-xl:   1.25rem   /* 20px */
text-2xl:  1.5rem    /* 24px */
text-3xl:  1.875rem  /* 30px - page titles */
text-4xl:  2.25rem   /* 36px */
text-5xl:  3rem      /* 48px - section headings */
text-6xl:  3.75rem   /* 60px */
text-7xl:  4.5rem    /* 72px - hero */
```

### Font Weights

```css
font-normal:    400
font-medium:    500  /* Buttons, labels */
font-semibold:  600  /* Subheadings */
font-bold:      700  /* Headings */
```

### Line Heights

```css
leading-tight:  1.25  /* Headings */
leading-snug:   1.375
leading-normal: 1.5   /* Body text */
leading-relaxed: 1.625 /* Long-form content */
```

## Spacing

Consistent spacing using Tailwind's spacing scale (1 unit = 0.25rem = 4px).

### Common Spacing Values

```css
1:  0.25rem  /* 4px */
2:  0.5rem   /* 8px */
3:  0.75rem  /* 12px */
4:  1rem     /* 16px - base unit */
6:  1.5rem   /* 24px */
8:  2rem     /* 32px */
12: 3rem     /* 48px */
16: 4rem     /* 64px */
20: 5rem     /* 80px */
24: 6rem     /* 96px */
```

### Spacing Guidelines

- **Padding**: Use multiples of 4 (p-4, p-6, p-8)
- **Margins**: Use multiples of 4 for consistency
- **Gaps**: Use gaps 3, 4, 6, or 8 for grid/flex layouts

## Components

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">
  Click Me
</button>
```

**Styles:**
- Background: `primary-600`
- Text: `white`
- Hover: `primary-700`
- Padding: `px-4 py-2`
- Border radius: `rounded-lg`
- Font: `font-medium`
- Transition: `duration-200`

#### Secondary Button
```html
<button class="btn btn-secondary">
  Cancel
</button>
```

**Styles:**
- Background: `gray-200`
- Text: `gray-700`
- Hover: `gray-300`
- Same size/shape as primary

#### Accent Button
```html
<button class="btn btn-accent">
  Special Action
</button>
```

**Styles:**
- Background: `accent-600`
- Text: `white`
- Hover: `accent-700`

### Cards

```html
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>
```

**Styles:**
- Background: `white`
- Padding: `p-6`
- Border radius: `rounded-xl`
- Shadow: `shadow-card`
- Hover: `hover:shadow-soft`

### Input Fields

```html
<input type="text" class="input" placeholder="Enter text">
```

**Styles:**
- Width: `w-full`
- Padding: `px-4 py-2`
- Border: `border border-gray-300`
- Border radius: `rounded-lg`
- Focus: `ring-2 ring-primary-500`

### Labels

```html
<label class="label">Field Name</label>
```

**Styles:**
- Display: `block`
- Font size: `text-sm`
- Font weight: `font-medium`
- Color: `text-gray-700`
- Margin: `mb-1`

## Layout

### Container

```html
<div class="page-container">
  Content
</div>
```

**Styles:**
- Max width: `max-w-7xl`
- Margin: `mx-auto`
- Padding: `px-4 sm:px-6 lg:px-8 py-8`

### Page Title

```html
<h2 class="page-title">Page Title</h2>
```

**Styles:**
- Font size: `text-3xl`
- Font weight: `font-bold`
- Color: `text-gray-900`
- Margin: `mb-6`

### Grid Layouts

#### Feature Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- Cards -->
</div>
```

#### Character Grid
```html
<div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
  <!-- Characters -->
</div>
```

## Animations

### Fade In
```html
<div class="animate-fade-in">
  Content
</div>
```

**Keyframes:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
Duration: 0.5s ease-in-out

### Slide Up
```html
<div class="animate-slide-up">
  Content
</div>
```

**Keyframes:**
```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```
Duration: 0.4s ease-out

### Transitions

Standard transition for interactive elements:
```css
transition-all duration-200
```

For hover effects:
```css
hover:shadow-soft transition-shadow
hover:-translate-y-1 transition-transform
```

## Icons & Emojis

The app uses emojis as icons for a friendly, approachable aesthetic.

### Common Icons

```
✍️  - Handwriting/Logo
📄  - Document/Template
📸  - Upload/Camera
📤  - Upload action
💾  - Save
🗑️  - Delete/Clear
➡️  - Next/Forward
📥  - Download
✨  - Generate/Magic
💌  - Letters
🙏  - Thank you
🎉  - Celebrations
🎂  - Birthday
🏆  - Achievement
📝  - Notes
🔒  - Security
⚡  - Speed/Fast
🎨  - Customization
❤️  - Love/Like
💡  - Tip/Idea
```

### Icon Usage

- Size in headings: text-4xl to text-6xl
- Size in buttons: inline with text
- Always add aria-label for accessibility when icon is sole content

## Responsive Design

### Breakpoints

```css
sm:  640px   /* Tablets */
md:  768px   /* Small laptops */
lg:  1024px  /* Desktops */
xl:  1280px  /* Large desktops */
2xl: 1536px  /* Extra large */
```

### Mobile-First Approach

All styles default to mobile. Use modifiers for larger screens:

```html
<!-- Stack on mobile, row on desktop -->
<div class="flex flex-col md:flex-row gap-4">

<!-- 1 column mobile, 2 tablet, 3 desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Smaller text on mobile -->
<h1 class="text-4xl md:text-6xl lg:text-7xl">
```

### Touch Targets

All interactive elements have minimum 44x44px touch targets:
- Buttons: Minimum `px-4 py-2`
- Links: Adequate padding
- Form inputs: Minimum `py-2`

## Shadows

### Card Shadow
```css
shadow-card: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)
```

### Soft Shadow
```css
shadow-soft: 0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)
```

### Large Shadow
```css
shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)
```

## Accessibility

### Focus States

All interactive elements have visible focus states:
```css
focus:outline-none focus:ring-2 focus:ring-primary-500
```

### Color Contrast

All text meets WCAG AA standards:
- Normal text: Minimum 4.5:1 contrast
- Large text (18px+): Minimum 3:1 contrast

### Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<button>` for actions, `<a>` for navigation
- Use `<label>` for all form inputs
- Use semantic tags: `<nav>`, `<main>`, `<section>`, `<footer>`

## Best Practices

1. **Consistency**: Always use defined design tokens
2. **Spacing**: Use multiples of 4px (Tailwind's base unit)
3. **Colors**: Stick to the defined palette
4. **Typography**: Maintain hierarchy with size and weight
5. **Responsive**: Test on multiple screen sizes
6. **Accessibility**: Ensure keyboard navigation and screen reader support
7. **Performance**: Optimize images and minimize animations
8. **Component Reuse**: Use defined component classes (btn, card, input, etc.)

## Component Library

For component implementation examples, see:
- `src/pages/*.js` - Page components
- `src/components/*.js` - Reusable components
- `src/index.css` - Component class definitions

## Maintenance

When adding new components:
1. Follow existing patterns
2. Use defined design tokens
3. Ensure responsive behavior
4. Test accessibility
5. Update this documentation

---

*Last updated: 2025-11-17*
*Maintained by: Development Team*
