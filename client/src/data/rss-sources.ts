/**
 * Curated RSS source list for the Sources tab search.
 * Users type a keyword or paste a URL — we match against this list
 * and suggest up to 10 relevant feeds to add.
 *
 * 120+ sources across 9 languages: en, fr, de, es, pt, zh, ru, tr, it
 */

export interface RssSource {
  name: string;
  url: string;
  domain: string;
  category: string;
  tags: string[];
  language: string;
}

export const RSS_SOURCES: RssSource[] = [

  // ─── ENGLISH ─────────────────────────────────────────────────────────────

  // Tech
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", domain: "techcrunch.com", category: "Technology", tags: ["tech","startup","vc","funding","apps","mobile","silicon valley"], language: "en" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", domain: "theverge.com", category: "Technology", tags: ["tech","gadgets","apple","google","consumer","phones","electronics"], language: "en" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", domain: "wired.com", category: "Technology", tags: ["tech","science","culture","future","ai","security","design"], language: "en" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", domain: "arstechnica.com", category: "Technology", tags: ["tech","science","gaming","security","hardware","open source","programming"], language: "en" },
  { name: "Hacker News", url: "https://news.ycombinator.com/rss", domain: "news.ycombinator.com", category: "Technology", tags: ["tech","startup","programming","developer","hacker","code","software"], language: "en" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/", domain: "technologyreview.com", category: "Technology", tags: ["tech","ai","research","innovation","mit","deep tech","robotics"], language: "en" },
  { name: "VentureBeat", url: "https://venturebeat.com/feed/", domain: "venturebeat.com", category: "Technology", tags: ["ai","enterprise","tech","startup","gaming","transformation","saas"], language: "en" },

  // AI
  { name: "AI News", url: "https://artificialintelligence-news.com/feed/", domain: "artificialintelligence-news.com", category: "AI", tags: ["ai","machine learning","llm","neural","gpt","deep learning","artificial intelligence"], language: "en" },
  { name: "The Gradient", url: "https://thegradient.pub/rss/", domain: "thegradient.pub", category: "AI", tags: ["ai","ml","research","deep learning","nlp","neural network"], language: "en" },

  // Science
  { name: "Nature News", url: "https://www.nature.com/nature.rss", domain: "nature.com", category: "Science", tags: ["science","research","biology","physics","climate","medicine","discovery"], language: "en" },
  { name: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml", domain: "sciencedaily.com", category: "Science", tags: ["science","research","discovery","health","environment","space","chemistry"], language: "en" },
  { name: "New Scientist", url: "https://www.newscientist.com/feed/home/", domain: "newscientist.com", category: "Science", tags: ["science","space","biology","physics","technology","future","cosmos"], language: "en" },
  { name: "NASA", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", domain: "nasa.gov", category: "Science", tags: ["space","nasa","rocket","mars","moon","astronomy","cosmos","satellite"], language: "en" },

  // Business
  { name: "Financial Times", url: "https://www.ft.com/news-feed?format=rss", domain: "ft.com", category: "Business", tags: ["finance","business","markets","economy","stocks","investing","banking","macro"], language: "en" },
  { name: "The Economist", url: "https://www.economist.com/finance-and-economics/rss.xml", domain: "economist.com", category: "Business", tags: ["economy","business","politics","finance","global","analysis","macro"], language: "en" },
  { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss", domain: "bloomberg.com", category: "Business", tags: ["markets","finance","business","economy","stocks","bonds","wall street"], language: "en" },
  { name: "Reuters Business", url: "https://feeds.reuters.com/reuters/businessNews", domain: "reuters.com", category: "Business", tags: ["business","economy","finance","corporate","trade","mergers"], language: "en" },
  { name: "Harvard Business Review", url: "https://hbr.org/rss", domain: "hbr.org", category: "Business", tags: ["business","management","leadership","strategy","hr","innovation","productivity"], language: "en" },

  // Crypto
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/", domain: "coindesk.com", category: "Crypto", tags: ["crypto","bitcoin","ethereum","blockchain","defi","web3","nft","token"], language: "en" },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss", domain: "cointelegraph.com", category: "Crypto", tags: ["crypto","bitcoin","altcoin","blockchain","market","defi","trading"], language: "en" },
  { name: "The Block", url: "https://www.theblock.co/rss.xml", domain: "theblock.co", category: "Crypto", tags: ["crypto","blockchain","defi","venture","institutional","bitcoin","regulation"], language: "en" },

  // Climate
  { name: "Carbon Brief", url: "https://www.carbonbrief.org/feed/", domain: "carbonbrief.org", category: "Climate", tags: ["climate","carbon","energy","emissions","cop","science","environment","green"], language: "en" },
  { name: "Guardian Environment", url: "https://www.theguardian.com/environment/rss", domain: "theguardian.com", category: "Climate", tags: ["environment","climate","nature","pollution","green","biodiversity","ocean"], language: "en" },

  // Health
  { name: "STAT News", url: "https://www.statnews.com/feed/", domain: "statnews.com", category: "Health", tags: ["health","medicine","pharma","biotech","drugs","fda","cancer","covid","clinical"], language: "en" },
  { name: "WHO News", url: "https://www.who.int/rss-feeds/news-english.xml", domain: "who.int", category: "Health", tags: ["health","who","pandemic","vaccine","global health","disease","outbreak"], language: "en" },

  // World News
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", domain: "bbc.com", category: "World", tags: ["world","bbc","politics","global","news","international","breaking"], language: "en" },
  { name: "Reuters Top News", url: "https://feeds.reuters.com/reuters/topNews", domain: "reuters.com", category: "World", tags: ["world","news","politics","breaking","international","wire"], language: "en" },
  { name: "AP News", url: "https://rss.ap.org/apf-topnews", domain: "apnews.com", category: "World", tags: ["world","news","politics","us","breaking","international","wire"], language: "en" },
  { name: "Foreign Policy", url: "https://foreignpolicy.com/feed/", domain: "foreignpolicy.com", category: "World", tags: ["geopolitics","foreign policy","diplomacy","war","security","international","sanctions"], language: "en" },
  { name: "Guardian World", url: "https://www.theguardian.com/world/rss", domain: "theguardian.com", category: "World", tags: ["world","guardian","politics","international","breaking","analysis","uk"], language: "en" },
  { name: "NYT World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", domain: "nytimes.com", category: "World", tags: ["world","nyt","politics","international","us","breaking","journalism"], language: "en" },
  { name: "Washington Post", url: "https://feeds.washingtonpost.com/rss/world", domain: "washingtonpost.com", category: "World", tags: ["world","washington post","politics","us","international","breaking","journalism"], language: "en" },
  { name: "Axios", url: "https://api.axios.com/feed/", domain: "axios.com", category: "World", tags: ["news","politics","tech","business","us","breaking","media"], language: "en" },
  { name: "Politico", url: "https://www.politico.com/rss/politicopicks.xml", domain: "politico.com", category: "Politics", tags: ["politics","us","congress","policy","white house","election","government","washington"], language: "en" },
  { name: "The Atlantic", url: "https://www.theatlantic.com/feed/all/", domain: "theatlantic.com", category: "World", tags: ["analysis","culture","politics","society","long form","journalism","ideas"], language: "en" },
  { name: "Vox", url: "https://www.vox.com/rss/index.xml", domain: "vox.com", category: "World", tags: ["news","explainer","politics","science","tech","culture","policy"], language: "en" },
  { name: "Quartz", url: "https://qz.com/feed", domain: "qz.com", category: "Business", tags: ["business","tech","global","economy","africa","innovation","future"], language: "en" },
  { name: "Rest of World", url: "https://restofworld.org/feed/", domain: "restofworld.org", category: "Technology", tags: ["tech","global south","developing world","internet","africa","asia","latin america"], language: "en" },
  { name: "Tortoise Media", url: "https://www.tortoisemedia.com/feed/", domain: "tortoisemedia.com", category: "World", tags: ["slow news","analysis","journalism","investigative","uk","society","depth"], language: "en" },
  { name: "The Intercept", url: "https://theintercept.com/feed/?rss=1", domain: "theintercept.com", category: "World", tags: ["investigative","politics","surveillance","national security","civil liberties","us","journalism"], language: "en" },
  { name: "ProPublica", url: "https://www.propublica.org/feeds/propublica/main", domain: "propublica.org", category: "World", tags: ["investigative","accountability","us","government","health","corruption","nonprofit journalism"], language: "en" },
  { name: "Bellingcat", url: "https://www.bellingcat.com/feed/", domain: "bellingcat.com", category: "World", tags: ["osint","investigative","open source intelligence","war","russia","disinformation","conflict"], language: "en" },

  // Startups
  { name: "Sifted", url: "https://sifted.eu/feed", domain: "sifted.eu", category: "Startups", tags: ["startup","europe","vc","funding","tech","founder","unicorn","scaleup"], language: "en" },
  { name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", domain: "news.crunchbase.com", category: "Startups", tags: ["startup","vc","funding","acquisition","ipo","venture","seed","series"], language: "en" },

  // Culture
  { name: "Pitchfork", url: "https://pitchfork.com/rss/news/", domain: "pitchfork.com", category: "Music", tags: ["music","album","concert","artist","indie","pop","rap","review","festival"], language: "en" },
  { name: "Variety", url: "https://variety.com/feed/", domain: "variety.com", category: "Culture", tags: ["film","tv","hollywood","entertainment","box office","streaming","oscars","movie"], language: "en" },
  { name: "Deadline", url: "https://deadline.com/feed/", domain: "deadline.com", category: "Culture", tags: ["film","tv","entertainment","hollywood","streaming","awards","casting","series"], language: "en" },

  // ─── FRENCH (fr) ─────────────────────────────────────────────────────────

  { name: "Le Monde", url: "https://www.lemonde.fr/rss/une.xml", domain: "lemonde.fr", category: "World", tags: ["france","français","monde","politique","actualité","économie","société","international"], language: "fr" },
  { name: "Le Figaro", url: "https://www.lefigaro.fr/rss/figaro_actualites.xml", domain: "lefigaro.fr", category: "World", tags: ["france","figaro","politique","actualité","économie","société","droite","french"], language: "fr" },
  { name: "Libération", url: "https://www.liberation.fr/arc/outboundfeeds/rss/?outputType=xml", domain: "liberation.fr", category: "World", tags: ["france","libération","politique","société","culture","gauche","actualité","french"], language: "fr" },
  { name: "Les Echos", url: "https://feeds.lesechos.fr/rss_ne_15.xml", domain: "lesechos.fr", category: "Business", tags: ["france","économie","finance","entreprise","marchés","business","bourse","french"], language: "fr" },
  { name: "L'Obs", url: "https://www.nouvelobs.com/rss.xml", domain: "nouvelobs.com", category: "World", tags: ["france","actualité","politique","société","culture","gauche","analyse","french"], language: "fr" },
  { name: "France 24 FR", url: "https://www.france24.com/fr/rss", domain: "france24.com", category: "World", tags: ["france","international","actualité","politique","économie","breaking","francophone"], language: "fr" },
  { name: "RFI", url: "https://www.rfi.fr/fr/rss", domain: "rfi.fr", category: "World", tags: ["france","afrique","francophone","international","actualité","diplomatie","radio"], language: "fr" },
  { name: "Mediapart", url: "https://www.mediapart.fr/articles/rss", domain: "mediapart.fr", category: "World", tags: ["france","enquête","investigatif","politique","corruption","société","indépendant","french"], language: "fr" },
  { name: "L'Express", url: "https://www.lexpress.fr/rss.xml", domain: "lexpress.fr", category: "World", tags: ["france","actualité","politique","économie","société","culture","magazine","french"], language: "fr" },
  { name: "20 Minutes", url: "https://www.20minutes.fr/feeds/rss/actu.xml", domain: "20minutes.fr", category: "World", tags: ["france","actualité","gratuit","société","politique","sport","divertissement","french"], language: "fr" },
  { name: "Le Point", url: "https://www.lepoint.fr/rss.xml", domain: "lepoint.fr", category: "World", tags: ["france","politique","économie","culture","magazine","actualité","société","french"], language: "fr" },
  { name: "Challenges", url: "https://www.challenges.fr/rss.xml", domain: "challenges.fr", category: "Business", tags: ["france","économie","entreprise","management","finance","classements","business","french"], language: "fr" },

  // ─── GERMAN (de) ─────────────────────────────────────────────────────────

  { name: "Der Spiegel", url: "https://www.spiegel.de/schlagzeilen/index.rss", domain: "spiegel.de", category: "World", tags: ["deutschland","german","nachrichten","politik","gesellschaft","wirtschaft","spiegel","investigativ"], language: "de" },
  { name: "Die Zeit", url: "https://newsfeed.zeit.de/index", domain: "zeit.de", category: "World", tags: ["deutschland","german","nachrichten","politik","kultur","gesellschaft","wochenzeitung","analyse"], language: "de" },
  { name: "FAZ", url: "https://www.faz.net/rss/aktuell/", domain: "faz.net", category: "World", tags: ["deutschland","german","nachrichten","politik","wirtschaft","kultur","konservativ","finanzen"], language: "de" },
  { name: "Süddeutsche Zeitung", url: "https://rss.sueddeutsche.de/alles", domain: "sueddeutsche.de", category: "World", tags: ["deutschland","german","nachrichten","politik","gesellschaft","wirtschaft","münchen","sz"], language: "de" },
  { name: "Handelsblatt", url: "https://www.handelsblatt.com/contentexport/feed/schlagzeilen", domain: "handelsblatt.com", category: "Business", tags: ["deutschland","german","wirtschaft","finanzen","unternehmen","märkte","business","dax"], language: "de" },
  { name: "Tagesspiegel", url: "https://www.tagesspiegel.de/feed.rss", domain: "tagesspiegel.de", category: "World", tags: ["deutschland","german","berlin","nachrichten","politik","gesellschaft","kultur","hauptstadt"], language: "de" },
  { name: "Welt", url: "https://www.welt.de/feeds/latest.rss", domain: "welt.de", category: "World", tags: ["deutschland","german","nachrichten","politik","wirtschaft","gesellschaft","konservativ","welt"], language: "de" },
  { name: "Focus Online", url: "https://rss.focus.de/fol/XML/rss_folnews.xml", domain: "focus.de", category: "World", tags: ["deutschland","german","nachrichten","politik","gesundheit","ratgeber","gesellschaft","focus"], language: "de" },
  { name: "Stern", url: "https://www.stern.de/feed/standard/alle-nachrichten/", domain: "stern.de", category: "World", tags: ["deutschland","german","nachrichten","gesellschaft","politik","unterhaltung","reportage","stern"], language: "de" },
  { name: "t3n", url: "https://t3n.de/rss.xml", domain: "t3n.de", category: "Technology", tags: ["deutschland","german","tech","startup","digital","software","web","innovation"], language: "de" },
  { name: "Golem", url: "https://rss.golem.de/rss.php?feed=RSS2.0", domain: "golem.de", category: "Technology", tags: ["deutschland","german","tech","software","hardware","gaming","open source","developer"], language: "de" },
  { name: "DW Deutsch", url: "https://rss.dw.com/rdf/rss-de-all", domain: "dw.com", category: "World", tags: ["deutschland","german","nachrichten","politik","wirtschaft","gesellschaft","international","dw"], language: "de" },

  // ─── SPANISH (es) ─────────────────────────────────────────────────────────

  { name: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", domain: "elpais.com", category: "World", tags: ["españa","spanish","noticias","política","economía","latam","sociedad","internacional"], language: "es" },
  { name: "El Mundo", url: "https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml", domain: "elmundo.es", category: "World", tags: ["españa","spanish","noticias","política","economía","sociedad","deporte","elmundo"], language: "es" },
  { name: "ABC", url: "https://www.abc.es/rss/feeds/abc_EspanaEspana.xml", domain: "abc.es", category: "World", tags: ["españa","spanish","noticias","política","sociedad","cultura","conservador","abc"], language: "es" },
  { name: "La Vanguardia", url: "https://www.lavanguardia.com/rss/home.xml", domain: "lavanguardia.com", category: "World", tags: ["españa","spanish","cataluña","noticias","política","economía","sociedad","barcelona"], language: "es" },
  { name: "El Confidencial", url: "https://www.elconfidencial.com/rss/", domain: "elconfidencial.com", category: "World", tags: ["españa","spanish","noticias","política","economía","investigación","finanzas","exclusivas"], language: "es" },
  { name: "20minutos", url: "https://www.20minutos.es/rss/", domain: "20minutos.es", category: "World", tags: ["españa","spanish","noticias","sociedad","política","deporte","gratuito","actualidad"], language: "es" },
  { name: "Expansión", url: "https://e00-expansion.uecdn.es/rss/portada.xml", domain: "expansion.com", category: "Business", tags: ["españa","spanish","economía","finanzas","empresas","mercados","inversión","bolsa"], language: "es" },
  { name: "Cinco Días", url: "https://cincodias.elpais.com/rss/cincodias/portada/", domain: "cincodias.elpais.com", category: "Business", tags: ["españa","spanish","economía","mercados","empresas","finanzas","negocios","bolsa"], language: "es" },
  { name: "El Economista", url: "https://www.eleconomista.es/rss/rss-de-eleconomista.php", domain: "eleconomista.es", category: "Business", tags: ["españa","spanish","economía","finanzas","mercados","empresas","bolsa","macro"], language: "es" },
  { name: "Infobae", url: "https://www.infobae.com/feeds/rss/", domain: "infobae.com", category: "World", tags: ["latam","argentina","spanish","noticias","política","economía","sociedad","internacional"], language: "es" },
  { name: "Clarín", url: "https://www.clarin.com/rss/lo-ultimo/", domain: "clarin.com", category: "World", tags: ["argentina","spanish","noticias","política","economía","deporte","sociedad","clarin"], language: "es" },
  { name: "BBC Mundo", url: "https://feeds.bbci.co.uk/mundo/rss.xml", domain: "bbc.com", category: "World", tags: ["español","latinoamerica","noticias","política","mundo","internacional","bbc"], language: "es" },

  // ─── PORTUGUESE (pt) ──────────────────────────────────────────────────────

  { name: "Público", url: "https://feeds.feedburner.com/PublicoRSS", domain: "publico.pt", category: "World", tags: ["portugal","português","notícias","política","economia","europa","sociedade","publico"], language: "pt" },
  { name: "Observador", url: "https://observador.pt/feed/", domain: "observador.pt", category: "World", tags: ["portugal","português","notícias","política","economia","sociedade","investigação","observador"], language: "pt" },
  { name: "Jornal de Notícias", url: "https://www.jn.pt/rss/", domain: "jn.pt", category: "World", tags: ["portugal","português","notícias","política","sociedade","desporto","porto","regional"], language: "pt" },
  { name: "Diário de Notícias", url: "https://www.dn.pt/rss/", domain: "dn.pt", category: "World", tags: ["portugal","português","notícias","política","economia","cultura","sociedade","internacional"], language: "pt" },
  { name: "Expresso", url: "https://expresso.pt/rss", domain: "expresso.pt", category: "World", tags: ["portugal","português","notícias","política","economia","sociedade","investigação","semanal"], language: "pt" },
  { name: "Folha de S.Paulo", url: "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml", domain: "folha.uol.com.br", category: "World", tags: ["brasil","português","notícias","política","economia","sociedade","são paulo","folha"], language: "pt" },
  { name: "G1 Globo", url: "https://g1.globo.com/rss/g1/", domain: "g1.globo.com", category: "World", tags: ["brasil","português","notícias","política","economia","esportes","entretenimento","globo"], language: "pt" },
  { name: "UOL Notícias", url: "https://rss.uol.com.br/feed/noticias.xml", domain: "uol.com.br", category: "World", tags: ["brasil","português","notícias","entretenimento","política","sociedade","esporte","uol"], language: "pt" },
  { name: "Estadão", url: "https://www.estadao.com.br/rss/ultimas.xml", domain: "estadao.com.br", category: "World", tags: ["brasil","português","notícias","política","economia","sociedade","são paulo","estadão"], language: "pt" },
  { name: "O Globo", url: "https://oglobo.globo.com/rss.xml", domain: "oglobo.globo.com", category: "World", tags: ["brasil","português","notícias","política","rio de janeiro","economia","cultura","globo"], language: "pt" },
  { name: "Correio Braziliense", url: "https://www.correiobraziliense.com.br/rss/feed/", domain: "correiobraziliense.com.br", category: "World", tags: ["brasil","português","brasília","política","governo","sociedade","economia","correio"], language: "pt" },

  // ─── CHINESE (zh) ─────────────────────────────────────────────────────────

  { name: "South China Morning Post", url: "https://www.scmp.com/rss/91/feed", domain: "scmp.com", category: "World", tags: ["china","hong kong","english","asia","politics","business","international","scmp"], language: "zh" },
  { name: "China Daily", url: "https://www.chinadaily.com.cn/rss/index_rss.xml", domain: "chinadaily.com.cn", category: "World", tags: ["china","chinese","news","politics","economy","international","official","chinadaily"], language: "zh" },
  { name: "Caixin Global", url: "https://www.caixinglobal.com/rss/", domain: "caixinglobal.com", category: "Business", tags: ["china","business","economy","finance","investigative","markets","corporate","caixin"], language: "zh" },
  { name: "36Kr", url: "https://36kr.com/feed", domain: "36kr.com", category: "Technology", tags: ["china","tech","startup","vc","internet","ai","mobile","innovation","36kr"], language: "zh" },
  { name: "Jiemian", url: "https://www.jiemian.com/rss", domain: "jiemian.com", category: "Business", tags: ["china","business","finance","economy","corporate","markets","investment","jiemian"], language: "zh" },
  { name: "Sina News", url: "https://rss.sina.com.cn/news/china/focus15.xml", domain: "sina.com.cn", category: "World", tags: ["china","chinese","news","society","politics","breaking","sina","portal"], language: "zh" },
  { name: "Xinhua English", url: "http://www.xinhuanet.com/english/rss/worldrss.xml", domain: "xinhuanet.com", category: "World", tags: ["china","xinhua","official","world","news","international","government","wire"], language: "zh" },
  { name: "Global Times", url: "https://www.globaltimes.cn/rss/outbrain.xml", domain: "globaltimes.cn", category: "World", tags: ["china","english","news","politics","international","official","foreign policy","globaltimes"], language: "zh" },
  { name: "The Initium", url: "https://theinitium.com/feed/", domain: "theinitium.com", category: "World", tags: ["hong kong","taiwan","china","chinese","investigative","politics","society","independent"], language: "zh" },

  // ─── RUSSIAN (ru) ─────────────────────────────────────────────────────────

  { name: "Meduza", url: "https://meduza.io/rss/all", domain: "meduza.io", category: "World", tags: ["россия","russian","новости","политика","общество","независимое","латвия","meduza"], language: "ru" },
  { name: "BBC Russian", url: "https://feeds.bbci.co.uk/russian/rss.xml", domain: "bbc.com", category: "World", tags: ["россия","russian","новости","политика","мир","international","bbc","независимое"], language: "ru" },
  { name: "RBC", url: "https://rss.rbc.ru/rss/news.rss", domain: "rbc.ru", category: "Business", tags: ["россия","russian","экономика","финансы","бизнес","рынки","политика","rbc"], language: "ru" },
  { name: "Novaya Gazeta Europe", url: "https://novayagazeta.eu/rss", domain: "novayagazeta.eu", category: "World", tags: ["россия","russian","расследования","политика","права","независимое","журналистика","novaya"], language: "ru" },
  { name: "Коммерсантъ", url: "https://www.kommersant.ru/RSS/main.xml", domain: "kommersant.ru", category: "Business", tags: ["россия","russian","бизнес","политика","экономика","коммерсант","новости","деловые"], language: "ru" },
  { name: "Ведомости", url: "https://www.vedomosti.ru/rss/news", domain: "vedomosti.ru", category: "Business", tags: ["россия","russian","бизнес","финансы","рынки","экономика","корпорации","ведомости"], language: "ru" },
  { name: "The Insider", url: "https://theins.ru/feed", domain: "theins.ru", category: "World", tags: ["россия","russian","расследования","дезинформация","спецслужбы","insider","независимое","политика"], language: "ru" },
  { name: "iStories", url: "https://istories.media/feed/", domain: "istories.media", category: "World", tags: ["россия","russian","расследования","коррупция","война","независимое","журналистика","istories"], language: "ru" },

  // ─── TURKISH (tr) ─────────────────────────────────────────────────────────

  { name: "Cumhuriyet", url: "https://www.cumhuriyet.com.tr/rss/tum_haberler.xml", domain: "cumhuriyet.com.tr", category: "World", tags: ["türkiye","turkish","haber","siyaset","ekonomi","cumhuriyet","laik","toplum"], language: "tr" },
  { name: "Hürriyet", url: "https://www.hurriyet.com.tr/rss/anasayfa", domain: "hurriyet.com.tr", category: "World", tags: ["türkiye","turkish","haber","siyaset","ekonomi","spor","hurriyet","gündem"], language: "tr" },
  { name: "Milliyet", url: "https://www.milliyet.com.tr/rss/rssNew/gundem.xml", domain: "milliyet.com.tr", category: "World", tags: ["türkiye","turkish","haber","siyaset","gündem","milliyet","toplum","politika"], language: "tr" },
  { name: "Sözcü", url: "https://www.sozcu.com.tr/rss", domain: "sozcu.com.tr", category: "World", tags: ["türkiye","turkish","haber","siyaset","ekonomi","sozcu","muhalif","gündem"], language: "tr" },
  { name: "Dünya", url: "https://www.dunya.com/rss", domain: "dunya.com", category: "Business", tags: ["türkiye","turkish","ekonomi","iş","finans","piyasa","ticaret","dunya"], language: "tr" },
  { name: "Sabah", url: "https://www.sabah.com.tr/rss/anasayfa.xml", domain: "sabah.com.tr", category: "World", tags: ["türkiye","turkish","haber","siyaset","ekonomi","spor","sabah","gündem"], language: "tr" },
  { name: "Haberturk", url: "https://www.haberturk.com/rss", domain: "haberturk.com", category: "World", tags: ["türkiye","turkish","haber","siyaset","ekonomi","haberturk","televizyon","gündem"], language: "tr" },
  { name: "TRT Haber", url: "https://www.trthaber.com/anasayfa.rss", domain: "trthaber.com", category: "World", tags: ["türkiye","turkish","haber","resmi","kamu","trt","devlet","gündem","international"], language: "tr" },
  { name: "Bianet", url: "https://bianet.org/bianet/rss", domain: "bianet.org", category: "World", tags: ["türkiye","turkish","haber","insan hakları","bağımsız","basın özgürlüğü","bianet","sivil"], language: "tr" },

  // ─── ITALIAN (it) ─────────────────────────────────────────────────────────

  { name: "Repubblica", url: "https://www.repubblica.it/rss/homepage/rss2.0.xml", domain: "repubblica.it", category: "World", tags: ["italia","italiano","notizie","politica","economia","cultura","sport","repubblica"], language: "it" },
  { name: "Corriere della Sera", url: "https://www.corriere.it/rss/homepage.xml", domain: "corriere.it", category: "World", tags: ["italia","italiano","notizie","politica","economia","cultura","milano","corriere"], language: "it" },
  { name: "La Stampa", url: "https://www.lastampa.it/rss", domain: "lastampa.it", category: "World", tags: ["italia","italiano","notizie","politica","torino","economia","società","stampa"], language: "it" },
  { name: "Il Sole 24 Ore", url: "https://www.ilsole24ore.com/rss/mondo.xml", domain: "ilsole24ore.com", category: "Business", tags: ["italia","italiano","economia","finanza","mercati","imprese","fisco","sole24ore"], language: "it" },
  { name: "Il Fatto Quotidiano", url: "https://www.ilfattoquotidiano.it/feed/", domain: "ilfattoquotidiano.it", category: "World", tags: ["italia","italiano","notizie","politica","anticorruzione","giornalismo","fatto","indipendente"], language: "it" },
  { name: "Il Post", url: "https://www.ilpost.it/feed/", domain: "ilpost.it", category: "World", tags: ["italia","italiano","notizie","spiegazioni","analisi","politica","cultura","digitale"], language: "it" },
  { name: "ANSA", url: "https://www.ansa.it/sito/ansait_rss.xml", domain: "ansa.it", category: "World", tags: ["italia","italiano","notizie","wire","agenzia","breaking","politica","mondo"], language: "it" },
  { name: "AGI", url: "https://www.agi.it/feed/", domain: "agi.it", category: "World", tags: ["italia","italiano","notizie","wire","agenzia","breaking","politica","economia"], language: "it" },
  { name: "Wired IT", url: "https://www.wired.it/feed/", domain: "wired.it", category: "Technology", tags: ["italia","italiano","tech","innovazione","scienza","cultura digitale","startup","futuro"], language: "it" },
  { name: "Internazionale", url: "https://www.internazionale.it/sitemaps/rss.xml", domain: "internazionale.it", category: "World", tags: ["italia","italiano","internazionale","mondo","analisi","giornalismo","traduzione","geopolitica"], language: "it" },
];

/**
 * Search sources by keyword or URL.
 * Returns up to 10 matches sorted by relevance.
 * Searches name, domain, tags, category, and language.
 */
export function searchSources(query: string): RssSource[] {
  const q = query.trim().toLowerCase();
  if (!q) return RSS_SOURCES.slice(0, 10);

  // URL match — extract domain from pasted URL
  if (q.startsWith("http") || (q.includes(".") && !q.includes(" "))) {
    const domain = q.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
    const urlMatches = RSS_SOURCES.filter(s => s.domain.includes(domain) || s.url.includes(q));
    if (urlMatches.length > 0) return urlMatches.slice(0, 10);
  }

  // Language shortcode match (e.g. "fr", "de", "zh")
  const langExact = RSS_SOURCES.filter(s => s.language === q);
  if (langExact.length > 0) return langExact.slice(0, 10);

  // Keyword scoring
  const scored = RSS_SOURCES.map(s => {
    let score = 0;
    if (s.tags.some(t => t === q)) score += 4;
    if (s.tags.some(t => t.startsWith(q) || q.startsWith(t))) score += 2;
    if (s.name.toLowerCase().includes(q)) score += 3;
    if (s.category.toLowerCase().includes(q)) score += 2;
    if (s.domain.includes(q)) score += 3;
    if (s.language === q) score += 5;
    if (s.tags.some(t => t.includes(q) || q.includes(t))) score += 1;
    return { source: s, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  return scored.slice(0, 10).map(x => x.source);
}
