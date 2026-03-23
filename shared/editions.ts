/**
 * @file shared/editions.ts
 * @author Paul Fleury <hello@paulfleury.com>
 * @version 2.3.0
 *
 * Cup of News — Edition Registry
 *
 * v2.2.0: Simplified from 8 editions to 3.
 *
 * WHY 3 EDITIONS (not 8):
 *   The original 8 editions (en-WORLD, en-US, en-CA, en-GB, fr-FR, fr-CA, de-DE, en-AU)
 *   created too many variants of essentially the same English content. Five of the eight
 *   editions were in English with only minor regional focus differences — readers switching
 *   between them would see largely the same 20 stories with slightly different framing.
 *
 *   Three editions with fully independent RSS source pools is cleaner and more impactful:
 *   each edition genuinely reads differently because it draws from different publications
 *   in different languages. The English edition covers global news from an international
 *   English-language perspective. The French edition draws from French press (Le Monde,
 *   RFI, France 24, L'Équipe). The German edition draws from German press (DW, Spiegel,
 *   FAZ, Kicker). The 20 topics are genuinely different — not just translations.
 *
 * EDITION IDs (BCP 47):
 *   "en" — English, global perspective
 *   "fr" — Français
 *   "de" — Deutsch
 *
 * DEFAULT: English ("en")
 *
 * RSS SOURCE STRATEGY:
 *   English: international wire services + major English broadsheets + global tech/science press
 *   French: French-language primary sources first (RFI, France 24, AFP FR, Le Monde, Le Figaro,
 *            L'Équipe, Les Échos), then 2-3 English wires for global context
 *   German: German-language primary sources first (DW, Spiegel, FAZ, SZ, Zeit, Kicker, Handelsblatt),
 *            then 2-3 English wires for global context
 *
 *   Key design: non-English editions receive primarily native-language RSS content so the AI
 *   summarises from authentic source material rather than translating English wire copy.
 *   This is the difference between "French journalism" and "English journalism in French."
 */

// ─── Edition Type ──────────────────────────────────────────────────────────────

export interface Edition {
  /** BCP 47 language tag — used as DB key and localStorage key */
  id: "en" | "fr" | "de";

  /** Display name */
  name: string;

  /** Flag emoji */
  flag: string;

  /** ISO 639-1 language code */
  language: "en" | "fr" | "de";

  /** Language name in that language */
  languageName: string;

  /** Short description for the edition picker */
  description: string;

  /**
   * Language instruction injected as the FIRST rule in the AI system prompt.
   * Written in both English (so the model parses it) and the target language
   * (reinforcement signal that activates native-language generation pathways).
   */
  aiLanguageInstruction: string;

  /**
   * Regional and editorial focus — adjusts story selection priorities.
   * For French: French politics, EU affairs, Ligue 1, francophone Africa.
   * For German: Bundestag, DAX, Bundesliga, DACH region.
   */
  aiRegionalFocus: string;

  /**
   * Sport slot instruction — adapted per language/culture.
   * Sports coverage differs significantly: French readers want football (Ligue 1),
   * rugby, tennis, cycling. German readers want Bundesliga, Formel 1, handball.
   */
  aiSportSlot: string;

  /**
   * Category names in the target language for the AI to use in JSON output.
   * The AI is instructed to use exactly these strings as "category" values.
   */
  categories: Record<string, string>;

  /**
   * Reader UI strings — localised interface labels.
   * All strings visible in the reader interface are edition-aware.
   */
  ui: {
    readSources: string;
    closingThought: string;
    noDigestYet: string;
    noDigestSub: string;
    fallbackNotice: string;
    generateLink: string;
    prevStory: string;
    nextStory: string;
    allStories: string;
    of: string;
  };
}

// ─── Edition Registry ─────────────────────────────────────────────────────────

export const EDITIONS: Edition[] = [
  // ── English ────────────────────────────────────────────────────────────────
  {
    id: "en",
    name: "English",
    flag: "🌐",
    language: "en",
    languageName: "English",
    description: "Global English edition — international perspective",
    aiLanguageInstruction: "Write all titles, summaries and the closing quote in English.",
    aiRegionalFocus:
      "Provide genuinely global coverage. No single country or region should dominate. " +
      "Actively seek stories from underrepresented regions: Africa, South America, Southeast Asia, " +
      "Central Asia, Pacific Islands. English-language sources are your primary pool.",
    aiSportSlot: "any major international sport (football/soccer, tennis, F1, athletics, basketball, cricket, rugby)",
    categories: {
      Technology: "Technology", Science: "Science", Business: "Business",
      Politics: "Politics", World: "World", Culture: "Culture",
      Health: "Health", Environment: "Environment", Sports: "Sports", Other: "Other",
    },
    ui: {
      readSources: "Read sources",
      closingThought: "Today's Thought",
      noDigestYet: "No digest yet",
      noDigestSub: "Generate and publish a digest from the admin panel.",
      fallbackNotice: "not generated yet — showing latest available.",
      generateLink: "Generate →",
      prevStory: "Prev",
      nextStory: "Next",
      allStories: "All Stories",
      of: "of",
    },
  },

  // ── Français ───────────────────────────────────────────────────────────────
  {
    id: "fr",
    name: "Français",
    flag: "🇫🇷",
    language: "fr",
    languageName: "Français",
    description: "Édition française — actualité mondiale en français",
    aiLanguageInstruction:
      "RÈGLE ABSOLUE : Écris TOUS les champs en FRANÇAIS. " +
      "This is a French-language edition. Every single output field must be in French: " +
      "title (titre), summary (résumé), closingQuote (citation), closingQuoteAuthor (attribution). " +
      "AUCUN mot en anglais dans les titres ou résumés.",
    aiRegionalFocus:
      "Prioritise stories relevant to French readers: politique française (Élysée, Assemblée, partis), " +
      "économie française (CAC 40, entreprises françaises, emploi), Union européenne, " +
      "culture française (cinéma, littérature, gastronomie), Afrique francophone. " +
      "Inclure au moins 8 histoires de portée internationale (hors France). " +
      "Sources en français en priorité: RFI, France 24, Le Monde, Le Figaro, AFP.",
    aiSportSlot:
      "football (Ligue 1, équipe de France, Champions League), rugby, tennis, cyclisme, Formule 1",
    categories: {
      Technology: "Technologie", Science: "Science", Business: "Économie",
      Politics: "Politique", World: "Monde", Culture: "Culture",
      Health: "Santé", Environment: "Environnement", Sports: "Sport", Other: "Autre",
    },
    ui: {
      readSources: "Lire les sources",
      closingThought: "Pensée du jour",
      noDigestYet: "Aucun digest disponible",
      noDigestSub: "Générez et publiez un digest depuis le panneau d'administration.",
      fallbackNotice: "pas encore généré — affichage de la dernière édition disponible.",
      generateLink: "Générer →",
      prevStory: "Préc.",
      nextStory: "Suiv.",
      allStories: "Toutes les actualités",
      of: "sur",
    },
  },

  // ── Deutsch ────────────────────────────────────────────────────────────────
  {
    id: "de",
    name: "Deutsch",
    flag: "🇩🇪",
    language: "de",
    languageName: "Deutsch",
    description: "Deutsche Ausgabe — Weltnachrichten auf Deutsch",
    aiLanguageInstruction:
      "ABSOLUTE REGEL: Schreibe ALLE Felder auf DEUTSCH. " +
      "This is a German-language edition. Every single output field must be in German: " +
      "title (Titel), summary (Zusammenfassung), closingQuote (Zitat), closingQuoteAuthor (Zuschreibung). " +
      "KEIN englisches Wort in Titeln oder Zusammenfassungen.",
    aiRegionalFocus:
      "Prioritisiere Nachrichten für deutschsprachige Leser: deutsche Politik (Bundestag, Bundesregierung, Parteien), " +
      "deutsche Wirtschaft (DAX, Mittelstand, Energiewende, Automobilindustrie), " +
      "EU-Politik (Deutschland als zentraler EU-Akteur), DACH-Region (Österreich, Schweiz). " +
      "Mindestens 8 internationale Geschichten einschließen (außerhalb DACH). " +
      "Deutsche Quellen bevorzugen: DW, Spiegel, FAZ, Süddeutsche, Zeit, Handelsblatt.",
    aiSportSlot:
      "Bundesliga, DFB-Nationalmannschaft, Formel 1, Tennis (ATP/WTA), Handball, Leichtathletik",
    categories: {
      Technology: "Technologie", Science: "Wissenschaft", Business: "Wirtschaft",
      Politics: "Politik", World: "Welt", Culture: "Kultur",
      Health: "Gesundheit", Environment: "Umwelt", Sports: "Sport", Other: "Sonstiges",
    },
    ui: {
      readSources: "Quellen lesen",
      closingThought: "Gedanke des Tages",
      noDigestYet: "Noch kein Digest",
      noDigestSub: "Erstellen Sie einen Digest über das Admin-Panel.",
      fallbackNotice: "noch nicht generiert — zeige neueste verfügbare Ausgabe.",
      generateLink: "Generieren →",
      prevStory: "Vorh.",
      nextStory: "Näch.",
      allStories: "Alle Nachrichten",
      of: "von",
    },
  },
];

/** Look up edition by ID — falls back to English */
export function getEdition(id: string): Edition {
  return EDITIONS.find(e => e.id === id) ?? EDITIONS[0];
}

/** The default edition shown on first load */
export const DEFAULT_EDITION = EDITIONS[0]; // English
