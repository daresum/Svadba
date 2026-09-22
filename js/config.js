/* =============================================================================
   SVADBA — wedding details
   Edit this file first. Names, date, venue, and the Google Form live here.
   Drop a photo of you both at assets/images/us.png
   ============================================================================= */

window.SVADBA = {
  couple: {
    partner1: { en: "Darko", mk: "Дарко" },
    partner2: { en: "Ljubica", mk: "Љубица" },
    monogram: { en: "D & Lj", mk: "Д & Љ" },
  },

  /* ISO date with timezone. Used for the calendar file. */
  date: {
    iso: "2026-10-17T19:00:00+02:00",
    endIso: "2026-10-18T00:00:00+02:00",
    rsvpDeadlineIso: "2026-10-10",
  },

  venue: {
    name: {
      en: "Porta Jazz",
      mk: "Porta Jazz",
    },
    address: {
      en: "Sts. Cyril and Methodius, Bitola",
      mk: "Св. Кирил и Методиј, Битола",
    },
    mapsUrl: "https://maps.app.goo.gl/p6divEkJfPqGLHpm8",
    lat: 41.0287694,
    lng: 21.3336388,
  },

  photo: "assets/images/us.png",

  contact: {
    email: "rsvp@example.com",
    phone: "",
  },

  rsvp: {
    googleFormAction:
      "https://docs.google.com/forms/d/e/1FAIpQLSdaP9yzbkOcUAM6KFeYDJZik9pyWjp594wC8rz1RPQebk-DtA/formResponse",
    attendingEntry: "entry.137250545",
    nameEntry: "entry.1317282026",
    songEntry: "entry.2033427921",
    attendingValues: { yes: "Да", no: "Не" },
  },

  defaultLang: "mk",

  i18n: {
    en: {
      metaTitle: "Darko & Ljubica",
      place: {
        maps: "Map",
      },
      rsvp: {
        title: "Will you attend?",
        yes: "Yes",
        no: "No",
        name: "Full name",
        song: "A song that would get you dancing?",
        submit: "Send",
        sending: "Sending…",
        successYes: "Thank you. We cannot wait to see you.",
        successNo: "Thank you for letting us know.",
        error: "Something went wrong. Please try again.",
        required: "Please add your name and say whether you will come.",
      },
    },
    mk: {
      metaTitle: "Дарко & Љубица",
      dateLong: "Сабота, 17 Октомври 2026",
      place: {
        maps: "Мапа",
      },
      rsvp: {
        kicker: "Ве молиме одговорете",
        title: "Дали ќе присуствувате?",
        yes: "Да",
        no: "Не",
        name: "Име и презиме",
        song: "Песна која ќе ве натера да играте?",
        submit: "Испрати",
        sending: "Се испраќа…",
        successYes: "Ви благодариме. Со нетрпение ве чекаме.",
        successNo: "Ви благодариме што ни јавивте.",
        error: "Нешто тргна наопаку. Обидете се повторно.",
        required: "Ве молиме внесете име и кажете дали ќе присуствувате.",
      },
    },
  },
};
