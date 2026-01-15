# Poster Mockup Generator

A simple, client-side web application for creating professional poster mockups. Upload your poster images, select mockup templates, and generate high-quality mockups with customizable output sizes.

## Features

- **Automatic Size Detection**: Detects the closest standard poster size (8"×10", 11"×14", 18"×24")
- **Multiple Mockup Selection**: Select multiple mockup templates to generate in one go
- **Smart Image Placement**: Automatically places your poster in the designated area (magenta box) of each mockup
- **Customizable Output**: Choose output size by width or height (in pixels)
- **Client-Side Processing**: All processing happens in the browser - no server required
- **Drag & Drop Support**: Easy file upload with drag and drop
- **Instant Download**: Download all generated mockups individually

## How to Use

### 1. Prepare Your Mockup Templates

Create mockup images with a **pure magenta (#FF00FF)** rectangle where you want the poster to appear. The app will automatically detect this magenta area and replace it with your poster image.

Place all mockup images in the `mockups/` folder with names like:
- `frame-wall.jpg`
- `frame-table.jpg`
- `gallery-wall.jpg`
- etc.

### 2. Run the App Locally

Simply open `index.html` in your web browser. No build process or server required!

### 3. Upload Your Poster

- Click the upload area or drag and drop your poster image (JPG or PNG)
- The app will detect the closest standard poster size
- Click "Continue to Mockups"

### 4. Select Mockup Templates

- Browse available mockup templates
- Click to select one or more mockups
- Click "Continue to Generate"

### 5. Generate & Download

- Choose output dimension (width or height)
- Set the output size in pixels (default: 2000px)
- Click "Generate Mockups"
- Download each mockup individually

## Deploying to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to the project folder:
```bash
cd C:\dev\poster-mockup-maker
```

3. Deploy:
```bash
vercel
```

Follow the prompts to complete deployment.

### Option 2: Deploy via Vercel Dashboard

1. Create a GitHub repository and push this code
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
6. Click "Deploy"

### Option 3: Deploy via Drag & Drop

1. Go to [vercel.com](https://vercel.com)
2. Drag the entire project folder onto the Vercel dashboard
3. Vercel will automatically deploy your app

## Project Structure

```
poster-mockup-maker/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js              # JavaScript logic
├── mockups/            # Place your mockup images here
│   ├── frame-wall.jpg
│   ├── frame-table.jpg
│   └── ...
└── README.md           # This file
```

## Creating Mockup Templates

To create effective mockup templates:

1. Use image editing software (Photoshop, GIMP, Figma, etc.)
2. Create or import your mockup scene
3. Add a filled rectangle with **pure magenta color (#FF00FF or RGB 255, 0, 255)**
4. Position and size the rectangle where the poster should appear
5. Maintain the appropriate aspect ratio for the poster size
6. Export as JPG or PNG
7. Save to the `mockups/` folder

**Tip**: The magenta box should match the aspect ratio of your target poster size for best results.

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas API
- FileReader API
- ES6 JavaScript

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Details

- **Pure client-side**: No backend server required
- **Canvas API**: Used for image processing
- **Magenta detection**: RGB(255, 0, 255) with tolerance of ±5
- **Aspect ratio preservation**: Posters are scaled to fit while maintaining proportions
- **Progressive enhancement**: Graceful fallback if mockups aren't loaded

## License

Free to use for personal and commercial projects.

## Support

For issues or questions, please refer to the code comments or create an issue in the repository.
