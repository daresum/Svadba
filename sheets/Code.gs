/**
 * Svadba RSVP → Google Doc
 *
 * Bind this script to the wedding document, then deploy it as a web app.
 *
 * Document:
 * https://docs.google.com/document/d/1mPhkyJ99Aeg9KxtTkmbV-iJttewYWzK9_9UuIE2IBKw/edit
 *
 * Setup:
 * 1. Open that Google Doc.
 * 2. Extensions → Apps Script. Delete any starter code.
 * 3. Paste this file. Save.
 * 4. Deploy → New deployment → Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Copy the web-app URL into js/config.js → rsvp.googleScriptUrl
 * 6. After every edit here, Deploy → Manage deployments → pencil → New version.
 */

var DOC_ID = "1mPhkyJ99Aeg9KxtTkmbV-iJttewYWzK9_9UuIE2IBKw";

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (params.name) {
      appendRsvp_(params);
      return json_({ ok: true });
    }
    return json_({ ok: true, service: "svadba-rsvp" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = (e && e.parameter) || {};
      }
    } else {
      data = (e && e.parameter) || {};
    }
    if (!data.name) {
      return json_({ ok: false, error: "Missing name" });
    }
    appendRsvp_(data);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function appendRsvp_(data) {
  var doc = DocumentApp.openById(DOC_ID);
  var body = doc.getBody();
  ensureTitle_(body);

  var attending = String(data.attending || "").toLowerCase() === "yes" ? "Yes" : "No";
  var when = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");

  body.appendParagraph("");
  body.appendParagraph("────────────").setBold(false);
  body.appendParagraph(when).setBold(false);
  body.appendParagraph("Name: " + (data.name || ""));
  body.appendParagraph("Coming: " + attending);

  if (attending === "Yes") {
    body.appendParagraph("Guests: " + (data.guests || "1"));
    if (data.extraNames) body.appendParagraph("Additional guests: " + data.extraNames);
    if (data.meal) body.appendParagraph("Meal: " + data.meal);
    if (data.song) body.appendParagraph("Song: " + data.song);
  }

  if (data.message) body.appendParagraph("Message: " + data.message);
  if (data.inviteCode) body.appendParagraph("Invite code: " + data.inviteCode);
  if (data.language) body.appendParagraph("Language: " + data.language);
}

function ensureTitle_(body) {
  var text = body.getText() || "";
  if (text.replace(/\s/g, "").length === 0) {
    body.clear();
    body.appendParagraph("Svadba RSVPs").setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph("Guest replies from the wedding website.").setItalic(true);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the Apps Script editor to confirm the document opens. */
function testDocAccess() {
  var doc = DocumentApp.openById(DOC_ID);
  Logger.log(doc.getName());
}
