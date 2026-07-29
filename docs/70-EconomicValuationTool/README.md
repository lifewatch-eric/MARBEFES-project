# Economic Valuation Tool — GitHub Pages

Static browser version of **03 EconomicValuationEVTool.xlsx**.

## Publish in the MaRBEFES project branch

1. Copy all files from this folder into the same GitHub branch/folder used for the previous tool.
2. Commit and push the files.
3. In the repository, open **Settings → Pages**.
4. Select **Deploy from a branch**, choose the MaRBEFES project branch and the folder containing `index.html`.
5. GitHub will display the public URL after deployment.

Keep these files together:

- `index.html`
- `styles.css`
- `app.js`
- `workbook-data.js`
- `original-tool.xlsx`

Each visitor receives a clean independent version. Entries are stored only in that visitor’s browser using `localStorage`; they are not written back to GitHub or shared with other visitors.
