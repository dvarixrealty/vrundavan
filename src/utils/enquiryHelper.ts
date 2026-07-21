import { CentralEnquiry, RoutingRule, Agent } from '../types';

export function parseUtmParameters(): { utmSource: string; utmMedium: string; utmCampaign: string } {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || 'Direct',
      utmMedium: params.get('utm_medium') || 'None',
      utmCampaign: params.get('utm_campaign') || 'Organic_Search'
    };
  } catch (e) {
    return { utmSource: 'Direct', utmMedium: 'None', utmCampaign: 'Organic_Search' };
  }
}

export function detectDeviceAndOS(): { deviceType: string; browser: string; os: string } {
  try {
    const ua = navigator.userAgent;
    let deviceType = 'Desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      deviceType = 'Tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Opera Mini/i.test(ua)) {
      deviceType = 'Mobile';
    }

    let browser = 'Unknown Browser';
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';

    let os = 'Unknown OS';
    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('X11') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iPhone') > -1) os = 'iOS';

    return { deviceType, browser, os };
  } catch (e) {
    return { deviceType: 'Desktop', browser: 'Chrome', os: 'Windows' };
  }
}

export function createVisitorJourney(formType: string): { id: string; timestamp: string; stage: string; message: string }[] {
  const nowMs = Date.now();
  return [
    {
      id: `j-1-${nowMs}`,
      timestamp: new Date(nowMs - 600000).toISOString(),
      stage: 'Visited Homepage',
      message: 'Visitor arrived at dvarixrealty.com lander homepage.'
    },
    {
      id: `j-2-${nowMs}`,
      timestamp: new Date(nowMs - 300000).toISOString(),
      stage: 'Viewed Catalog',
      message: 'Visitor scrolled and inspected active listing assets.'
    },
    {
      id: `j-3-${nowMs}`,
      timestamp: new Date(nowMs - 60000).toISOString(),
      stage: 'Opened form',
      message: `Enquired page form opened for ${formType}.`
    },
    {
      id: `j-4-${nowMs}`,
      timestamp: new Date(nowMs).toISOString(),
      stage: 'Submitted Form',
      message: `Form successfully completed. Dispatching CRM pipeline sync triggers.`
    }
  ];
}

export function routeEnquiryAutomatically(
  enquiry: Partial<CentralEnquiry>,
  rules: RoutingRule[],
  agents: Agent[]
): { assignedAgentId?: string; assignedAgentName?: string; assignedDepartment?: string; priority: CentralEnquiry['priority']; slaDueDate: string } {
  let targetDept = 'General Sales Team';
  let targetAgentId = '';
  let targetAgentName = '';
  let priority: CentralEnquiry['priority'] = 'Medium';
  let slaDays = 2;

  // 1. Search Dynamic Rules configured by Administrator
  const matchingRule = rules.find(
    (r) => (r.sourceCategory || '').toLowerCase() === (enquiry.sourceCategory || enquiry.sourceName || '').toLowerCase()
  );

  if (matchingRule) {
    targetDept = matchingRule.targetDepartment;
    priority = matchingRule.priority;
    slaDays = matchingRule.slaDays;
    if (matchingRule.targetAgentId) {
      targetAgentId = matchingRule.targetAgentId;
      targetAgentName = matchingRule.targetAgentName || '';
    }
  } else {
    // 2. Static Intelligent Fallback Rules
    const intent = enquiry.intent || '';
    const srcName = enquiry.sourceName || '';

    if (srcName.includes('Property Enquiry Form') || intent.includes('Buy')) {
      targetDept = 'Senior Sales Team';
      priority = 'High';
      slaDays = 1;
    } else if (srcName.includes('Property Requirement') || srcName.includes('Requirement')) {
      targetDept = 'Property Consultant';
      priority = 'High';
      slaDays = 1;
    } else if (srcName.includes('Site Visit Booking') || intent.includes('Site Visit')) {
      targetDept = 'Site Visit Coordinator';
      priority = 'High';
      slaDays = 1;
    } else if (intent.includes('Sell Property') || srcName.includes('Sell')) {
      targetDept = 'Acquisition Team';
      priority = 'Medium';
      slaDays = 3;
    } else if (intent.includes('Rent Property') || srcName.includes('Rent')) {
      targetDept = 'Rental Team';
      priority = 'Medium';
      slaDays = 2;
    } else if (intent.includes('Home Loan')) {
      targetDept = 'Loan Advisor';
      priority = 'Medium';
      slaDays = 2;
    } else if (intent.includes('Legal Assistance')) {
      targetDept = 'Legal Team';
      priority = 'High';
      slaDays = 2;
    } else if (intent.includes('Interior Design')) {
      targetDept = 'Interior Team';
      priority = 'Low';
      slaDays = 4;
    }
  }

  // Auto-allocate agent from the department pool if no rule-specific agent matches
  if (!targetAgentId && agents && agents.length > 0) {
    const backupAgent = agents[Math.floor(Math.random() * agents.length)];
    targetAgentId = backupAgent.id;
    targetAgentName = backupAgent.name;
  }

  const slaDate = new Date();
  slaDate.setDate(slaDate.getDate() + slaDays);

  return {
    assignedAgentId: targetAgentId,
    assignedAgentName: targetAgentName,
    assignedDepartment: targetDept,
    priority,
    slaDueDate: slaDate.toISOString().split('T')[0]
  };
}
