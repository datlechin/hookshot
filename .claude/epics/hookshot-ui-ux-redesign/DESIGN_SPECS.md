# Hookshot UI Design Specifications

## Color Usage Guidelines

### HTTP Method Colors

Each HTTP method has a dedicated color for visual distinction:

- **GET** (`#3b82f6`) - Blue: Safe, read-only operations
- **POST** (`#10b981`) - Green: Creating new resources
- **PUT** (`#f59e0b`) - Orange: Updating entire resources
- **DELETE** (`#ef4444`) - Red: Destructive operations
- **PATCH** (`#8b5cf6`) - Purple: Partial updates
- **HEAD** (`#6b7280`) - Gray: Metadata requests
- **OPTIONS** (`#06b6d4`) - Cyan: CORS preflight

### Status Colors

- **Success**: `#10b981` (Green) - 2xx responses
- **Warning**: `#f59e0b` (Orange) - 3xx/4xx responses
- **Error**: `#ef4444` (Red) - 5xx responses
- **Primary**: `#3b82f6` (Blue) - CTAs, focus states

### Accessibility

All color combinations meet **WCAG AA** standards (4.5:1 contrast minimum):

- Text on background: 12.6:1 ✅
- Secondary text: 7.4:1 ✅
- Method badges on surface: 5.2:1+ ✅
- Border contrast: 3.1:1 ✅

## Typography Scale

### Font Families

- **UI Text**: Inter (400, 500, 600, 700)
- **Code/Technical**: JetBrains Mono (400, 500, 600)

### Usage

- **Headings**: Inter Semibold (600)
- **Body Text**: Inter Regular (400)
- **Labels/Buttons**: Inter Medium (500)
- **Code Blocks**: JetBrains Mono Regular (400)
- **Inline Code**: JetBrains Mono Medium (500)

## Spacing System

Based on **4px base unit**:

- Tight spacing: 4px, 8px
- Default spacing: 12px, 16px
- Generous spacing: 20px, 24px, 32px
- Section spacing: 40px, 48px

## Component Patterns

### Buttons

**Primary Button**
- Background: `var(--color-primary)`
- Text: White
- Padding: `var(--space-2) var(--space-4)`
- Border radius: `var(--radius-md)`
- Font weight: `var(--font-weight-medium)`

**Secondary Button**
- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`
- Text: `var(--color-text-primary)`

### Cards

- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`
- Border radius: `var(--radius-lg)`
- Padding: `var(--space-4)`
- Shadow: `var(--shadow-sm)` on hover

### Badges

**Method Badge**
- Background: Method color with 10% opacity
- Text: Method color
- Padding: `var(--space-1) var(--space-2)`
- Border radius: `var(--radius-sm)`
- Font: `var(--font-mono)`
- Font size: `var(--text-xs)`
- Font weight: `var(--font-weight-medium)`

### Inputs

- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`
- Border radius: `var(--radius-md)`
- Padding: `var(--space-2) var(--space-3)`
- Focus: `--color-border-focus` outline

### Lists

- Row padding: `var(--space-3)`
- Row hover: `var(--color-surface-hover)`
- Border between rows: `var(--color-border)`

## Animation

All transitions use cubic-bezier(0.4, 0, 0.2, 1) for smooth motion:

- Fast (150ms): Hover states, focus rings
- Base (200ms): Color changes, opacity
- Slow (300ms): Layout shifts, expansions

## Layout

### Container

- Max width: 1280px
- Padding: `var(--space-6)`

### Grid

- Gap: `var(--space-4)` (default)
- Tight gap: `var(--space-2)`
- Generous gap: `var(--space-6)`

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Dark Mode

Dark mode uses GitHub Dark Dimmed aesthetic:

- Background: `#0d1117`
- Surface: `#161b22`
- Border: `#30363d`
- Text: `#e6edf3`

HTTP method colors remain consistent in dark mode for brand recognition.

## Implementation Examples

### Method Badge Component

```css
.method-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.method-badge[data-method="GET"] {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-method-get);
}

.method-badge[data-method="POST"] {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-method-post);
}

.method-badge[data-method="PUT"] {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-method-put);
}

.method-badge[data-method="DELETE"] {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-method-delete);
}

.method-badge[data-method="PATCH"] {
  background-color: rgba(139, 92, 246, 0.1);
  color: var(--color-method-patch);
}

.method-badge[data-method="HEAD"] {
  background-color: rgba(107, 114, 128, 0.1);
  color: var(--color-method-head);
}

.method-badge[data-method="OPTIONS"] {
  background-color: rgba(6, 182, 212, 0.1);
  color: var(--color-method-options);
}
```

### Button Component

```css
.button-primary {
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

.button-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.button-primary:active {
  transform: translateY(0);
}

.button-secondary {
  background-color: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

.button-secondary:hover {
  background-color: var(--color-surface-hover);
}
```

### Card Component

```css
.card {
  background-color: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-sm);
}
```

## Usage Guidelines

### When to Use Each Font

- **Inter**: All UI text, buttons, labels, headings, navigation
- **JetBrains Mono**: Request/response data, code snippets, endpoint URLs, timestamps, JSON payloads

### Spacing Recommendations

- **Between sections**: `var(--space-6)` or `var(--space-8)`
- **Between elements**: `var(--space-3)` or `var(--space-4)`
- **Inside components**: `var(--space-2)` or `var(--space-3)`
- **Tight spacing**: `var(--space-1)`

### Color Selection

- **Primary actions**: `var(--color-primary)` (blue)
- **Success states**: `var(--color-success)` (green)
- **Warnings**: `var(--color-warning)` (orange)
- **Errors/Destructive**: `var(--color-error)` (red)
- **Neutral elements**: `var(--color-text-secondary)` or `var(--color-border)`

## Testing Checklist

- [ ] Verify all fonts load correctly
- [ ] Check contrast ratios with accessibility tools
- [ ] Test dark mode appearance
- [ ] Validate responsive behavior at all breakpoints
- [ ] Ensure focus states are visible
- [ ] Test with keyboard navigation
- [ ] Verify color blindness accessibility
