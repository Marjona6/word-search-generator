# Deployment Guide

## GitHub Pages Deployment

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., `word-search-generator`)
5. Make it **Public** (required for free GitHub Pages)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

### Step 2: Upload Files

#### Option A: Using GitHub Web Interface

1. In your new repository, click "uploading an existing file"
2. Drag and drop all project files:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
3. Add a commit message: "Initial commit"
4. Click "Commit changes"

#### Option B: Using Git Command Line

```bash
# Clone the repository
git clone https://github.com/yourusername/word-search-generator.git
cd word-search-generator

# Copy your project files here
# Then commit and push
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section (in the left sidebar)
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch (or "master" if that's your default)
6. Click "Save"

### Step 4: Access Your Site

Your site will be available at:

```
https://yourusername.github.io/word-search-generator
```

**Note**: It may take a few minutes for the site to become available.

## Alternative Deployment Options

### Netlify (Drag & Drop)

1. Go to [Netlify](https://netlify.com)
2. Sign up/login with your GitHub account
3. Drag and drop your project folder to the deployment area
4. Your site will be live instantly with a random URL
5. You can customize the URL in the site settings

### Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Deploy with default settings

### Local Testing

Before deploying, test locally:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Then open http://localhost:8000 in your browser
```

## Troubleshooting

### Common Issues

1. **Site not loading**: Wait 5-10 minutes for GitHub Pages to build
2. **404 errors**: Make sure all file paths are relative (no leading `/`)
3. **Styling issues**: Check that Tailwind CSS CDN is loading properly
4. **PDF download not working**: Ensure html2pdf.js is loading correctly

### File Structure Check

Your repository should look like this:

```
word-search-generator/
├── index.html
├── styles.css
├── script.js
├── README.md
└── DEPLOYMENT.md
```

### Browser Console

If something isn't working:

1. Open browser developer tools (F12)
2. Check the Console tab for errors
3. Check the Network tab to ensure all files are loading

## Custom Domain (Optional)

To use a custom domain:

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In GitHub Pages settings, enter your domain
3. Add a `CNAME` file to your repository with your domain
4. Configure DNS with your domain provider

---

**Your word search generator is now live! 🎉**
