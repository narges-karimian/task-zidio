# IRANYekanX Variable Font

This directory contains the IRANYekanX font family with both variable font and static font files.

## Font Files

### Variable Fonts (for modern browsers)

- `IRANYekanXVF.woff2` - Variable font in WOFF2 format (recommended)
- `IRANYekanXVF.woff` - Variable font in WOFF format

### Static Fonts (fallback for older browsers)

- `IRANYekanX-Regular.woff` - Regular weight (400)
- `IRANYekanX-Bold.woff` - Bold weight (700)

## Browser Support

Modern browsers (Chrome 62+, Firefox 62+, Safari 11+, Edge 17+, Opera 49+) will automatically use the variable font. Older browsers will fallback to static fonts.

## Variable Font Axes

The IRANYekanXVF variable font supports the following axes:

### Weight (wght)

- Range: 100-1000
- Default: 400
- Controls the thickness of strokes

### Dots (dots)

- Range: 0-4
- Default: 0
- Makes strokes thinner and diacritics sharper at higher values

## Font Features

### ss02 - Persian Numbers

Converts English/Arabic numerals to Persian numerals.

### ss03 - Monospace Numbers

Makes all numbers the same width, useful for tables and lists.

## Usage Examples

### Using Mixins (Recommended)

```scss
// Set font weight
.my-heading {
  @include font-weight(700);
}

// Set weight and dots variation
.my-sharp-text {
  @include font-variation(800, 4);
}

// Persian numbers
.persian-numbers {
  @include persian-numbers;
}

// Monospace numbers (for tables)
.table-numbers {
  @include monospace-numbers;
}

// Both Persian and monospace
.persian-table-numbers {
  @include persian-monospace-numbers;
}
```

### Using Utility Classes

```html
<!-- Weight classes -->
<p class="font-weight-light">Light text (300)</p>
<p class="font-weight-regular">Regular text (400)</p>
<p class="font-weight-medium">Medium text (500)</p>
<p class="font-weight-semibold">Semibold text (600)</p>
<p class="font-weight-bold">Bold text (700)</p>
<p class="font-weight-extrabold">Extra bold text (800)</p>
<p class="font-weight-black">Black text (900)</p>

<!-- Dots variation classes -->
<p class="font-dots-none">No dots variation (0)</p>
<p class="font-dots-low">Low dots variation (1)</p>
<p class="font-dots-medium">Medium dots variation (2)</p>
<p class="font-dots-high">High dots variation (3)</p>
<p class="font-dots-max">Maximum dots variation (4)</p>

<!-- Number formatting -->
<p class="persian-numbers">123456789 → ۱۲۳۴۵۶۷۸۹</p>
<p class="monospace-numbers">Tabular numbers</p>
<p class="persian-monospace-numbers">Persian tabular numbers</p>
```

### Using Custom CSS

```css
/* For static fonts (older browsers) */
.my-element {
  font-weight: bold;
}

/* For variable fonts (modern browsers) */
@supports (font-variation-settings: normal) {
  .my-element {
    font-weight: 700;
    font-variation-settings:
      "wght" 700,
      "dots" 2;
  }
}

/* Font features */
.persian-nums {
  font-feature-settings: "ss02";
}

.monospace-nums {
  font-feature-settings: "ss03";
}
```

## Priority

Always set both the static font property and the variable font property for maximum browser compatibility:

```css
/* Static font (older browsers) */
font-weight: bold;

/* Variable font (modern browsers, takes priority) */
font-variation-settings: "wght" 700;
```

Modern browsers will use the variable font setting, while older browsers will use the static font-weight property.

## License

This font requires a license from [www.fontiran.com](http://fontiran.com).
