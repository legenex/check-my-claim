// Signal Engine utilities and helpers

// PII patterns to strip from raw payloads
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  zip_plus_four: /\b\d{5}-\d{4}\b/g,
  vin: /\b[A-HJ-NPR-Z0-9]{17}\b/g,
  license_plate: /\b[A-Z0-9]{2,8}\b/g,
};

// Names to detect (basic first/last name patterns)
const NAME_INDICATORS = /\b(?:victim|driver|operator|deceased|injured|person|resident|suspect|plaintiff|defendant)s?\b/gi;

/**
 * Strip personally identifiable information from a payload
 * @param {object} payload - Raw data object
 * @returns {object} - Payload with PII removed, count of strips
 */
export function stripPII(payload) {
  let piiCount = 0;
  const stripped = JSON.parse(JSON.stringify(payload));
  
  function traverse(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key in obj) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        // Check for email, phone, SSN, etc.
        for (const [pattern_name, pattern] of Object.entries(PII_PATTERNS)) {
          if (pattern.test(value)) {
            obj[key] = `[${pattern_name.toUpperCase()}_REDACTED]`;
            piiCount++;
          }
        }
        
        // Check for name-like fields
        if (NAME_INDICATORS.test(value)) {
          obj[key] = '[NAME_REDACTED]';
          piiCount++;
        }
      } else if (typeof value === 'object') {
        traverse(value);
      }
    }
  }
  
  traverse(stripped);
  return { stripped, piiCount };
}

/**
 * Calculate severity score (1-10)
 */
export function calculateSeverityScore(eventType, metadata) {
  const severityMap = {
    'fatal_crash': metadata?.fatality_count >= 3 ? 10 : metadata?.fatality_count === 1 ? 8 : 7,
    'vehicle_recall': metadata?.affected_vehicles >= 1000000 ? 10 : metadata?.affected_vehicles >= 100000 ? 8 : 6,
    'aviation_incident': 10,
    'commercial_crash': 8,
    'rail_incident': 9,
    'workplace_fatality': 7,
    'drug_recall': metadata?.severity_level === 'serious' ? 8 : 6,
    'device_recall': 6,
    'food_outbreak': 5,
    'mdl_filing': 7,
    'injury_crash': 5,
    'other': 3,
  };
  return Math.min(10, severityMap[eventType] || 3);
}

/**
 * Calculate volume score (1-10) based on event frequency in area
 */
export function calculateVolumeScore(eventCount) {
  if (eventCount <= 1) return 2;
  if (eventCount <= 3) return 4;
  if (eventCount <= 7) return 6;
  if (eventCount <= 15) return 8;
  return 10;
}

/**
 * Calculate wealth score (1-10) from median household income
 */
export function calculateWealthScore(medianIncome) {
  if (!medianIncome) return 5;
  // Scale: $25k = 1, $100k = 10
  const normalized = Math.min(10, Math.max(1, (medianIncome - 25000) / 7500));
  return Math.round(normalized);
}

/**
 * Calculate urgency score (1-10) based on event type and age
 */
export function calculateUrgencyScore(eventType, eventAgeHours) {
  const baseMap = {
    'vehicle_recall': 9,
    'fatal_crash': 8,
    'mdl_filing': 7,
    'commercial_crash': 7,
    'workplace_fatality': 6,
    'injury_crash': 5,
    'drug_recall': 6,
    'device_recall': 5,
    'aviation_incident': 8,
    'food_outbreak': 6,
    'other': 3,
  };
  
  let score = baseMap[eventType] || 3;
  
  // Decay over time (half-life varies by type)
  const halfLife = eventType === 'vehicle_recall' ? 168 : eventType === 'fatal_crash' ? 504 : 336; // hours
  const decayFactor = Math.pow(0.5, eventAgeHours / halfLife);
  score = Math.round(score * decayFactor);
  
  return Math.max(1, Math.min(10, score));
}

/**
 * Calculate competition score (1-10, inverted: low = less competition = good)
 */
export function calculateCompetitionScore(affectedArea, eventType) {
  // Metro areas have higher competition
  const metroAreas = ['NY', 'CA', 'TX', 'FL', 'IL'];
  const isMetro = metroAreas.some(state => affectedArea?.includes(state));
  
  // Higher score = more competition
  const baseScore = isMetro ? 7 : 3;
  
  // National event coverage increases competition
  const eventWeight = eventType === 'vehicle_recall' ? 2 : eventType === 'mdl_filing' ? 1.5 : 0;
  
  return Math.min(10, baseScore + eventWeight);
}

/**
 * Calculate composite score (1-100) using weighted sub-scores
 */
export function calculateCompositeScore(scores, weights) {
  const {
    severity = 5,
    volume = 5,
    wealth = 5,
    urgency = 5,
    competition = 5,
  } = scores;
  
  const {
    severity: severityWeight = 0.30,
    volume: volumeWeight = 0.20,
    wealth: wealthWeight = 0.20,
    urgency: urgencyWeight = 0.20,
    competition: competitionWeight = 0.10,
  } = weights;
  
  const weighted =
    (severity * severityWeight +
      volume * volumeWeight +
      wealth * wealthWeight +
      urgency * urgencyWeight +
      (10 - competition) * competitionWeight) / 10; // Invert competition
  
  return Math.round(weighted * 100);
}

/**
 * Map event type to recommended campaigns
 */
export function getRecommendedCampaigns(eventType) {
  const campaignMap = {
    'fatal_crash': ['general_auto_accident', 'wrongful_death'],
    'commercial_crash': ['commercial_truck_accident', 'fmcsa_violations'],
    'vehicle_recall': ['product_liability_auto', 'defective_vehicle_lawsuit'],
    'workplace_fatality': ['workers_comp', 'workplace_wrongful_death'],
    'aviation_incident': ['aviation_accident', 'mass_casualty'],
    'rail_incident': ['rail_accident', 'mass_casualty'],
    'drug_recall': ['mass_tort_pharma', 'medical_malpractice'],
    'device_recall': ['medical_device_injury', 'medical_malpractice'],
    'food_outbreak': ['food_poisoning_lawsuit', 'class_action_intake'],
    'mdl_filing': ['mass_tort_general'],
    'injury_crash': ['general_personal_injury'],
    'other': ['general_personal_injury'],
  };
  
  return campaignMap[eventType] || ['general_personal_injury'];
}

/**
 * Generate creative angles based on event type (targeting-appropriate)
 */
export function generateCreativeAngles(eventType, affectedArea, metadata = {}) {
  const angles = {
    'fatal_crash': [
      `Injured in a fatal crash? Free legal consultation.`,
      `Lost a loved one in a vehicle accident? Know your rights.`,
      `Fatal crashes in ${affectedArea} — protect your family.`,
      `Accident victim? You may qualify for compensation.`,
      `Serious crash injury? Get a free case review today.`,
    ],
    'commercial_crash': [
      `Hit by a commercial truck? Free case review.`,
      `Truck accident victims — know your legal options.`,
      `Commercial trucking accidents in ${affectedArea} — we can help.`,
      `Injured by a commercial vehicle? Free consultation.`,
      `Trucking accident? You may have a valid claim.`,
    ],
    'vehicle_recall': [
      `Was your vehicle recalled? You may have legal options.`,
      `Injured by a recalled vehicle? Get legal help.`,
      `Vehicle recall affecting you? Free case review.`,
      `Defective vehicle caused injury? Know your rights.`,
      `Recalled vehicle injury — free legal consultation.`,
    ],
    'workplace_fatality': [
      `Workplace injury or fatality? Know your rights.`,
      `Lost a loved one at work? Wrongful death claim.`,
      `Workplace accident victim? Free legal review.`,
      `Work injury compensation — get expert help.`,
      `Family of workplace fatality? We can help.`,
    ],
    'aviation_incident': [
      `Airline accident? Mass casualty legal options.`,
      `Aviation incident victim? Know your rights.`,
      `Plane crash injury? Free case consultation.`,
      `Aviation accident — wrongful death attorney.`,
      `Air travel injury? Legal representation available.`,
    ],
    'drug_recall': [
      `Prescribed recalled medication? You may qualify for compensation.`,
      `Drug side effects causing injury? Free legal help.`,
      `Medication recall affected you? Know your options.`,
      `Pharmaceutical injury claim — free case review.`,
      `Bad drug damage? Seek compensation now.`,
    ],
    'food_outbreak': [
      `Food poisoning from contaminated product? Lawsuit available.`,
      `Outbreak victim? You may have a food safety claim.`,
      `Food poisoning lawyer — free case review.`,
      `Contaminated food injury? Legal compensation possible.`,
      `Foodborne illness claim — expert legal help.`,
    ],
  };
  
  return angles[eventType] || [
    `Personal injury? Free legal consultation.`,
    `Injured? Know your legal rights.`,
    `Accident victim? Compensation may be available.`,
    `Legal help for injury victims — free review.`,
    `You may qualify for damages. Get free advice.`,
  ];
}

/**
 * Recommend budget range based on composite score
 */
export function recommendBudgetRange(compositeScore) {
  if (compositeScore >= 85) return { low: 10000, high: 50000 };
  if (compositeScore >= 70) return { low: 3000, high: 10000 };
  if (compositeScore >= 60) return { low: 1000, high: 3000 };
  return { low: 500, high: 1500 };
}

export default {
  stripPII,
  calculateSeverityScore,
  calculateVolumeScore,
  calculateWealthScore,
  calculateUrgencyScore,
  calculateCompetitionScore,
  calculateCompositeScore,
  getRecommendedCampaigns,
  generateCreativeAngles,
  recommendBudgetRange,
};