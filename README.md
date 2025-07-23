# Word Search Puzzle Generator

A simple, browser-based word search puzzle generator that creates printable puzzles entirely in the browser. Perfect for teachers, students, and parents who want to create custom word search activities.

## ✨ Features

- **Custom Word Lists**: Enter your own words, one per line
- **Flexible Grid Sizes**: Choose from 10x10, 12x12, 13x13, 14x14, 15x15, 18x18, or 20x20 grids
- **Multiple Directions**: Support for horizontal, vertical, diagonal, and reverse word placement
- **Smart Placement**: Advanced algorithm tries to fit all words with overlap, only warns if some can't be placed
- **Printable Output**: Clean, print-friendly layout
- **PDF Download**: Export puzzles as PDF files
- **Solution Toggle**: Show/hide the solution for easy checking
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **No Backend Required**: Everything runs in the browser for privacy and simplicity

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Enter your words** in the text area (one per line)
4. **Select options** (grid size, directions)
5. **Click "Generate Puzzle"**
6. **Print or download** your puzzle!

## 📁 Project Structure

```
word-search-generator/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript logic
└── README.md           # This file
```

## 🛠️ How It Works

### Puzzle Generation Algorithm

1. **Input Validation**: Checks word count, length, and direction options
2. **Grid Initialization**: Creates an empty grid of the specified size
3. **Word Placement**: Uses a backtracking algorithm to place words:
   - Randomly selects starting positions and directions
   - Checks for conflicts with existing letters
   - Places words that fit, restarts if conflicts occur
4. **Fill Remaining**: Populates empty cells with random letters
5. **Solution Tracking**: Maintains a separate grid showing word locations

### Key Features

- **Conflict Resolution**: Automatically handles overlapping letters
- **Direction Support**: 8 possible directions (4 with reverse option)
- **Retry Logic**: Attempts multiple placements to ensure all words fit
- **Performance Optimized**: Efficient algorithms for quick generation

## 🎨 Customization

### Styling

The project uses Tailwind CSS via CDN. You can customize the appearance by:

1. **Modifying `styles.css`** for custom grid styles
2. **Updating Tailwind classes** in `index.html`
3. **Adjusting print styles** in the CSS media queries

### Functionality

Extend the generator by modifying `script.js`:

- Add new direction options
- Implement different grid shapes
- Add word categories or themes
- Include difficulty levels

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Create a new repository** on GitHub
2. **Upload all files** to the repository
3. **Go to Settings** → Pages
4. **Select source**: "Deploy from a branch"
5. **Choose branch**: `main` (or `master`)
6. **Save** - your site will be available at `https://username.github.io/repository-name`

### Other Hosting Options

- **Netlify**: Drag and drop the folder to deploy
- **Vercel**: Connect your GitHub repository
- **Any static hosting**: Upload files to any web server

## 🔧 Development

### Local Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/word-search-generator.git
   cd word-search-generator
   ```

2. **Open in browser**:

   ```bash
   # Using Python (if installed)
   python -m http.server 8000

   # Using Node.js (if installed)
   npx serve .

   # Or simply open index.html in your browser
   ```

3. **Make changes** and refresh the browser to see updates

### File Structure Details

- **`index.html`**: Main layout with Tailwind CSS classes
- **`styles.css`**: Custom styles for grid rendering and print layout
- **`script.js`**: Complete puzzle generation logic in ES6 class format

## 🎯 Future Enhancements

- [ ] Word categories and themes
- [ ] Different grid shapes (circles, hearts, etc.)
- [ ] Difficulty levels
- [ ] Word hints or definitions
- [ ] Multiple puzzle formats
- [ ] Save/load puzzle configurations
- [ ] Social sharing features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with vanilla JavaScript for maximum compatibility
- Uses [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for PDF generation
- Styled with [Tailwind CSS](https://tailwindcss.com/) for rapid development

---

**Happy puzzling! 🧩**
