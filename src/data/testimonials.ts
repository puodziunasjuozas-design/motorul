export interface Testimonial {
  id: string;
  text: string;
  author: string;
  country: string;
  countryCode: string;
  rating: number;
}

// Testimonials in native languages with some realistic typos/mistakes
export const allTestimonials: Testimonial[] = [
  // Lithuanian testimonials
  {
    id: "lt1",
    text: "Nusipirkau BMW pagal jų analize - sutaupiau 2000€ derybose, nes žinojau tikrąją rinkos kainą!",
    author: "Tomas K.",
    country: "Lietuva",
    countryCode: "lt",
    rating: 5
  },
  {
    id: "lt2",
    text: "Puikus įrankis perpardavinėtojams. Per menesį išanalizavau 15 automobilių ir išvengiau 3 blogų sandorių.",
    author: "Andrius M.",
    country: "Lietuva",
    countryCode: "lt",
    rating: 5
  },
  {
    id: "lt3",
    text: "Video instrukcijos padėjo pačiam sutvarkyti stabdzius. Servisas būtų paprašęs 300€, o aš išleidau tik 50€ dalims.",
    author: "Giedrius R.",
    country: "Lietuva",
    countryCode: "lt",
    rating: 5
  },
  {
    id: "lt4",
    text: "Labai naudinga paslauga! Pardavejas bandė mane apgauti bet as zinojau tikra kaina deki sito irankio",
    author: "Rasa V.",
    country: "Lietuva",
    countryCode: "lt",
    rating: 5
  },
  {
    id: "lt5",
    text: "Rekomenduoju visiems kas nori nusipirkt naudota auto. Sutaupiau laiko ir nervu!",
    author: "Mantas P.",
    country: "Lietuva",
    countryCode: "lt",
    rating: 4
  },

  // English testimonials (international)
  {
    id: "en1",
    text: "Saved me from buying a car with hidden engine problems. The AI detected issues from photos that I missed!",
    author: "James W.",
    country: "United Kingdom",
    countryCode: "en",
    rating: 5
  },
  {
    id: "en2",
    text: "Really helpful tool for checking prices. Used it for 3 cars before making my decision.",
    author: "Michael T.",
    country: "Ireland",
    countryCode: "en",
    rating: 5
  },
  {
    id: "en3",
    text: "The repair cost estimate was spot on. Knew exactly what I was getting into before purchase.",
    author: "Sarah K.",
    country: "United States",
    countryCode: "en",
    rating: 5
  },

  // German testimonials
  {
    id: "de1",
    text: "Super Werkzeug! Habe damit meinen Golf analysiert und 1500€ beim Kauf gespart. Kann ich nur empfeheln!",
    author: "Thomas M.",
    country: "Deutschland",
    countryCode: "de",
    rating: 5
  },
  {
    id: "de2",
    text: "Die KI hat Probleme erkannt die ich nicht gesehen hab. Wirklich beeindruckend wie genau das ist.",
    author: "Stefan B.",
    country: "Deutschland",
    countryCode: "de",
    rating: 5
  },
  {
    id: "de3",
    text: "Benutze das Tool jetzt regelmässig für mein Autogeschäft. Spart mir viel Zeit und Geld!",
    author: "Klaus H.",
    country: "Österreich",
    countryCode: "de",
    rating: 4
  },

  // Polish testimonials
  {
    id: "pl1",
    text: "Świetne narzędzie! Uratowało mnie przed kupnem auta z ukrytymi wadami. Polecam każdemu!",
    author: "Piotr K.",
    country: "Polska",
    countryCode: "pl",
    rating: 5
  },
  {
    id: "pl2",
    text: "Uzywam tego do sprawdzania cen. Bardzo pomocne przy negocjacjach z sprzedawcami.",
    author: "Anna W.",
    country: "Polska",
    countryCode: "pl",
    rating: 5
  },
  {
    id: "pl3",
    text: "Super sprawa te filmy instruktazowe. Sam naprawiłem hamulce dzieki temu i oszczędziłem 800zł",
    author: "Marek Z.",
    country: "Polska",
    countryCode: "pl",
    rating: 5
  },

  // French testimonials
  {
    id: "fr1",
    text: "Excellent outil! J'ai économisé 2000€ grace à l'analyse de marché. Vraiment impressionant.",
    author: "Pierre L.",
    country: "France",
    countryCode: "fr",
    rating: 5
  },
  {
    id: "fr2",
    text: "L'estimation des réparations était tres précise. Je savais exactement ce que j'achetais.",
    author: "Marie D.",
    country: "France",
    countryCode: "fr",
    rating: 5
  },
  {
    id: "fr3",
    text: "Je recommande à tous ceux qui veulent acheter une voiture d'occasion. Super service!",
    author: "Jean-Claude B.",
    country: "Belgique",
    countryCode: "fr",
    rating: 4
  },

  // Spanish testimonials
  {
    id: "es1",
    text: "Muy buena herramienta! Me ayudó a negociar un mejor precio. El vendedor no podia creerlo.",
    author: "Carlos R.",
    country: "España",
    countryCode: "es",
    rating: 5
  },
  {
    id: "es2",
    text: "Los videos de reparación son geniales. Arreglé los frenos yo mismo y ahorré mucho dinero!",
    author: "María G.",
    country: "España",
    countryCode: "es",
    rating: 5
  },

  // Italian testimonials
  {
    id: "it1",
    text: "Strumento fantastico! Ho risparmiato 1800€ grazie all'analisi del mercato. Lo consiglio a tutti!",
    author: "Marco R.",
    country: "Italia",
    countryCode: "it",
    rating: 5
  },
  {
    id: "it2",
    text: "L'IA ha trovato problemi che non avevo visto. Molto impressionante la precisione!",
    author: "Giuseppe F.",
    country: "Italia",
    countryCode: "it",
    rating: 5
  },

  // Portuguese testimonials
  {
    id: "pt1",
    text: "Excelente ferramenta! Poupei 1500€ nas negociações. O vendedor ficou surpreso.",
    author: "João S.",
    country: "Portugal",
    countryCode: "pt",
    rating: 5
  },
  {
    id: "pt2",
    text: "Os videos de reparação sao muito uteis. Consertei o carro sozinho gracas a isto!",
    author: "António M.",
    country: "Portugal",
    countryCode: "pt",
    rating: 5
  },

  // Dutch testimonials
  {
    id: "nl1",
    text: "Super handig! Heb er 3 auto's mee gecheckt voordat ik een beslissing maakte. Echt aanrader.",
    author: "Jan V.",
    country: "Nederland",
    countryCode: "nl",
    rating: 5
  },
  {
    id: "nl2",
    text: "De marktanalyse is heel precies. Wist precies hoeveel ik moest bieden voor de auto.",
    author: "Pieter B.",
    country: "Nederland",
    countryCode: "nl",
    rating: 5
  },

  // Russian testimonials
  {
    id: "ru1",
    text: "Отличный инструмент! Сэкономил 100000 рублей при покупке. Всем советую!",
    author: "Алексей К.",
    country: "Россия",
    countryCode: "ru",
    rating: 5
  },
  {
    id: "ru2",
    text: "ИИ нашол проблемы которые я не заметил. Очень точный анализ, рекомендую.",
    author: "Дмитрий С.",
    country: "Россия",
    countryCode: "ru",
    rating: 5
  },

  // Czech testimonials
  {
    id: "cs1",
    text: "Skvělý nástroj! Ušetřil jsem 40000 Kč díky analýze trhu. Doporučuji všem!",
    author: "Pavel N.",
    country: "Česko",
    countryCode: "cs",
    rating: 5
  },
  {
    id: "cs2",
    text: "Videa s opravami jsou super uzitečná. Opravil jsem brzdy sám a usetřil hodně peněz.",
    author: "Jan K.",
    country: "Česko",
    countryCode: "cs",
    rating: 5
  },

  // Bulgarian testimonials
  {
    id: "bg1",
    text: "Страхотен инструмент! Спестих 3000лв при покупката. Препоръчвам на всички!",
    author: "Георги П.",
    country: "България",
    countryCode: "bg",
    rating: 5
  },

  // Hungarian testimonials
  {
    id: "hu1",
    text: "Nagyon hasznos! 500000 forintot spóroltam a vásárlásnál. Mindenkinek ajánlom!",
    author: "László K.",
    country: "Magyarország",
    countryCode: "hu",
    rating: 5
  },

  // Romanian testimonials
  {
    id: "ro1",
    text: "Instrument excelent! Am economisit 1000€ la negocieri. Recomand cu incredere!",
    author: "Andrei M.",
    country: "România",
    countryCode: "ro",
    rating: 5
  },

  // Swedish testimonials
  {
    id: "sv1",
    text: "Jättebra verktyg! Sparade 15000kr på köpet tack vare marknadsanalysen.",
    author: "Erik L.",
    country: "Sverige",
    countryCode: "sv",
    rating: 5
  },

  // Finnish testimonials
  {
    id: "fi1",
    text: "Erinomainen työkalu! Säästin 1500€ neuvotteluissa. Suosittelen kaikille!",
    author: "Matti H.",
    country: "Suomi",
    countryCode: "fi",
    rating: 5
  },

  // Danish testimonials
  {
    id: "da1",
    text: "Super godt værktøj! Sparede 12000kr på købet. Kan varmt anbefales!",
    author: "Lars J.",
    country: "Danmark",
    countryCode: "da",
    rating: 5
  },

  // Greek testimonials
  {
    id: "el1",
    text: "Εξαιρετικό εργαλείο! Εξοικονόμησα 1500€ στην αγορά. Το συνιστώ ανεπιφύλακτα!",
    author: "Νίκος Κ.",
    country: "Ελλάδα",
    countryCode: "el",
    rating: 5
  },

  // Latvian testimonials
  {
    id: "lv1",
    text: "Lielisks rīks! Ietaupīju 1000€ pērkot auto. Iesaku visiem!",
    author: "Jānis B.",
    country: "Latvija",
    countryCode: "lv",
    rating: 5
  },

  // Estonian testimonials
  {
    id: "et1",
    text: "Suurepärane tööriist! Säästsin 1200€ ostu läbirääkimistel. Soovitan kõigile!",
    author: "Marten K.",
    country: "Eesti",
    countryCode: "et",
    rating: 5
  },

  // Croatian testimonials
  {
    id: "hr1",
    text: "Odličan alat! Uštedio sam 1000€ na kupovini zahvaljujući analizi tržišta.",
    author: "Marko P.",
    country: "Hrvatska",
    countryCode: "hr",
    rating: 5
  },

  // Slovak testimonials
  {
    id: "sk1",
    text: "Skvelý nástroj! Ušetril som 1500€ pri kúpe auta. Odporúčam každému!",
    author: "Peter H.",
    country: "Slovensko",
    countryCode: "sk",
    rating: 5
  },

  // Slovenian testimonials
  {
    id: "sl1",
    text: "Odlično orodje! Prihranil sem 1200€ pri nakupu. Priporočam vsem!",
    author: "Janez M.",
    country: "Slovenija",
    countryCode: "sl",
    rating: 5
  },
];

// Get testimonials filtered by language (country testimonials + English ones)
export const getTestimonialsForLanguage = (languageCode: string): Testimonial[] => {
  // Get testimonials from user's country
  const countryTestimonials = allTestimonials.filter(
    t => t.countryCode === languageCode
  );
  
  // Get some English testimonials
  const englishTestimonials = allTestimonials.filter(
    t => t.countryCode === "en"
  ).slice(0, 2);
  
  // Combine and shuffle a bit
  const combined = [...countryTestimonials, ...englishTestimonials];
  
  // If no country-specific testimonials, return a mix of all
  if (countryTestimonials.length === 0) {
    return allTestimonials.slice(0, 6);
  }
  
  return combined;
};

// Get featured testimonials for home page (3 testimonials)
export const getFeaturedTestimonials = (languageCode: string): Testimonial[] => {
  const testimonials = getTestimonialsForLanguage(languageCode);
  return testimonials.slice(0, 3);
};
