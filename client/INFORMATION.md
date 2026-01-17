# 📋 Project File Structure

A simple guide to understand what each file does in this EV Charger Finder app.

---

## 🎯 Core Application Files

### `/src/app/App.tsx`
**Main application component** - Contains all the logic for the EV charger finder, including:
- Home page with map and station list
- Account page with user profile
- Dark mode toggle
- Bottom navigation (Home/Activity/Account)
- Search and filter functionality

---

## 🧩 Components

### `/src/app/components/StationCard.tsx`
**Charging station card component** - Displays individual station info:
- Station name, address, distance
- Charger type and pricing
- Availability status
- Station image

### `/src/app/components/ui/` (folder)
**Reusable UI components** - Pre-built components from shadcn/ui library:
- `button.tsx` - Buttons with different styles
- `select.tsx` - Dropdown select menus
- `switch.tsx` - Toggle switches
- `dialog.tsx` - Modal dialogs
- And many more ready-to-use components

### `/src/app/components/figma/ImageWithFallback.tsx`
**Image component with fallback** - Displays images with error handling (Protected file - don't modify)

---

## 🔌 Backend Integration

### `/src/services/api.ts`
**API service layer** - **MAIN FILE TO CONNECT YOUR BACKEND**:
- `fetchNearbyStations()` - Get charging stations from your API
- `getUserProfile()` - Get user profile data
- `bookCharger()` - Create charging bookings
- Replace mock data with your real API endpoints here

### `/src/constants/options.ts`
**Static dropdown options** - Lists of choices for:
- Car models (Tata Nexon EV, MG ZS EV, etc.)
- Payment methods (Google Pay, UPI, Cash, etc.)
- Distance ranges (1km, 2km, 5km, etc.)

---

## 🎨 Styling Files

### `/src/styles/theme.css`
**Theme colors and design tokens** - Defines:
- Light and dark mode colors
- Custom scrollbar styling (sleek 6px bars)
- Typography defaults
- CSS variables for consistent design

### `/src/styles/tailwind.css`
**Tailwind CSS configuration** - Base Tailwind setup

### `/src/styles/index.css`
**Global styles** - Main stylesheet that imports everything

### `/src/styles/fonts.css`
**Font imports** - Add Google Fonts or custom fonts here

---

## 📚 Documentation

### `/INTEGRATION_GUIDE.md`
**Backend integration guide** - Detailed instructions on:
- How to connect your API
- Where to add authentication
- How to handle tokens
- Example code snippets
- State management tips

### `/INFORMATION.md` (this file)
**Project overview** - Simple explanation of all project files

### `/ATTRIBUTIONS.md`
**Credits and licenses** - Attribution for images and resources used

---

## ⚙️ Configuration Files

### `/package.json`
**Project dependencies** - Lists all installed npm packages and scripts

### `/vite.config.ts`
**Vite bundler config** - Build tool configuration

### `/postcss.config.mjs`
**PostCSS config** - CSS processing configuration for Tailwind

---

## 🚀 Quick Start for Backend Integration

1. **Open** `/src/services/api.ts`
2. **Replace** the mock functions with your API endpoints
3. **Add** your API base URL and authentication token
4. **Test** each function (fetch stations, user profile, bookings)
5. **Done** - Your backend is connected!

---

## 📝 Important Notes

- ✅ All UI is already built and responsive
- ✅ Dark mode works throughout the app
- ✅ Loading states are handled
- ✅ Animations are smooth and modern
- 🔌 Just connect your backend API
- 📱 Mobile-friendly design
- 🎨 Clean, modern scrollbars
- 🔒 Ready for authentication

---

## 🛠️ Need to Modify?

- **Change colors/theme** → `/src/styles/theme.css`
- **Add new car models** → `/src/constants/options.ts`
- **Connect backend** → `/src/services/api.ts`
- **Modify UI logic** → `/src/app/App.tsx`
- **Customize station card** → `/src/app/components/StationCard.tsx`

---

## 💡 Tips

- Keep code modular - don't put everything in App.tsx
- Use the service layer (`api.ts`) for all backend calls
- Follow the existing patterns when adding features
- Test dark mode when making UI changes
- Check INTEGRATION_GUIDE.md for detailed backend setup

---

**Happy Coding! ⚡🚗**
