# Deploy to GitHub Pages

## Quick Push Commands:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add remote (replace with your GitHub username if needed)
git remote add origin https://github.com/Nabanaa07/Nabanaa07.github.io.git

# 3. Add all files
git add .

# 4. Commit changes
git commit -m "Update website - fix Shorts display and compact layout"

# 5. Push to GitHub
git push -u origin main
```

## If you get errors about existing repo:
```bash
git pull origin main --rebase
git push origin main
```

## After pushing:
Your site will be live at: **https://nabanaa07.github.io**

## Changes Made:
- ✅ Made video embeds more compact (smaller gap, better sizing)
- ✅ Made Shorts grid tighter and more organized  
- ✅ Added debug logging to troubleshoot Shorts display
- ✅ Regular videos max width: 1000px
- ✅ Shorts max width: 900px, centered display
