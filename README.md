# Svadba

A wedding invitation website. Guests open the page, read the details, and confirm whether they are coming. Each reply is appended to your Google Doc:

https://docs.google.com/document/d/1mPhkyJ99Aeg9KxtTkmbV-iJttewYWzK9_9UuIE2IBKw/edit

## 1. Put your wedding on the page

Open `js/config.js` and change names, date, venue, schedule, and wording.

## 2. Connect the Google Doc (RSVP)

The website cannot write to Google Docs by itself. A small script inside **that** document receives the form and appends the reply.

1. Open the [Svadba Google Doc](https://docs.google.com/document/d/1mPhkyJ99Aeg9KxtTkmbV-iJttewYWzK9_9UuIE2IBKw/edit).
2. **Extensions → Apps Script**. Delete any starter code.
3. Paste the contents of `sheets/Code.gs`. Save (the disk icon).
4. In the function dropdown, choose `testDocAccess` and press **Run**. Accept Google’s permission prompt the first time (it will ask to edit your documents).
5. **Deploy → New deployment**
   - Gear icon next to *Select type* → **Web app**
   - Description: `rsvp`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy**
6. Copy the web-app URL. It looks like `https://script.google.com/macros/s/…/exec`.
7. Paste that URL into `js/config.js`:

```js
rsvp: {
  googleScriptUrl: "https://script.google.com/macros/s/PASTE_YOUR_ID/exec",
```

8. Reload the wedding site, send a test RSVP, and confirm a new block appears in the Google Doc.

If you edit `Code.gs` later, deploy a **new version** (Deploy → Manage deployments → pencil → New version). The URL stays the same.

### Optional invite codes

Leave `inviteCodes: []` to let anyone reply. To keep the form private:

```js
inviteCodes: ["garden-12", "family-07"]
```

## 3. Preview locally

```bash
python3 -m http.server 8765
```

Open http://127.0.0.1:8765

## 4. Publish

GitHub Pages, Netlify, or Cloudflare Pages all work. There is no build step — upload the folder as-is.

## What guests send you

Each reply adds a dated block to the document with name, yes/no, guest count, extra names, meal, song request, and message.

Replies are also saved in the guest’s browser (`localStorage`) as a backup.
