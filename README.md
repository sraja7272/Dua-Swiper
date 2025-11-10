# Duas Swiper

A mobile-friendly web app that lets you sign in with Google, link your spreadsheet with Name/Duas columns, and swipe through beautiful duas cards. Built with React, Vite, and Tailwind CSS.

## Features

- **Google OAuth Authentication** - Secure sign-in with your Google account
- **Google Sheets Integration** - Link any spreadsheet with "Name" and "Duas" columns
- **Swipeable Cards** - Intuitive touch/mouse gestures for browsing duas
- **Mobile-First Design** - Beautiful, responsive UI that works on all devices
- **Client-Side Only** - No backend required, all data stays in your browser
- **Persistent State** - Remembers your last spreadsheet and authentication

## Live Demo

Once deployed, your app will be available at: `https://[your-username].github.io/[repo-name]/`

## Prerequisites

- **Node.js 20.19+ or 22.12+** (required for Vite 7)
  - If using nvm, run `nvm use` to automatically switch to the correct version (specified in `.nvmrc`)
- npm 10+ or yarn
- A Google Cloud account (free)
- A Google Spreadsheet with "Name" and "Duas" columns

## Google Cloud Setup

Before running the app, you need to set up Google OAuth credentials:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Give it a name (e.g., "Duas Swiper")

### 2. Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable:
   - **Google Sheets API**
   - **Google Picker API** (optional, for better UX)

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Configure the consent screen if prompted:
   - User Type: External (for public use) or Internal (for organization only)
   - Fill in the required fields (App name, user support email, developer email)
   - Add scopes: `https://www.googleapis.com/auth/spreadsheets.readonly`
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Duas Swiper Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - `https://[your-username].github.io` (for production - add after deployment)
   - No redirect URIs needed (client-side flow)
5. Click "Create" and copy your **Client ID**

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

Replace `your_client_id_here` with the Client ID you copied.

**Note:** The Client ID is safe to expose in client-side code. This is standard for OAuth 2.0 web applications.

## Local Development

### Installation

```bash
# Clone the repository
git clone https://github.com/[your-username]/[repo-name].git
cd [repo-name]

# Switch to the correct Node.js version (if using nvm)
nvm use

# Install dependencies
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your Google Client ID

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Deployment to GitHub Pages

### 1. Update Configuration

In `vite.config.js`, ensure the `base` path matches your repository name:

```javascript
base: '/', // GitHub Pages base path - update if your repo name is different
```

### 2. Set Up GitHub Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/[your-username]/[repo-name].git
git branch -M main
git push -u origin main
```

### 3. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" > "Pages"
3. Under "Build and deployment":
   - Source: GitHub Actions

### 4. Add GitHub Secret

1. Go to "Settings" > "Secrets and variables" > "Actions"
2. Click "New repository secret"
3. Name: `VITE_GOOGLE_CLIENT_ID`
4. Value: Your Google OAuth Client ID
5. Click "Add secret"

### 5. Deploy

Push to the `main` branch to trigger deployment:

```bash
git push origin main
```

The GitHub Action will automatically build and deploy your app.

### 6. Update Google Cloud Console

After your app is deployed:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click your OAuth 2.0 Client ID
4. Add your production URL to "Authorized JavaScript origins":
   - `https://[your-username].github.io`
5. Click "Save"

## Usage

### For Users

1. **Sign In**
   - Click "Sign in with Google"
   - Authorize the app to access your Google Sheets

2. **Link Your Spreadsheet**
   - Create a Google Spreadsheet with these columns:
     - `Name` (or `author`)
     - `Duas` (or `quote`, `text`, or `content`)
   - Make sure you have access to the spreadsheet
   - Copy the spreadsheet URL
   - Paste it into the input field
   - Click "Load Spreadsheet"

3. **Swipe Through Duas**
   - Swipe left or right on mobile
   - Click the arrow buttons on desktop
   - Use the undo button to go back
   - Click "Load Different Spreadsheet" to change sources

### Spreadsheet Format

Your Google Spreadsheet should look like this:

| Name | Duas |
|------|------|
| Morning Dua | اللهم إني أصبحت أشهدك وأشهد حملة عرشك وملائكتك وجميع خلقك أنك أنت الله لا إله إلا أنت وحدك لا شريك لك وأن محمداً عبدك ورسولك |
| Evening Dua | اللهم إني أمسيت أشهدك وأشهد حملة عرشك وملائكتك وجميع خلقك أنك أنت الله لا إله إلا أنت وحدك لا شريك لك وأن محمداً عبدك ورسولك |
| Before Eating | بسم الله |

**Requirements:**
- First row must be headers
- Must have columns named "Name" and "Duas" (case-insensitive)
- Alternative column names: "author" for Name, "quote", "text", or "content" for Duas
- Empty rows are automatically skipped

## Technology Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **Authentication:** @react-oauth/google
- **Swipe Functionality:** react-tinder-card
- **API Calls:** axios
- **Deployment:** GitHub Pages (via GitHub Actions)

## Project Structure

```
[repo-name]/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── public/                      # Static assets
├── src/
│   ├── components/
│   │   ├── GoogleLogin.jsx     # OAuth authentication component
│   │   ├── SpreadsheetInput.jsx # Spreadsheet URL input and loading
│   │   ├── QuoteCard.jsx       # Individual duas card display
│   │   └── CardDeck.jsx        # Swipeable card stack
│   ├── utils/
│   │   ├── sheetsApi.js        # Google Sheets API integration
│   │   └── parseSpreadsheetUrl.js # URL parsing utility
│   ├── App.jsx                 # Main app component with state management
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles and Tailwind config
├── .env.local                   # Environment variables (not in git)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                    # This file
```

## Security & Privacy

- **Client-Side Only:** No backend server, no data storage
- **OAuth Security:** Standard Google OAuth 2.0 flow
- **Token Management:** Access tokens stored in browser localStorage
- **Token Expiry:** Automatically handled (Google tokens expire after 1 hour)
- **Data Privacy:** Your spreadsheet data never leaves your browser
- **Permissions:** App only requests read-only access to spreadsheets

## Troubleshooting

### "Setup Required" Error

- Make sure `.env.local` exists with `VITE_GOOGLE_CLIENT_ID`
- Restart the development server after creating the env file

### Authentication Failed

- Check that your Client ID is correct
- Verify authorized JavaScript origins in Google Cloud Console
- Make sure you're using the correct Google account

### Spreadsheet Not Loading

- Verify you have access to the spreadsheet
- Check that columns are named "Name" and "Duas"
- Try making the spreadsheet public ("Anyone with the link can view")
- Check browser console for detailed error messages

### "Access Denied" Error

- The spreadsheet must be accessible to you
- Either you own it, or it's shared with you, or it's public
- Go to spreadsheet > Share > Change to "Anyone with the link"

### Deployment Issues

- Verify `VITE_GOOGLE_CLIENT_ID` is set in GitHub Secrets
- Check that GitHub Pages is enabled in repository settings
- Ensure the base path in `vite.config.js` matches your repo name
- Add production URL to authorized origins in Google Cloud Console

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI powered by [Tailwind CSS](https://tailwindcss.com/)
- Swipe interactions via [react-tinder-card](https://github.com/3DJakob/react-tinder-card)
- Authentication via [Google OAuth](https://developers.google.com/identity/protocols/oauth2)

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for duas lovers everywhere
