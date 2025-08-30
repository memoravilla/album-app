# Profile Images

This directory contains profile images for the founders section on the Memoravilla marketing website.

## Expected Files

The landing page component expects the following image files:

- `seiji-profile.jpg` - Profile image for Seiji Villafranca (Co-Founder & CEO)
- `michelle-profile.jpg` - Profile image for Michelle Villafranca (Co-Founder)

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Dimensions**: Square aspect ratio (1:1) recommended, minimum 400x400px
- **Size**: Optimized for web (under 500KB recommended)
- **Content**: Professional headshot or appropriate profile photo

## Fallback Behavior

If profile images are not found or fail to load, the component will automatically display initials (e.g., "SV" for Seiji Villafranca) with a beautiful gradient background and hover animations.

## How to Add Images

1. Add your profile images to this directory with the exact filenames listed above
2. Ensure the images are web-optimized
3. The component will automatically detect and display them

## Customization

To add more founders or change image paths, update the `founders` array in:
`src/app/website/components/landing.component.ts`

```typescript
founders: Founder[] = [
  {
    name: 'Your Name',
    role: 'Your Role',
    bio: 'Your bio...',
    image: 'assets/profile/your-profile.jpg'  // Update this path
  }
]
```
