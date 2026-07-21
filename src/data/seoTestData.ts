import { SEOPageConfig, SEORedirectRule, SEO404Log, SEOKeyword, SEOSchema, SEOImage } from '../types/seo';

export const DEFAULT_SEO_PAGES: SEOPageConfig[] = [
  {
    id: 'seo-home',
    pageName: 'Home',
    urlSlug: '/',
    metaTitle: 'Dvarix Realty | Premium Real Estate & Luxury Living in Bangalore',
    metaDescription: 'Explore premium residential plots, luxury villas, smart apartments, and commercial projects in Bangalore. Direct builder prices, customized payment plans, and zero brokerage.',
    metaKeywords: 'premium plots, luxury villas, apartments bangalore, dvarix realty, investment land devanahalli',
    canonicalUrl: 'https://dvarixrealty.com/',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Dvarix Realty | Premium Real Estate & Luxury Living',
    ogDescription: 'Explore residential plots, luxury villas, smart apartments, and commercial projects in Bangalore.',
    ogImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    twitterTitle: 'Dvarix Realty | Premium Real Estate',
    twitterDescription: 'Explore residential plots, luxury villas, smart apartments, and commercial projects in Bangalore.',
    twitterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    lastUpdated: '2026-07-10T12:00:00Z',
    score: 95
  },
  {
    id: 'seo-about',
    pageName: 'About',
    urlSlug: '/about',
    metaTitle: 'About Dvarix Realty | Over 20 Years of Real Estate Excellence',
    metaDescription: 'Learn about Dvarix Realty, Bangalore’s leading premium property aggregator. Meet our executive leadership, explore our corporate values, and discover our award-winning history.',
    metaKeywords: 'about dvarix, real estate company bangalore, luxury property developers, real estate broker',
    canonicalUrl: 'https://dvarixrealty.com/about',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'About Dvarix Realty | 20+ Years of Excellence',
    ogDescription: 'Learn about Dvarix Realty, Bangalore’s leading premium property company. Read our vision, leadership team, and corporate track record.',
    ogImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200',
    twitterTitle: 'About Dvarix Realty | Leading Premium Developer',
    twitterDescription: 'Discover our corporate history and leadership in premium plot developments and luxury homes.',
    twitterImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200',
    lastUpdated: '2026-07-09T08:30:00Z',
    score: 88
  },
  {
    id: 'seo-properties',
    pageName: 'Properties',
    urlSlug: '/properties',
    metaTitle: 'Luxury Properties for Sale in Bangalore | Elite Villa Plots & Apartments',
    metaDescription: 'Browse the curated collection of luxury residential plots, custom premium villas, gated communities, and commercial complexes at Dvarix Realty. Schedule instant site visits.',
    metaKeywords: 'plots for sale, villas in dewanahalli, 3bhk apartments jp nagar, luxury commercial projects',
    canonicalUrl: 'https://dvarixrealty.com/properties',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Luxury Properties for Sale in Bangalore | Elite Listings',
    ogDescription: 'Browse premium residential plots, custom villas, gated communities, and commercial complexes at Dvarix Realty.',
    ogImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    twitterTitle: 'Premium Properties Bangalore | Dvarix Listings',
    twitterDescription: 'Browse luxury residential plots, premium villas, gated communities, and commercial complexes.',
    twitterImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    lastUpdated: '2026-07-11T10:15:00Z',
    score: 92
  },
  {
    id: 'seo-property-details',
    pageName: 'Property Details',
    urlSlug: '/property/:slug',
    metaTitle: '[Property Title] | Premium Properties | Dvarix Realty',
    metaDescription: 'Get exclusive photos, thermal layouts, floor plans, verified land ownership documents, and pricing charts for [Property Title] in [Area], Bangalore.',
    metaKeywords: 'plots in [Area], villa prices [Area], floor plans [Property Title]',
    canonicalUrl: 'https://dvarixrealty.com/property/:slug',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: '[Property Title] | Premium Properties',
    ogDescription: 'Get photos, layouts, verified land documents, and direct builder pricing for [Property Title] in Bangalore.',
    ogImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    twitterTitle: '[Property Title] | Dvarix Realty',
    twitterDescription: 'Get premium properties walkthroughs, structural ratings, and price lists.',
    twitterImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    lastUpdated: '2026-07-12T02:00:00Z',
    score: 90
  },
  {
    id: 'seo-services',
    pageName: 'Services',
    urlSlug: '/services',
    metaTitle: 'Premium Real Estate Services Bangalore | Legal & Financial Assistance',
    metaDescription: 'From legal documentation verification, ecological design assistance, zero brokerage aggregation, to instant bank loan approvals—Dvarix Realty does it all.',
    metaKeywords: 'property legal check, real estate consultation, home loan bangalore, architectural design plots',
    canonicalUrl: 'https://dvarixrealty.com/services',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Premium Real Estate Services | Dvarix Realty Solutions',
    ogDescription: 'Discover expert legal, architectural, financial, and digital tour services provided directly by Dvarix experts.',
    ogImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
    twitterTitle: 'Digital Property Services Bangalore | Dvarix',
    twitterDescription: 'Discover expert legal, architectural, financial, and digital tour services provided directly by Dvarix.',
    twitterImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200',
    lastUpdated: '2026-07-05T14:20:00Z',
    score: 84
  },
  {
    id: 'seo-buy',
    pageName: 'Buy',
    urlSlug: '/properties?intent=buy',
    metaTitle: 'Buy Premium Residential Plots & Luxury Mansions in Bangalore',
    metaDescription: 'Looking to invest? Buy luxury villa plots, smart penthouses, and ecological homes directly from verified builders in Devanahalli and JP Nagar.',
    metaKeywords: 'buy plots bangalore, purchase land devanahalli, villa plots for sale, real estate investment',
    canonicalUrl: 'https://dvarixrealty.com/properties?intent=buy',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Buy Premium Residential Plots & Mansions | Dvarix Realty',
    ogDescription: 'Looking to invest? Buy luxury villa plots and custom homes directly from verified builders.',
    ogImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    twitterTitle: 'Buy Luxury Homes & Plots | Dvarix Realty',
    twitterDescription: 'Invest in gated residential plots and bespoke custom villa developments.',
    twitterImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    lastUpdated: '2026-07-06T09:00:00Z',
    score: 89
  },
  {
    id: 'seo-sell',
    pageName: 'Sell',
    urlSlug: '/sell-property',
    metaTitle: 'Sell Your Property in Bangalore | Maximize Land Value with Dvarix',
    metaDescription: 'List your luxury land plots, customized villas, or high-rise penthouses. We connect sellers to verified pre-approved cash buyers using target-marketing models.',
    metaKeywords: 'sell land bangalore, list my property, real estate sellers, valuation calculator plots',
    canonicalUrl: 'https://dvarixrealty.com/sell-property',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Sell Your Property in Bangalore | Elite Brokerage Network',
    ogDescription: 'List your luxury land plots, customized villas, or high-rise penthouses. We connect sellers to pre-approved cash buyers.',
    ogImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
    twitterTitle: 'Maximize Property Asset Value | Sell via Dvarix',
    twitterDescription: 'List your luxury plots, customized villas, or high-rise penthouses for rapid cash closures.',
    twitterImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
    lastUpdated: '2026-07-01T11:45:00Z',
    score: 81
  },
  {
    id: 'seo-rent',
    pageName: 'Rent',
    urlSlug: '/properties?intent=rent',
    metaTitle: 'Luxury Homes & Executive Commercial Paces for Rent in Bangalore',
    metaDescription: 'Explore fully furnished premium apartments, executive duplex villas, and strategic commercial IT workspaces for rent. Premium locations with high-end fixtures.',
    metaKeywords: 'luxury rentals bangalore, commercial offices for rent, premium apartments renting',
    canonicalUrl: 'https://dvarixrealty.com/properties?intent=rent',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Luxury Homes & Executive Workspaces for Rent | Dvarix',
    ogDescription: 'Explore fully furnished premium apartments, executive duplex villas, and strategic commercial IT workspaces for rent.',
    ogImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    twitterTitle: 'Premium Rentals Bangalore | Dvarix Portfolio',
    twitterDescription: 'Explore executive commercial offices and fully-equipped smart homes available for lease.',
    twitterImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    lastUpdated: '2026-07-04T12:00:00Z',
    score: 86
  },
  {
    id: 'seo-agents',
    pageName: 'Agents',
    urlSlug: '/agents',
    metaTitle: 'Meet Our Certified Luxury Property Consultants | Dvarix Advisors',
    metaDescription: 'Connect with Bangalore’s highest-rated real estate wealth advisors. Over 100+ combined years of local zoning law expertise and strategic plot planning.',
    metaKeywords: 'real estate agents bangalore, best property advisors, commercial property consultants',
    canonicalUrl: 'https://dvarixrealty.com/agents',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Meet Our Certified Luxury Property Consultants | Dvarix Advisors',
    ogDescription: 'Connect with Bangalore’s highest-rated real estate wealth advisors and zoning experts.',
    ogImage: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200',
    twitterTitle: 'Luxury Real Estate Wealth Advisors | Dvarix',
    twitterDescription: 'Connect with Bangalore’s highest-rated land zoning and estate planning expert agents.',
    twitterImage: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200',
    lastUpdated: '2026-06-28T09:15:00Z',
    score: 83
  },
  {
    id: 'seo-contact',
    pageName: 'Contact',
    urlSlug: '/contact',
    metaTitle: 'Contact Dvarix Realty | 24/7 Premium Client Concierge Desk',
    metaDescription: 'Get in touch with us to schedule an exclusive VIP site tour, enquire about residential plots, or secure customized commercial terms. Office locations inside.',
    metaKeywords: 'contact real estate agent, dvarix office location, luxury plot site visit bangalore',
    canonicalUrl: 'https://dvarixrealty.com/contact',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Contact Dvarix Realty | VIP Client Concierge Desk',
    ogDescription: 'Get in touch with us to schedule an exclusive VIP site tour, enquire about residential plots, or secure custom commercial terms.',
    ogImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200',
    twitterTitle: 'Schedule Gated Plot VIP Tour | Contact Dvarix',
    twitterDescription: 'Get immediate phone, email, and digital assistance regarding premium property lists.',
    twitterImage: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200',
    lastUpdated: '2026-07-11T16:00:00Z',
    score: 93
  },
  {
    id: 'seo-custom-requirement',
    pageName: 'Custom Requirement',
    urlSlug: '/submit-requirement',
    metaTitle: 'Submit Custom Property Requirements | Dvarix AI matching engine',
    metaDescription: 'Can’t find what you are looking for? Fill out our customized design requirement matrix. Our AI matching engine filters through 1,000+ off-market listings instantly.',
    metaKeywords: 'custom plots req, bespoke home search, off market real estate, land sourcing agent',
    canonicalUrl: 'https://dvarixrealty.com/submit-requirement',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Submit Custom Property Requirements | Intelligent AI Matching',
    ogDescription: 'Fill out our customized property matrix. Our automated AI engine matches your specific demands instantly.',
    ogImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
    twitterTitle: 'Custom Land & Home Sourcing | Dvarix AI Engine',
    twitterDescription: 'Submit budget, BHK, plot area, and specific landmark preferences to trigger automated matching.',
    twitterImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
    lastUpdated: '2026-07-10T11:00:00Z',
    score: 87
  },
  {
    id: 'seo-blog',
    pageName: 'Blog',
    urlSlug: '/insights',
    metaTitle: 'Real Estate Insights & Investment Analysis | Dvarix Realty Blog',
    metaDescription: 'Read the latest trends about Devanahalli plot valuations, legal guidelines on Karnataka property tax, and expert architectural advice on ecological villa designs.',
    metaKeywords: 'bangalore real estate blog, land appreciation data, karnataka land registry legal guide',
    canonicalUrl: 'https://dvarixrealty.com/insights',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Dvarix Realty Investment Blog | Real Estate Insights',
    ogDescription: 'Read the latest trends about Devanahalli plot valuations, legal guidelines, and expert architectural advice.',
    ogImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200',
    twitterTitle: 'Land Valuation Reports & Industry Insights | Dvarix Blog',
    twitterDescription: 'Expert market analytics and legal advisory content regarding premium real estate.',
    twitterImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200',
    lastUpdated: '2026-07-12T03:30:00Z',
    score: 94
  },
  {
    id: 'seo-faq',
    pageName: 'FAQ',
    urlSlug: '/faq',
    metaTitle: 'Frequently Asked Real Estate Questions | Dvarix Buyer FAQ Desk',
    metaDescription: 'Find clear answers to questions on property taxation, land mutation processes, gated community layout maintenance, and home loan pre-approvals.',
    metaKeywords: 'real estate FAQ, property buying rules, land mutation questions, bank loan criteria',
    canonicalUrl: 'https://dvarixrealty.com/faq',
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: 'Frequently Asked Real Estate Questions | Dvarix Buyer FAQ',
    ogDescription: 'Find answers to complex questions on property taxation, land mutation, gated layout maintenance, and loans.',
    ogImage: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=1200',
    twitterTitle: 'Property Buyer FAQ desk | Dvarix Realty',
    twitterDescription: 'Get answers to queries regarding land mutations, gated developer protocols, and downpayments.',
    twitterImage: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=1200',
    lastUpdated: '2026-07-02T10:00:00Z',
    score: 85
  },
  {
    id: 'seo-privacy',
    pageName: 'Privacy Policy',
    urlSlug: '/privacy-policy',
    metaTitle: 'Corporate Data Privacy and Security Standards | Dvarix Realty',
    metaDescription: 'Review our strict policies governing user contact submissions, visitor cookies, CRM encryption, and secure real-time chatbot interaction tracking.',
    metaKeywords: 'data privacy, privacy policy real estate, secure cookie storage, chat transcripts',
    canonicalUrl: 'https://dvarixrealty.com/privacy-policy',
    robotsIndex: true,
    robotsFollow: false,
    ogTitle: 'Corporate Data Privacy Policy | Dvarix Realty',
    ogDescription: 'Review our policies governing user contact submissions, visitor cookies, and secure real-time chatbot tracking.',
    ogImage: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200',
    twitterTitle: 'User Data Privacy & Protection Policy | Dvarix',
    twitterDescription: 'Read about how we encrypt your mobile, budget, and personal property requirements.',
    twitterImage: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200',
    lastUpdated: '2026-05-15T08:00:00Z',
    score: 80
  },
  {
    id: 'seo-terms',
    pageName: 'Terms & Conditions',
    urlSlug: '/terms-and-conditions',
    metaTitle: 'Standard Terms & Conditions of Brokerage | Dvarix Legal',
    metaDescription: 'Read the terms of use governing the Dvarix Realty platform, site visit booking policies, digital document storage agreements, and zero brokerage terms.',
    metaKeywords: 'terms of use, real estate contracts, site visit rules, brokerage agreement bangalore',
    canonicalUrl: 'https://dvarixrealty.com/terms-and-conditions',
    robotsIndex: true,
    robotsFollow: false,
    ogTitle: 'Standard Terms & Conditions of Use | Dvarix Realty',
    ogDescription: 'Read the terms governing platform usage, site visit bookings, and digital document storage agreements.',
    ogImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200',
    twitterTitle: 'Terms of Use & Legal Agreements | Dvarix Realty',
    twitterDescription: 'General terms and conditions surrounding brokerage listings, builders, and site bookings.',
    twitterImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200',
    lastUpdated: '2026-05-15T08:00:00Z',
    score: 78
  }
];

export const SAMPLE_KEYWORDS: SEOKeyword[] = [
  {
    id: 'kw-1',
    keyword: 'premium plots devanahalli',
    secondaryKeywords: ['devanahalli villa plots', 'land for sale near kempegowda airport', 'gated community plots devanahalli'],
    intent: 'Transactional',
    volume: 5400,
    difficulty: 38,
    density: 1.8,
    suggestions: ['Include current price per sqft of Devanahalli in H2', 'Add structural layout maps as an alternate image tag', 'Increase density slightly in introduction paragraph']
  },
  {
    id: 'kw-2',
    keyword: 'luxury villas jp nagar',
    secondaryKeywords: ['3bhk villas jp nagar', 'bespoke houses jp nagar south', 'gated row houses JP nagar'],
    intent: 'Commercial',
    volume: 3200,
    difficulty: 52,
    density: 1.4,
    suggestions: ['Embed clear luxury specifications like high-end Italian marble', 'Mention distance from nearest metro line in description', 'Use "JP Nagar luxury villas" in first 100 words']
  },
  {
    id: 'kw-3',
    keyword: 'real estate investment bangalore',
    secondaryKeywords: ['plots appreciation bangalore', 'high ROI residential land', 'best place to buy property in bangalore 2026'],
    intent: 'Informational',
    volume: 12000,
    difficulty: 68,
    density: 0.9,
    suggestions: ['Link to Whitefield and Devanahalli specific detail articles', 'Add an infographic explaining land appreciation rates', 'Incorporate Organization schema in the home footer']
  },
  {
    id: 'kw-4',
    keyword: 'buy commercial office space whitefield',
    secondaryKeywords: ['it workspace whitefield lease', 'gated tech park whitefield executive', 'grade-A commercial offices Bangalore'],
    intent: 'Transactional',
    volume: 1800,
    difficulty: 45,
    density: 1.1,
    suggestions: ['Add a section with thermal insulation ratings', 'Mention exact parking ratios', 'Include detailed Local Business schema with map coordinates']
  }
];

export const SAMPLE_REDIRECTS: SEORedirectRule[] = [
  {
    id: 'red-1',
    fromUrl: '/old-about-us',
    toUrl: '/about',
    type: '301',
    dateAdded: '2026-06-01T10:00:00Z',
    clicks: 142
  },
  {
    id: 'red-2',
    fromUrl: '/plots-for-sale',
    toUrl: '/properties?type=Plot',
    type: '301',
    dateAdded: '2026-06-15T14:30:00Z',
    clicks: 539
  },
  {
    id: 'red-3',
    fromUrl: '/temporary-villas-banner',
    toUrl: '/properties?type=Villa',
    type: '302',
    dateAdded: '2026-07-05T09:12:00Z',
    clicks: 88
  }
];

export const SAMPLE_404_LOGS: SEO404Log[] = [
  {
    id: 'err-1',
    url: '/old-listings/north-bangalore-villa-1',
    referrer: 'https://google.com/search',
    clicks: 27,
    lastTriggered: '2026-07-12T03:45:00Z',
    suggestedRedirect: '/properties'
  },
  {
    id: 'err-2',
    url: '/agent-contact/rahul-kumar-profile',
    referrer: 'https://facebook.com/dvarix',
    clicks: 12,
    lastTriggered: '2026-07-11T18:22:00Z',
    suggestedRedirect: '/agents'
  },
  {
    id: 'err-3',
    url: '/careers-opportunities',
    referrer: 'https://linkedin.com/company/dvarix',
    clicks: 9,
    lastTriggered: '2026-07-12T01:15:00Z',
    suggestedRedirect: '/about'
  }
];

export const SAMPLE_SCHEMAS: SEOSchema[] = [
  {
    id: 'schema-org',
    name: 'Organization Schema',
    type: 'Organization',
    jsonContent: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dvarix Realty",
  "alternateName": "Dvarix Premium Properties",
  "url": "https://dvarixrealty.com/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://dvarixrealty.com/images/logo.webp"
  },
  "sameAs": [
    "https://facebook.com/dvarixrealty",
    "https://twitter.com/dvarixrealty",
    "https://instagram.com/dvarixrealty",
    "https://linkedin.com/company/dvarixrealty"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9876543210",
    "contactType": "VIP Sales Concierge Desk",
    "areaServed": "IN",
    "availableLanguage": ["en", "kn", "hi"]
  }
}`,
    isValid: true,
    lastUpdated: '2026-07-10T12:00:00Z'
  },
  {
    id: 'schema-local',
    name: 'Local Business Schema',
    type: 'RealEstateAgent',
    jsonContent: `{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Dvarix Realty Bangalore",
  "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200",
  "telephone": "+91-9876543210",
  "url": "https://dvarixrealty.com/",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "42, Executive Corridor, 100 Feet Rd, JP Nagar 2nd Phase",
    "addressLocality": "Bangalore",
    "postalCode": "560078",
    "addressRegion": "Karnataka",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 12.9105,
    "longitude": 77.5857
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "09:00",
    "closes": "21:00"
  }
}`,
    isValid: true,
    lastUpdated: '2026-07-10T12:00:00Z'
  }
];

export const SAMPLE_SEO_IMAGES: SEOImage[] = [
  {
    id: 'img-1',
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    alt: '',
    suggestedAlt: 'Dvarix Realty Premium Villa exterior in JP Nagar Bangalore',
    title: 'luxury_villa_exterior_jp_nagar',
    caption: 'Front elevation view of the luxury modernist villa',
    lazyLoad: true,
    size: '142 KB'
  },
  {
    id: 'img-2',
    src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    alt: 'residential land devanahalli gated community plot',
    suggestedAlt: 'Premium gated community residential plots for sale in Devanahalli Bangalore',
    title: 'gated_residential_plots_devanahalli',
    caption: 'Overview of the scenic villa plots corridor',
    lazyLoad: true,
    size: '185 KB'
  }
];
