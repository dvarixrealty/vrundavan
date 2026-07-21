export interface SEOPageConfig {
  id: string;
  pageName: string;
  urlSlug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  lastUpdated: string;
  score?: number;
  robotsMeta?: string;
  schemaMarkup?: string;
}

export interface SEORedirectRule {
  id: string;
  fromUrl: string;
  toUrl: string;
  type: '301' | '302' | '404';
  dateAdded: string;
  clicks: number;
}

export interface SEO404Log {
  id: string;
  url: string;
  referrer: string;
  clicks: number;
  lastTriggered: string;
  suggestedRedirect?: string;
}

export interface SEOKeyword {
  id: string;
  keyword: string;
  secondaryKeywords: string[];
  intent: 'Informational' | 'Navigational' | 'Commercial' | 'Transactional';
  volume: number;
  difficulty: number;
  density: number;
  suggestions: string[];
}

export interface SEOAuditItem {
  id: string;
  category: 'Meta' | 'Content' | 'Structure' | 'Social' | 'Performance';
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
}

export interface SEOSchema {
  id: string;
  name: string;
  type: string;
  jsonContent: string;
  isValid: boolean;
  lastUpdated: string;
}

export interface SEOImage {
  id: string;
  src: string;
  alt: string;
  suggestedAlt: string;
  title: string;
  caption: string;
  lazyLoad: boolean;
  size: string;
}
