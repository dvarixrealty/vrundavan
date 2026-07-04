import { Property, LocationData } from './types';

export const PROPERTIES: Property[] = [
  {
    id: 'prop-dvarix-1',
    title: 'DVRX Global Greens',
    type: 'Plot',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.9,
    reviews: 18,
    address: 'Devanahalli, Bengaluru',
    location: 'Bangalore',
    description: 'Premium Villa Plots situated in Devanahalli, Bengaluru. This ready-to-construct luxury plotted layout includes direct asphalt layout streets, underground power grids, water supply connection lines, wide nature zones, and 24/7 security surveillance systems.',
    sqft: 2400,
    beds: 0,
    baths: 0,
    price: 5499000, 
    featured: true,
    badgeFeatured: true,
    badgeVerified: true,
    amenities: ['Power Grid', 'Water Connection', 'Asphalt Roads', 'Clubhouse', 'Children Park'],
    agent: {
      name: 'Anirudh Naidu',
      role: 'Premium Villa Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'a.naidu@dvarix.com'
    }
  },
  {
    id: 'prop-dvarix-2',
    title: 'Prestige Raintree Park',
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.8,
    reviews: 34,
    address: 'Whitefield, Bengaluru',
    location: 'Bangalore',
    description: 'Elegant high-rise multi-tower apartment project spanning beautiful sprawling green corridors in Whitefield. Experience smart home operations with full automated panels, backup grids, dynamic sports courts, and pristine swimming lagoons.',
    sqft: 2200,
    beds: 4,
    baths: 3,
    price: 14500000, 
    featured: true,
    badgeFeatured: true,
    badgeVerified: true,
    amenities: ['Power Backup', 'Rooftop Club', 'Infinity Pool', 'Gym', 'Video Door Phone'],
    agent: {
      name: 'Raghav Reddy',
      role: 'Director of Southern Acquisitions',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'raghav.r@dvarix.com'
    }
  },
  {
    id: 'prop-dvarix-3',
    title: 'Sobha Galera Villas',
    type: 'Villa',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 5.0,
    reviews: 21,
    address: 'Hennur Road, Bengaluru',
    location: 'Bangalore',
    description: 'Ultra luxury Spanish-style duplex villa rows placed inside Hennur Road corridor. Features a private home elevator, Italian marble cladding, dual separate car parkings, solar-hybrid electricity backup, and specialized custom landscape gardens.',
    sqft: 3600,
    beds: 5,
    baths: 5,
    price: 32000000, 
    featured: true,
    badgeFeatured: true,
    badgeVerified: true,
    amenities: ['Private Elevator', 'Carrara Marble Flooring', 'Home Theatre', 'Electric Car Fast-Charger', 'Servants Quarters'],
    agent: {
      name: 'Priya Sharma',
      role: 'Bespoke Portfolio Advisor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'p.sharma@dvarix.com'
    }
  },
  {
    id: 'prop-dvarix-4',
    title: 'Brigade Tech Gardens',
    type: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.8,
    reviews: 15,
    address: 'Sarjapur Road, Bengaluru',
    location: 'Bangalore',
    description: 'State-of-the-art office spaces and corporate chambers in Sarjapur Road. Constructed using high thermal efficiency materials, dual glazed windows, complete central air-conditioning, high security check lanes, and deep structural earthquake-resistant certifications.',
    sqft: 5000,
    beds: 0,
    baths: 2,
    price: 8500000, 
    featured: true,
    badgeFeatured: true,
    badgeVerified: true,
    amenities: ['VRF Central AC', 'Helipad Access Block', 'Fibre Ring Network', 'Executive Lounge', 'High Security Entrance'],
    agent: {
      name: 'Raghav Reddy',
      role: 'Director of Southern Acquisitions',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'raghav.r@dvarix.com'
    }
  },
  {
    id: 'prop-1',
    title: 'Gachibowli Tech-Pinnacle Suites',
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.8,
    reviews: 24,
    address: 'Outer Ring Rd, Gachibowli, Hyderabad, Telangana 500032',
    location: 'Hyderabad',
    description: 'Breathtaking high-rise premium residence in the heart of the Gachibowli financial district. Built for tech professionals, this block offers full home automation, uninterrupted 3-phase power backup, double glazed soundproofing, and stunning views of the nearby botanical gardens.',
    sqft: 1850,
    beds: 3,
    baths: 3,
    price: 18500000, // ₹1.85 Cr
    featured: true,
    amenities: ['Power Backup', 'Rooftop Club', 'Smart Lock', 'Infinity Pool', 'Gym', 'Video Door Phone', 'Piped Gas'],
    agent: {
      name: 'Raghav Reddy',
      role: 'Director of Southern Acquisitions',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'raghav.r@dvarix.com'
    }
  },
  {
    id: 'prop-2',
    title: 'Bandra Coastal Heights',
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 5.0,
    reviews: 32,
    address: 'Carter Road, Bandra West, Mumbai, Maharashtra 400050',
    location: 'Mumbai',
    description: 'Exquisite modern sea-facing residences of spectacular architectural caliber. Offers clear unbothered views of the Arabian Sea, private lift access, direct high-strength seismic envelope structural certificates, and automated smart-grid solar batteries.',
    sqft: 2800,
    beds: 4,
    baths: 4,
    price: 85000000, // ₹8.50 Cr
    featured: true,
    amenities: ['Sea View Lounge', 'Private Elevator', '24/7 Security Concierge', 'Automated Solar Power', 'Stained Italian Marble', 'Biometric Locks'],
    agent: {
      name: 'Priya Sharma',
      role: 'Bespoke Portfolio Advisor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'p.sharma@dvarix.com'
    }
  },
  {
    id: 'prop-3',
    title: 'Indiranagar Eco-Villa Block',
    type: 'Villa',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.9,
    reviews: 19,
    address: '12th Main Road, Indiranagar, Bangalore, Karnataka 560038',
    location: 'Bangalore',
    description: 'An oasis of dense green tranquility in the middle of Bangalore’s high street. This luxury duplex villa features local rainwater harvesting systems, solar panel arrays with high-capacity grid storage, an indoor tropical atrium, and customized automated climate shields.',
    sqft: 4200,
    beds: 4,
    baths: 5,
    price: 54000000, // ₹5.40 Cr
    featured: true,
    amenities: ['Private Rainwater Reservoir', 'Solar Grid Hybrid', 'Zen Atrium Garden', 'Home Theatre', 'Electric Car Fast-Charger', 'Servants Quarters'],
    agent: {
      name: 'Anirudh Naidu',
      role: 'Premium Villa Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'a.naidu@dvarix.com'
    }
  },
  {
    id: 'prop-4',
    title: 'Gurugram Smart Capital Suites',
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.9,
    reviews: 35,
    address: 'Golf Course Road, DLF Phase 5, Gurugram, Delhi NCR 122002',
    location: 'Delhi NCR',
    description: 'The epitome of high-class luxury living in Delhi NCR. Fully furnished executive residences with direct double glazed structural frames, certified concrete performance insulation, marble flooring imported from Carrara, and comprehensive 5-tier guard house verification.',
    sqft: 3400,
    beds: 4,
    baths: 4,
    price: 68000000, // ₹6.80 Cr
    featured: true,
    amenities: ['Private Elevator', 'Carrara Marble Flooring', 'Clubhouse Lounge', '5-Tier Security', 'Temperature-Controlled Pool', 'Double Glazed Glass'],
    agent: {
      name: 'Priya Sharma',
      role: 'Bespoke Portfolio Advisor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'p.sharma@dvarix.com'
    }
  },
  {
    id: 'prop-5',
    title: 'Kondapur Ecological Villa',
    type: 'Villa',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210491893-6c7c456f917e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.7,
    reviews: 13,
    address: 'Botanical Garden Rd, Kondapur, Hyderabad, Telangana 500084',
    location: 'Hyderabad',
    description: 'Bespoke sustainable villa layout featuring a modern layout with solid high-strength foundations. Boasts double-sided courtyards, integrated solar pool heating blocks, a personal study salon, deep-water borewells, and a direct water-softener filtration scheme.',
    sqft: 3800,
    beds: 4,
    baths: 4.5,
    price: 35000000, // ₹3.50 Cr
    featured: false,
    amenities: ['Organic Roof Garden', 'Water Softener Grid', 'Personal Study Office', 'Solar Pool Heater', 'Power Wall Charger', 'Dedicated Servant Wing'],
    agent: {
      name: 'Raghav Reddy',
      role: 'Director of Southern Acquisitions',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'raghav.r@dvarix.com'
    }
  },
  {
    id: 'prop-6',
    title: 'Noida Commercial Trade Plaza',
    type: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.8,
    reviews: 11,
    address: 'Sector 62, Noida, Delhi NCR 201301',
    location: 'Delhi NCR',
    description: 'Premium corporate towers and office complex offering central air-conditioning, multi-level vehicular parking bays, High-Efficiency Geothermal VRF AC units, high security entry checkpoints, and structural certification for IT/Corporate headquarters.',
    sqft: 25000,
    beds: 0,
    baths: 8,
    price: 135000000, // ₹13.50 Cr
    featured: true,
    amenities: ['IT Server Hub Ready', 'VRF Central AC', 'Helipad Access Block', 'Fibre Ring Network', '300 Base Car Parking', '24/7 Power Backup Grid'],
    agent: {
      name: 'Priya Sharma',
      role: 'Bespoke Portfolio Advisor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'p.sharma@dvarix.com'
    }
  },
  {
    id: 'prop-7',
    title: 'Whitefield Smart Logistics Yard',
    type: 'Warehouse',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553413530-fa090334863e?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.6,
    reviews: 15,
    address: 'Whitefield Industrial Area, Bangalore, Karnataka 560066',
    location: 'Bangalore',
    description: 'Premium industrial logistic storage facility equipped with heavy load and high concrete strength flooring. Clearance height up to 13.5 meters, fully enclosed perimeter surveillance fencing, thermal insulation shielding, and separate double-trailer parking spaces.',
    sqft: 35000,
    beds: 0,
    baths: 4,
    price: 92000000, // ₹9.20 Cr
    featured: false,
    amenities: ['13.5m Structural Height', 'Concrete Load Beams', '12 Robotic Docking Gates', 'Fire Suppression System', 'Large Trailer Parking yard', '3-Phase High-Amp Substation'],
    agent: {
      name: 'Anirudh Naidu',
      role: 'Premium Villa Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'a.naidu@dvarix.com'
    }
  },
  {
    id: 'prop-8',
    title: 'Gachibowli Green Farm Escape',
    type: 'Homestay',
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.9,
    reviews: 42,
    address: 'Oakridge Campus Road, Khajaguda, Hyderabad, Telangana 500075',
    location: 'Hyderabad',
    description: 'Perfect natural serene escape. A hybrid holiday-home and farm layout incorporating premium features: organic mango orchard plots, customized borewell water reservoirs, solid brick perimeter walls, high speed connectivity, and a vintage fireplace retreat.',
    sqft: 2200,
    beds: 3,
    baths: 3,
    price: 26000000, // ₹2.60 Cr
    featured: false,
    amenities: ['Mango Orchards', 'Outdoor Brick Oven', 'Dedicated Security Cabin', 'Satellite Fiber lines', 'Recreation Pool', 'Modular Kitchen Layout'],
    agent: {
      name: 'Raghav Reddy',
      role: 'Director of Southern Acquisitions',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'raghav.r@dvarix.com'
    }
  },
  {
    id: 'prop-plots-1',
    title: 'Emerald Meadows Gated Premium Plots',
    type: 'Plot',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.9,
    reviews: 18,
    address: 'JP Nagar 8th Phase Extension, Bangalore, Karnataka 560083',
    location: 'Bangalore',
    description: 'Bespoke residential villa plots within a hyper-exclusive gated enclave. Outfitted with heavy underground layout power grids, ready water taps on every parcel, dynamic fiber internet infrastructure, 40-feet primary internal roads, and wide aesthetic green avenues.',
    sqft: 2400,
    beds: 0,
    baths: 0,
    price: 9600000, 
    featured: true,
    amenities: ['Gated Security Outer Wall', 'Underground Utility Paths', 'Asphalt internal roads', 'Overhead water tanks', 'Exclusive Club Access', 'Streetlighting Grid'],
    agent: {
      name: 'Anirudh Naidu',
      role: 'Premium Villa Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'a.naidu@dvarix.com'
    }
  },
  {
    id: 'prop-plots-2',
    title: 'Royal Heritage Golden Crest Plots',
    type: 'Plot',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.8,
    reviews: 29,
    address: 'Outer Bypass Avenue, Gachibowli Outer Orbit, Hyderabad, Telangana 500032',
    location: 'Hyderabad',
    description: 'High-yield commercial and residential development land plots. Designed for modern multi-story structures or custom palace estates, this premium sector has cleared legal titles, bank approvals, sewage treatment system setups, and immediate registration certificates.',
    sqft: 4000,
    beds: 0,
    baths: 0,
    price: 18000000, 
    featured: true,
    amenities: ['HMDA Certified Title', 'Dual bypass entry', 'Avenue plantation', 'High CCTV coverage', 'Children parks', 'Underground Drainage'],
    agent: {
      name: 'Raghav Reddy',
      role: 'Director of Southern Acquisitions',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
      phone: '+91 6300984846',
      email: 'raghav.r@dvarix.com'
    }
  }
];

export const LOCATIONS: LocationData[] = [
  {
    name: 'Hyderabad',
    propertiesCount: 15,
    image: 'https://images.unsplash.com/photo-1608958416757-59c73335f60b?auto=format&fit=crop&w=600&q=80',
    tagline: 'Gachibowli cyber hubs, premium villas, and luxury residential sectors'
  },
  {
    name: 'Mumbai',
    propertiesCount: 22,
    image: 'https://images.unsplash.com/photo-1570168007244-23704139443d?auto=format&fit=crop&w=600&q=80',
    tagline: 'Arabian sea skylines, Bandra oceanfront, elite complexes'
  },
  {
    name: 'Bangalore',
    propertiesCount: 18,
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
    tagline: 'Indiranagar green zones, Whitefield tech parks, sustainable luxury'
  },
  {
    name: 'Delhi NCR',
    propertiesCount: 14,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    tagline: 'DLF Gurugram expressway towers, premium complexes, high-rises'
  }
];

export const STATS = [
  { value: '25K+', label: 'Acre Property Leads' },
  { value: '4.95', label: 'Average Trust Audit' },
  { value: '350+', label: 'Pre-vetted Land Developers' },
  { value: '₹9.4K Cr', label: 'Completed Title Transactions' }
];
