import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Check, 
  PhoneCall, 
  ArrowRight,
  Database,
  Smartphone,
  Calendar,
  Layers,
  MapPin,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomRequirement, Property, FAQ } from '../types';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';

interface RealtyChatbotProps {
  onAddRequirement: (data: Omit<CustomRequirement, 'id' | 'status' | 'date'>) => void;
  onOpenCustomRequestForm: () => void;
  properties?: Property[];
  faqs?: FAQ[];
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  quickReplies?: string[];
  productCard?: Property;
  serviceId?: string;
}

export default function RealtyChatbot({ 
  onAddRequirement, 
  onOpenCustomRequestForm, 
  properties: liveProperties, 
  faqs: liveFaqs 
}: RealtyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Dynamic knowledge sources populated from Firestore real-time streams
  const [dbKnowledge, setDbKnowledge] = useState<any[]>([]);
  const [dbDocuments, setDbDocuments] = useState<any[]>([]);
  const [dbWebsites, setDbWebsites] = useState<any[]>([]);
  const [dbSnippets, setDbSnippets] = useState<any[]>([]);

  // Real-time Widget Configuration from Firestore
  const [dbConfig, setDbConfig] = useState<any>({
    botName: 'Dvarix AI Assistant',
    botMission: 'Understand customer requirements naturally and help guide them through premium real estate solutions.',
    style: 'Warm',
    introMessage: 'Hello! Welcome to Dvarix Realty. How can I help you explore plots, luxury villas, apartments, or premium services today? 🏠',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    primaryColor: '#ff5a3c',
    welcomeMessage: 'Hi there! Looking for your dream property? Let\'s chat!',
    showBranding: true,
    intelligenceMode: true
  });

  // Lead Collection State
  const [isCollectingLead, setIsCollectingLead] = useState(false);
  const [leadStep, setLeadStep] = useState<'NAME' | 'PHONE' | 'BUDGET' | 'LOCATION' | 'DONE'>('NAME');
  
  const [leadForm, setLeadForm] = useState({
    fullName: '',
    mobileNumber: '',
    budgetRange: '',
    preferredLocation: '',
    customNote: ''
  });

  // Dynamic Conversation Flows state
  const [activeFlows, setActiveFlows] = useState<any[]>([]);
  const [currentFlow, setCurrentFlow] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [flowResponses, setFlowResponses] = useState<Record<string, any>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize and subscribe to Firestore config settings and knowledge sources in real-time
  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'chatbot_settings', 'config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setDbConfig((prev: any) => ({ ...prev, ...data }));
      }
    }, (err) => {
      console.warn("Could not load real-time chatbot config:", err);
    });

    const unsubKb = onSnapshot(query(collection(db, 'chatbot_knowledge')), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setDbKnowledge(list);
    }, (err) => console.warn("Could not sync Q&A:", err));

    const unsubDocs = onSnapshot(query(collection(db, 'chatbot_documents')), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setDbDocuments(list);
    }, (err) => console.warn("Could not sync Documents:", err));

    const unsubWebsites = onSnapshot(query(collection(db, 'chatbot_websites')), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setDbWebsites(list);
    }, (err) => console.warn("Could not sync Websites:", err));

    const unsubSnippets = onSnapshot(query(collection(db, 'chatbot_snippets')), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setDbSnippets(list);
    }, (err) => console.warn("Could not sync Snippets:", err));

    const unsubFlows = onSnapshot(query(collection(db, 'chatbot_flows')), (snap) => {
      const list: any[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.enabled) {
          list.push({ id: d.id, ...data });
        }
      });
      setActiveFlows(list);
    }, (err) => console.warn("Could not sync Chatbot Flows:", err));

    return () => {
      unsubConfig();
      unsubKb();
      unsubDocs();
      unsubWebsites();
      unsubSnippets();
      unsubFlows();
    };
  }, []);

  // Initial greeting message based on loaded config
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-init',
          sender: 'bot',
          text: dbConfig.introMessage || "Hello! Welcome to Dvarix Realty. How can I help you explore plots, luxury villas, apartments, or premium services today? 🏠",
          timestamp: new Date(),
          quickReplies: [
            '🔍 Browse Active Projects',
            '🏡 Investment Guidance',
            '💼 Dvarix Services FAQ',
            '📅 Book a Site Visit'
          ]
        }
      ]);
    }
  }, [messages, dbConfig.introMessage]);

  // Scroll to new messages
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const addBotMessage = (text: string, quickReplies?: string[], productCard?: Property, serviceId?: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text,
        timestamp: new Date(),
        quickReplies,
        productCard,
        serviceId
      }
    ]);
  };

  // Human-formatted Indian currency values (e.g. 54.99 Lakhs, 1.45 Crores)
  const formatIndianCurrency = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(num / 100000).toFixed(2)} Lakhs`;
  };

  // The Intelligent Response and Parsing Engine (Dynamic Grounding)
  const processAnswer = (userInput: string) => {
    if (!userInput.trim()) return;

    // Append user query to thread
    setMessages(prev => [
      ...prev,
      {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        text: userInput,
        timestamp: new Date()
      }
    ]);

    setInputText('');

    setTimeout(() => {
      // ----------------------------------------------------
      // CASE A: We are currently in a dynamic flow sequence!
      // ----------------------------------------------------
      if (currentFlow) {
        const step = currentFlow.steps[currentStepIndex];
        
        // 1. Validate user input
        let errorMsg = '';
        if (step.required && !userInput.trim()) {
          errorMsg = `This information is required. Please provide a response.`;
        } else if (userInput.trim()) {
          const rules = step.validationRules || {};
          if (rules.minChars && userInput.trim().length < Number(rules.minChars)) {
            errorMsg = `Please provide a slightly longer response (minimum ${rules.minChars} characters).`;
          } else if (rules.phone) {
            const cleanPhone = userInput.replace(/[^0-9]/g, '');
            if (cleanPhone.length < 10) {
              errorMsg = `Please enter a valid 10-digit mobile number.`;
            }
          } else if (rules.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userInput.trim())) {
              errorMsg = `Please write a valid standard email address.`;
            }
          } else if (rules.numeric) {
            if (isNaN(Number(userInput.trim()))) {
              errorMsg = `Please input a numeric value only.`;
            }
          }
        }

        if (errorMsg) {
          addBotMessage(`⚠️ ${errorMsg}\n\n${step.question}`, step.options);
          return;
        }

        // Save response parameters
        const updatedResponses = {
          ...flowResponses,
          [step.field]: userInput
        };
        setFlowResponses(updatedResponses);

        // Find next valid step index matching conditional logic boundaries
        const getNextIdx = (startIndex: number, resp: any) => {
          let idx = startIndex;
          while (idx < currentFlow.steps.length) {
            const s = currentFlow.steps[idx];
            if (!s.conditionalEnabled) {
              return idx;
            }
            const fieldVal = resp[s.conditionalField];
            const matchVal = s.conditionalValue;
            const op = s.conditionalOperator || 'equals';
            let isMet = false;
            
            if (fieldVal !== undefined) {
              if (op === 'equals') {
                isMet = String(fieldVal).trim().toLowerCase() === String(matchVal).trim().toLowerCase();
              } else if (op === 'contains') {
                isMet = String(fieldVal).toLowerCase().includes(String(matchVal).toLowerCase());
              } else if (op === '>') {
                isMet = Number(fieldVal) > Number(matchVal);
              } else if (op === '<') {
                isMet = Number(fieldVal) < Number(matchVal);
              }
            }
            if (isMet) return idx;
            idx++;
          }
          return idx;
        };

        const nextStepIndex = getNextIdx(currentStepIndex + 1, updatedResponses);

        if (nextStepIndex < currentFlow.steps.length) {
          setCurrentStepIndex(nextStepIndex);
          const nextStep = currentFlow.steps[nextStepIndex];
          addBotMessage(nextStep.question, nextStep.options);
        } else {
          // Flow is completed! Output post-completion actions and summarize!
          setCurrentFlow(null);
          setCurrentStepIndex(0);
          setFlowResponses({});

          // Construct lead payload from dynamic responses
          const leadId = 'lead-dynamic-' + Date.now();
          const leadPayload = {
            id: leadId,
            fullName: updatedResponses.fullName || updatedResponses.name || updatedResponses.firstName || 'Client Inquirer',
            mobileNumber: updatedResponses.mobileNumber || updatedResponses.phone || updatedResponses.phoneNumber || '0000000000',
            emailAddress: updatedResponses.emailAddress || updatedResponses.email || '',
            city: 'Bangalore',
            lookingFor: currentFlow.category || 'Buy Property',
            propertyType: updatedResponses.propertyType || updatedResponses.type || 'Consultation',
            preferredCity: updatedResponses.preferredLocation || updatedResponses.location || 'Bangalore',
            preferredArea: updatedResponses.preferredLocation || updatedResponses.location || 'Bangalore',
            alternativeLocation: '',
            minBudget: updatedResponses.budgetRange || updatedResponses.budget || 'Flexible',
            maxBudget: updatedResponses.budgetRange || updatedResponses.budget || 'Flexible',
            bhkRequirement: updatedResponses.bhkRequirement || 'Flexible',
            plotSize: 'Flexible',
            readyToMove: 'Yes',
            preferredDate: new Date().toLocaleDateString('en-US'),
            preferredTime: 'Anytime',
            message: `[Dynamic Flow Completed: ${currentFlow.title}] Responses Captured:\n${Object.entries(updatedResponses)
              .map(([k, v]) => `• ${k}: ${v}`)
              .join('\n')}`,
            timeline: 'Immediately',
            submissionType: 'Requirement' as const
          };

          // 1. CRM Lead sync
          if (currentFlow.actions?.createLead) {
            onAddRequirement(leadPayload);
          }

          // 2. Booking a Site Visit (if bookSiteVisit trigger is configured)
          if (currentFlow.actions?.bookSiteVisit) {
            try {
              const visitEvent = new CustomEvent('cms-alert-notification', {
                detail: {
                  message: `Automated Virtual Tour scheduled for ${leadPayload.fullName} in ${leadPayload.preferredArea}!`,
                  type: 'visit'
                }
              });
              window.dispatchEvent(visitEvent);
            } catch (_) {}
          }

          // Trigger server api rules engine
          fetch('/api/chatbot/crm-sync-actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadPayload })
          }).catch(console.warn);

          // Build summary response
          let finalSummaryText = `🎉 **${currentFlow.title || 'Workflow'} Completed!**\n\nThank you, *${leadPayload.fullName}*! Your details have been parsed and securely synchronized with our CRM engine.\n\n**Captured Specifications:**\n${Object.entries(updatedResponses)
            .map(([k, v]) => `• **${k}**: ${v}`)
            .join('\n')}`;

          if (currentFlow.actions?.assignAgent) {
            finalSummaryText += `\n\n🤝 Our dedicated coordinator for **${leadPayload.preferredArea}** has been notified to scan premier matches and reach out to you within 5 minutes.`;
          }

          addBotMessage(finalSummaryText, ['🔍 View All Projects', '📅 Schedule Visit Details']);
        }
        return;
      }

      // Legacy fallback lead collection loop for backward compatibility
      if (isCollectingLead) {
        let currentField = leadStep;
        let nextText = '';
        let nextReplies: string[] = [];

        if (currentField === 'NAME') {
          setLeadForm(prev => ({ ...prev, fullName: userInput }));
          setLeadStep('PHONE');
          nextText = `Pleasure meeting you, *${userInput}*! What is your best **WhatsApp or Mobile number**? Our property coordinator will use this to dispatch brochures and coordinates directly to you.`;
          addBotMessage(nextText);
          return;
        }

        if (currentField === 'PHONE') {
          setLeadForm(prev => ({ ...prev, mobileNumber: userInput }));
          setLeadStep('BUDGET');
          nextText = `Thank you! And what is your comfortable **budget boundary** for this inquiry?`;
          nextReplies = ['Under ₹50 Lakhs', '₹50 Lakhs - ₹1.2 Cr', '₹1.2 Cr - ₹3 Cr', '₹3 Crores+ / Luxury'];
          addBotMessage(nextText, nextReplies);
          return;
        }

        if (currentField === 'BUDGET') {
          setLeadForm(prev => ({ ...prev, budgetRange: userInput }));
          setLeadStep('LOCATION');
          nextText = `Excellent! Finally, what is your **preferred location zone or submarket**? (e.g. JP Nagar, Devanahalli, Whitefield, Hennur Road, or Gachibowli)`;
          nextReplies = ['JP Nagar', 'Whitefield', 'Devanahalli', 'Hennur Road', 'Gachibowli'];
          addBotMessage(nextText, nextReplies);
          return;
        }

        if (currentField === 'LOCATION') {
          const finalZone = userInput;
          const completedForm = {
            ...leadForm,
            preferredLocation: finalZone
          };
          setLeadForm(completedForm);
          setLeadStep('DONE');
          setIsCollectingLead(false);

          const leadId = 'lead-sim-' + Date.now();
          const leadPayload = {
            id: leadId,
            fullName: completedForm.fullName,
            mobileNumber: completedForm.mobileNumber,
            emailAddress: '',
            city: 'Bangalore',
            lookingFor: 'Buy Property',
            propertyType: 'Consultation',
            preferredCity: completedForm.preferredLocation,
            preferredArea: completedForm.preferredLocation,
            alternativeLocation: '',
            minBudget: completedForm.budgetRange,
            maxBudget: completedForm.budgetRange,
            bhkRequirement: 'Flexible',
            plotSize: 'Flexible',
            readyToMove: 'Yes',
            preferredDate: new Date().toLocaleDateString('en-US'),
            preferredTime: 'Anytime',
            message: completedForm.customNote || `Discussing customized match in ${completedForm.preferredLocation}`,
            timeline: 'Immediately',
            submissionType: 'Requirement' as const
          };

          onAddRequirement(leadPayload);

          fetch('/api/chatbot/crm-sync-actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadPayload })
          })
          .then(res => res.json())
          .then(res => {
            const agentName = res.assignedAgent || 'Expert Match Desk';
            const ruleName = res.matchedRuleName || 'General Coordinator Desk';
            console.log(`CRM automated Lead sync complete. Route: ${agentName} via [${ruleName}]`);
          })
          .catch(err => {
            console.warn("CRM auto action sync error:", err);
          });

          const summaryText = `🎉 **Consultation Request Registered!**

Fantastic job, *${completedForm.fullName}*! Your premium client profile has been registered in the Dvarix core database. Our expert coordinator for **${finalZone}** will scan listings matching your budget (**${completedForm.budgetRange}**) and establish contact immediately.

You can also send your specifications sheet straight to our helpline via WhatsApp below to receive fast-tracked layouts!`;

          addBotMessage(summaryText);
          return;
        }
        return;
      }

      // ----------------------------------------------------
      // CASE B: Standard conversational Q&A grounding
      // ----------------------------------------------------
      const q = userInput.toLowerCase();

      // Check for intent to book, visit, buy, get details, register or contact (Trigger Lead Collection Workflow)
      const isLeadIntent = 
        q.includes('book') || 
        q.includes('visit') || 
        q.includes('buy') || 
        q.includes('interested') || 
        q.includes('contact') || 
        q.includes('phone') || 
        q.includes('call') || 
        q.includes('schedule') || 
        q.includes('appointment') || 
        q.includes('register') || 
        q.includes('expert') ||
        q.includes('inquiry') ||
        q.includes('qualif') ||
        q.includes('agent');

      if (isLeadIntent) {
        // Try to matching dynamic category in active flows
        let matchedFlow = null;
        if (activeFlows.length > 0) {
          if (q.includes('visit') || q.includes('book') || q.includes('schedule')) {
            matchedFlow = activeFlows.find(f => f.category === 'Site Visit Booking' || f.title.toLowerCase().includes('visit'));
          } else if (q.includes('rent') || q.includes('lease')) {
            matchedFlow = activeFlows.find(f => f.category === 'Rental Inquiry Flow' || f.title.toLowerCase().includes('rental'));
          } else if (q.includes('sell')) {
            matchedFlow = activeFlows.find(f => f.category === 'Property Selling Flow' || f.title.toLowerCase().includes('sell'));
          } else if (q.includes('invest')) {
            matchedFlow = activeFlows.find(f => f.category === 'Investment Inquiry Flow' || f.title.toLowerCase().includes('invest'));
          } else if (q.includes('qualif')) {
            matchedFlow = activeFlows.find(f => f.category === 'Lead Qualification Flow' || f.title.toLowerCase().includes('qual'));
          } else if (q.includes('handover') || q.includes('expert') || q.includes('agent')) {
            matchedFlow = activeFlows.find(f => f.category === 'Human Handover Flow' || f.title.toLowerCase().includes('handover'));
          }

          if (!matchedFlow) {
            matchedFlow = activeFlows.find(f => f.category === 'Property Inquiry') || activeFlows[0];
          }
        }

        if (matchedFlow && matchedFlow.steps && matchedFlow.steps.length > 0) {
          setCurrentFlow(matchedFlow);
          setCurrentStepIndex(0);
          setFlowResponses({});
          addBotMessage(`I'd be absolutely delighted to assist you with "${matchedFlow.title}"!\n\nTo begin, ${matchedFlow.steps[0].question}`, matchedFlow.steps[0].options);
          return;
        }

        // Hardcoded legacy fallback if no structured database flows are currently synchronized
        setIsCollectingLead(true);
        setLeadStep('NAME');
        const recentPropMsg = messages.slice().reverse().find(m => m.productCard);
        const customNoteText = recentPropMsg 
          ? `Interested in ${recentPropMsg.productCard?.title} at ${recentPropMsg.productCard?.address}`
          : `Requested callback regarding real estate inquiry: "${userInput}"`;
        
        setLeadForm(prev => ({ ...prev, customNote: customNoteText }));

        const preIntro = `I would be absolutely delighted to schedule a personalized callback or property tour for you! 🏠\n\nTo coordinate details and dispatch accurate pricing brochures, may I obtain your **Full Name**?`;
        addBotMessage(preIntro);
        return;
      }

      // Check first: Are we in Intelligence Mode?
      const isIntel = dbConfig.intelligenceMode;
      const listingsPool = liveProperties && liveProperties.length > 0 ? liveProperties : [];
      const faqsPool = isIntel && liveFaqs && liveFaqs.length > 0 ? liveFaqs : [];

      if (isIntel) {
        // CALL REAL SERVER-SIDE GEMINI FOR THE ULTIMATE EXPERT EXPERIENCE!
        fetch('/api/chatbot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userInput,
            chatHistory: messages.slice(-5)
          })
        })
        .then(res => res.json())
        .then(result => {
          if (result.success && result.responseText) {
            addBotMessage(result.responseText, ['🔍 Search properties', '📅 Book Site Visit']);
          } else {
            runLocalMatchingFallback();
          }
        })
        .catch(err => {
          console.warn("Client fallback routing triggered on service exception:", err);
          runLocalMatchingFallback();
        });
        return;
      }

      function runLocalMatchingFallback() {
        // PRIORITY 1: Check Manual Q&A Knowledge (chatbot_knowledge)
        const matchedManualQA = dbKnowledge.find(kb => 
          kb.status === 'Active' && (
            q.includes(kb.title.toLowerCase()) || 
            kb.content.toLowerCase().includes(q) ||
            (kb.keywords && kb.keywords.toLowerCase().split(',').some((k: string) => k.trim().length > 3 && q.includes(k.trim())))
          )
        );

        if (matchedManualQA) {
          addBotMessage(`📚 **Manual Q&A Answer found:**\n\n${matchedManualQA.content}\n\n*Reference: ${matchedManualQA.title} (${matchedManualQA.category})*`, ['🔍 Continue explore', '📅 Book Site Visit']);
          return;
        }

        // PRIORITY 2: Check Document Upload Knowledge (chatbot_documents)
        const matchedDoc = dbDocuments.find(doc => 
          doc.status === 'Indexed' && (
            (doc.name && q.includes(doc.name.toLowerCase().replace(/\.(pdf|docx|txt)/g, ''))) ||
            (doc.content && doc.content.toLowerCase().includes(q)) ||
            (doc.snippet && doc.snippet.toLowerCase().includes(q))
          )
        );

        if (matchedDoc) {
          addBotMessage(`📄 **Knowledge extracted from Document [${matchedDoc.name}]:**\n\n${matchedDoc.snippet || matchedDoc.content}\n\n*System reference block verified via dynamic indexing.*`, ['🔍 Scan other documents', '📅 Book Call']);
          return;
        }

        // PRIORITY 3: Check Website Import Knowledge (chatbot_websites)
        const matchedWeb = dbWebsites.find(web => 
          web.status === 'Indexed' && (
            (web.url && q.includes(web.url.toLowerCase())) ||
            (web.content && web.content.toLowerCase().includes(q)) ||
            (web.snippet && web.snippet.toLowerCase().includes(q))
          )
        );

        if (matchedWeb) {
          addBotMessage(`🌐 **Insights extracted from Page [${matchedWeb.url}]:**\n\n${matchedWeb.snippet || matchedWeb.content}\n\n*Dynamically synced crawl index from Dvarix Main Portal.*`, ['🔍 Explore properties', '📅 Book Callback']);
          return;
        }

        // PRIORITY 4: Check Property Database & Location submarkets
        let matchedProperty = listingsPool.find(p => 
          q.includes(p.title.toLowerCase()) || 
          q.includes(p.type.toLowerCase()) ||
          q.includes(p.location.toLowerCase()) ||
          q.includes(p.address.toLowerCase().split(',')[0].toLowerCase())
        );

        // If they typed something like "apartments" or "plots" or "villas" without specific locations
        const wantsPlot = q.includes('plot') || q.includes('land');
        const wantsVilla = q.includes('villa') || q.includes('row house') || q.includes('house');
        const wantsApartment = q.includes('apartment') || q.includes('flat') || q.includes('high-rise');
        const wantsCommercial = q.includes('commercial') || q.includes('office') || q.includes('shop');

        if (!matchedProperty) {
          if (wantsPlot) matchedProperty = listingsPool.find(p => p.type === 'Plot');
          if (wantsVilla) matchedProperty = listingsPool.find(p => p.type === 'Villa');
          if (wantsApartment) matchedProperty = listingsPool.find(p => p.type === 'Apartment');
          if (wantsCommercial) matchedProperty = listingsPool.find(p => p.type === 'Commercial');
        }

        if (matchedProperty) {
          const detailsText = `🏠 **I found an amazing match in our database!**

Our premier project **${matchedProperty.title}** is located directly in **${matchedProperty.address}**. It is a ready-to-explore **${matchedProperty.type}** listing starting at **${formatIndianCurrency(matchedProperty.price)}**.

**Project Overview:**
${matchedProperty.description}

**Primary Amenities:**
${matchedProperty.amenities.map(a => `• ${a}`).join('\n')}

Would you like to speak with **${matchedProperty.agent.name}** (${matchedProperty.agent.role}) or register to book an on-site property tour?`;

          addBotMessage(detailsText, ['📅 Book on-site tour', '📞 Talk to Agent', '🔍 Search other properties'], matchedProperty);
          return;
        }
      }

      if (isIntel) return; // server did response
      runLocalMatchingFallback();

      // 4b. Check for Location Matches specifically
      const isWhitefield = q.includes('whitefield') || q.includes('itpl');
      const isDevanahalli = q.includes('devanahalli') || q.includes('airport');
      const isHennur = q.includes('hennur');
      const isSarjapur = q.includes('sarjapur');
      const isGachibowli = q.includes('gachibowli') || q.includes('hyderabad');
      const isJPNagar = q.includes('jp nagar') || q.includes('jayanagar');

      if (isWhitefield || isDevanahalli || isHennur || isSarjapur || isGachibowli || isJPNagar) {
        let zone = '';
        let zoneProp: Property | undefined;
        if (isWhitefield) { zone = 'Whitefield'; zoneProp = listingsPool.find(p => p.address.includes('Whitefield')); }
        else if (isDevanahalli) { zone = 'Devanahalli'; zoneProp = listingsPool.find(p => p.address.includes('Devanahalli')); }
        else if (isHennur) { zone = 'Hennur Road'; zoneProp = listingsPool.find(p => p.address.includes('Hennur')); }
        else if (isSarjapur) { zone = 'Sarjapur Road'; zoneProp = listingsPool.find(p => p.address.includes('Sarjapur')); }
        else if (isGachibowli) { zone = 'Gachibowli, Hyderabad'; zoneProp = listingsPool.find(p => p.address.includes('Gachibowli')); }
        else if (isJPNagar) { zone = 'JP Nagar, Bangalore'; }

        if (zoneProp) {
          const zoneText = `📍 **Scanning Database for ${zone} Submarket...**

Yes! We have top-tier listings in **${zone}**. A primary recommendation is:
**${zoneProp.title}** (${zoneProp.type}) priced at **${formatIndianCurrency(zoneProp.price)}**.

It features premium connectivity, robust security frameworks, and direct developer clearance.

Would you like details, or would you like to arrange a site visit layout sheet?`;
          addBotMessage(zoneText, [`📅 Book ${zone} Tour`, `🔍 Tell me about ${zoneProp.title}`, '🔙 Back to Main Menu'], zoneProp);
          return;
        } else {
          const generalZoneText = `📍 **Active Search in ${zone} Corridor...**

We are currently acquiring and verifying high-yield residential plots and premium flats in **${zone}**. 

Would you like to register your specific requirements with our regional broker so we can alert you the moment a verified listing passes legal clearance?`;
          addBotMessage(generalZoneText, [`📞 Register for ${zone}`, '🔍 Search different location']);
          return;
        }
      }

      // PRIORITY 5: Check AI Notes / Snippet Knowledge (chatbot_snippets)
      const matchedSnippet = dbSnippets.find(sn => 
        sn.status === 'Active' && (
          (sn.keywords && sn.keywords.toLowerCase().split(',').some((k: string) => q.includes(k.trim()))) ||
          (sn.note && sn.note.toLowerCase().includes(q))
        )
      );

      if (matchedSnippet) {
        addBotMessage(`✍️ **Tuned AI Answer (Snippet Rule):**\n\n${matchedSnippet.note}\n\n*Applied custom-tuned system rule override.*`, ['🏡 Read FAQs', '📅 Book Callback']);
        return;
      }

      // PRIORITY 6: General AI fallback, corporate business service matches & local FAQs
      const isLoan = q.includes('loan') || q.includes('finance') || q.includes('emi') || q.includes('mortgage') || q.includes('bank');
      const isLegal = q.includes('legal') || q.includes('lawyer') || q.includes('agreement') || q.includes('title') || q.includes('clearance');
      const isInterior = q.includes('interior') || q.includes('decor') || q.includes('design') || q.includes('furnish') || q.includes('kitchen');
      const isVastu = q.includes('vastu') || q.includes('shastra') || q.includes('facing') || q.includes('east');
      const isBuild = q.includes('construct') || q.includes('build') || q.includes('blueprint') || q.includes('architecture');

      if (isLoan || isLegal || isInterior || isVastu || isBuild) {
        let serviceTitle = '';
        let serviceDesc = '';

        if (isLoan) {
          serviceTitle = '💼 Specialized Home Loan Processing';
          serviceDesc = 'We provide express, pre-approved mortgage advisory directly partnering with India\'s elite financial institutions (HDFC, SBI, ICICI, Axis Bank). Get zero-fuss processing and competitive interest rates.';
        } else if (isLegal) {
          serviceTitle = '⚖️ Multi-point Legal and Title Verification';
          serviceDesc = 'Every layout and plot under the Dvarix Realty banner undergoes a rigorous, 30-year documentation title search. We prepare clean sales agreements, absolute sale deeds, and coordinate painless registration.';
        } else if (isInterior) {
          serviceTitle = '🎨 High-end Bespoke Interior Services';
          serviceDesc = 'Transform physical dimensions into absolute landmarks. Our customized, factory-finish woodworking, modular German kitchens, and premium light decor schemes come with a 10-year warranty timeline.';
        } else if (isVastu) {
          serviceTitle = '🧭 Scientific Vastu Shastra Compliance Consulting';
          serviceDesc = 'Align your physical sanctuary with ambient kinetic energy profiles. We offer complimentary consultations on entry layout directions, kitchen positioning steps, and master bedroom structural placements.';
        } else if (isBuild) {
          serviceTitle = '🏗️ Design-to-Handover Construction Solutions';
          serviceDesc = 'From raw layout plotting to luxury residential handovers. Our experienced structural engineers and custom architects draft custom blueprints and construct premium brick-and-mortar homes with guaranteed handovers.';
        }

        const serviceText = `🛠️ **Dvarix Core Service Highlights:**

### ${serviceTitle}
${serviceDesc}

We deliver end-to-end support so you never have to coordinate with external independent contractors.

Would you like to request a dedicated callback or custom quote from our Service Head?`;
        
        addBotMessage(serviceText, ['📞 Request Service Callback', '💼 Explore other services', '🏡 Return to Master Menu']);
        return;
      }

      // Check standard mock FAQ matches
      let matchedFaq = faqsPool.find(f => 
        q.includes(f.question.toLowerCase()) || 
        f.question.toLowerCase().split(' ').some(w => w.length > 4 && q.includes(w))
      );

      // Fallback local FAQ match
      if (!matchedFaq) {
        const localFaqAnswers: Record<string, string> = {
          'charge': 'Submitting and registering your properties requirements is **100% free and complimentary**. Dvarix collects brokerage commissions directly from strategic builder listings under certified partnership clearances, ensuring complete buyer transparency.',
          'work': 'Dvarix Realty operates as a premium, requirement-driven real estate advisory. Instead of browsing endless unverified posts, you register your desired parameters (budget, zone, plot size), and our intelligent matching engine sources legally verified, premium opportunities.',
          'types': 'We coordinate transactions on all major realty assets: D-Approved villa sites & plots, ultra-luxury high-profile apartments, independent gated villa corridors, verified commercial blocks, and pristine agriculture farms.'
        };

        const matchedKey = Object.keys(localFaqAnswers).find(k => q.includes(k));
        if (matchedKey) {
          addBotMessage(`ℹ️ **Frequently Asked Questions:**\n\n${localFaqAnswers[matchedKey]}\n\nHow else can I assist your property search?`, ['🔍 Search properties', '📅 Schedule site visit']);
          return;
        }
      }

      if (matchedFaq) {
        const faqText = `ℹ️ **Frequently Asked Questions:**

### ${matchedFaq.question}
${matchedFaq.answer}

Would you like further guidance or to explore properties in this category?`;
        addBotMessage(faqText, ['🔍 Search active properties', '📞 Talk to Dvarix Agent']);
        return;
      }

      // Fallback fallback rule
      addBotMessage(
        "I couldn't find verified information for that request. Please contact Dvarix Realty for accurate assistance.",
        ['📅 Book Callback site visit', '🔍 Search other properties', '💼 Custom interior & constructions design']
      );
    }, 700);
  };

  const handleQuickReplyTap = (reply: string) => {
    // Strip emojis for matching or process action directly
    const clean = reply.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
    
    if (clean === 'Browse Active Projects' || clean === 'Search properties' || clean === 'Search active properties') {
      processAnswer('plots and apartments Bangalore');
    } else if (clean === 'Dvarix Services FAQ' || clean === 'Explore other services') {
      processAnswer('What are your services?');
    } else if (clean === 'Investment Guidance') {
      processAnswer('Tell me about plots in Devanahalli');
    } else if (clean === 'Book a Site Visit' || clean === 'Book Callback / Site Visit' || clean === 'Book on-site tour' || clean.includes('Book') || clean.includes('Register')) {
      processAnswer('I want to arrange a site visit callback');
    } else if (clean === 'Return to Master Menu' || clean === 'Back to Main Menu') {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-bot-reset-${Date.now()}`,
          sender: 'bot',
          text: 'How can I guide your real-estate portfolio today? Select an action below:',
          timestamp: new Date(),
          quickReplies: [
            '🔍 Browse Active Projects',
            '🏡 Investment Guidance',
            '💼 Dvarix Services FAQ',
            '📅 Book a Site Visit'
          ]
        }
      ]);
    } else {
      processAnswer(reply);
    }
  };

  const handleRestartLeadFlow = () => {
    setIsCollectingLead(false);
    setLeadStep('NAME');
    setLeadForm({
      fullName: '',
      mobileNumber: '',
      budgetRange: '',
      preferredLocation: '',
      customNote: ''
    });
    setMessages([]);
  };

  const getWhatsAppLink = () => {
    const textStr = 
      `*DVARIX REALTY - AI ADVISOR MATCH*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *Name:* ${leadForm.fullName}\n` +
      `📱 *Mobile:* ${leadForm.mobileNumber}\n` +
      `📍 *Target Zone:* ${leadForm.preferredLocation}\n` +
      `💰 *Budget Range:* ${leadForm.budgetRange}\n\n` +
      `📝 *Client Requirement Context:* ${leadForm.customNote || 'Custom consultation callback requested.'}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Pre-approved via Dvarix Intelligent AI Assistant_`;

    return `https://wa.me/916300984846?text=${encodeURIComponent(textStr)}`;
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleToggleChat}
          id="realty-chatbot-floating-trigger"
          className="w-14 h-14 bg-slate-900 border-2 border-indigo-600 hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-2xl relative transition-all duration-300 hover:scale-110 group cursor-pointer"
          aria-label="Open Realty Chatbot Assistant"
        >
          {isOpen ? (
            <X className="h-6 w-6 stroke-[2.5px] text-indigo-400" />
          ) : (
            <div className="relative">
              <MessageSquare className="h-6 w-6 stroke-[2.2px] text-indigo-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
            </div>
          )}
          
          {!isOpen && unreadCount > 0 && (
            <span className="absolute right-16 top-3 px-3 py-1 bg-white border border-slate-100 text-slate-800 shadow-xl text-[10px] font-black rounded-xl whitespace-nowrap uppercase tracking-widest font-mono select-none pointer-events-none group-hover:opacity-100 transition duration-200">
              💬 Dvarix AI Advisor
            </span>
          )}
        </button>
      </div>

      {/* Main Chat Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            id="realty-chatbot-container-card"
            className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[420px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-150 flex flex-col font-sans"
          >
            {/* Header section */}
            <div className={`p-4 bg-slate-900 text-white border-b border-light flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center text-indigo-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold tracking-tight flex items-center gap-1.5 text-white">
                    {dbConfig.botName || 'Dvarix AI Assistant'}
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">DVARIX HELPLINE • INTENT ENABLED</p>
                </div>
              </div>
              <button 
                onClick={handleToggleChat}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition duration-150"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chatbot Thread Viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`p-3 rounded-xl text-left text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                          : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none font-sans'
                      }`}
                    >
                      {/* Formatted parser */}
                      {msg.text.split('\n').map((para, pi) => {
                        if (para.startsWith('### ')) {
                          return <h5 key={pi} className="font-bold text-slate-900 mt-2 mb-1 text-xs uppercase tracking-wider font-mono value-header">{para.slice(4)}</h5>;
                        }
                        return (
                          <p key={pi} className={pi > 0 ? 'mt-1.5' : ''}>
                            {para.split(' ').map((word, wi) => {
                              // support safe double star formats
                              if (word.startsWith('**') && word.endsWith('**')) {
                                return <strong key={wi} className="text-slate-900 font-bold">{word.slice(2, -2)} </strong>;
                              }
                              if (word.startsWith('*') && word.endsWith('*')) {
                                return <strong key={wi} className="text-slate-900 font-bold">{word.slice(1, -1)} </strong>;
                              }
                              return word + ' ';
                            })}
                          </p>
                        );
                      })}

                      {/* Display matched visual property model card */}
                      {msg.productCard && (
                        <div className="mt-3 border border-slate-150 bg-slate-50 rounded-lg overflow-hidden text-slate-700 shadow-2xs">
                          <img 
                            src={msg.productCard.image} 
                            alt={msg.productCard.title} 
                            className="w-full h-28 object-cover object-center" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="p-2.5 text-left space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono">
                                {msg.productCard.type}
                              </span>
                              <span className="text-xs font-bold text-indigo-600 font-sans">
                                {formatIndianCurrency(msg.productCard.price)}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 leading-tight font-sans mt-1">{msg.productCard.title}</h5>
                            <p className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 text-slate-400" /> {msg.productCard.address}
                            </p>
                            <button
                              onClick={() => {
                                setIsCollectingLead(true);
                                setLeadStep('NAME');
                                setLeadForm(prev => ({
                                  ...prev,
                                  customNote: `Requested details for: ${msg.productCard?.title} at ${msg.productCard?.address}`
                                }));
                                addBotMessage(`I am happy to organize an exclusive VIP brochure package for **${msg.productCard?.title}**. Let's register your consultation profile! May I obtain your **Full Name**?`);
                              }}
                              className="w-full text-center py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold block mt-2 transition"
                            >
                              Inquire & Request Floor Plan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick replies */}
                    {msg.sender === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.quickReplies.map((reply, ri) => (
                          <button
                            key={ri}
                            onClick={() => handleQuickReplyTap(reply)}
                            className="bg-white hover:bg-slate-100 text-slate-800 hover:text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200 transition active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1 leading-none"
                          >
                            <span>{reply}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-indigo-600" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 mt-1">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* CRM Completed Banner */}
              {leadStep === 'DONE' && (
                <div id="realty-chatbot-success-banner" className="bg-green-50 border border-green-150 p-4 rounded-xl space-y-2.5 animate-fadeIn text-left">
                  <div className="flex items-center gap-2 text-green-800 font-bold text-xs font-mono">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>CRM LEAD REGISTERED</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">
                    A secure client mandate profile has been compiled in our database system catalog. To instantly establish a prioritised WhatsApp discussion desk with Raghav Reddy or regional lead, click below:
                  </p>
                  
                  <div className="bg-white border border-slate-100 p-2.5 rounded text-[10px] text-slate-600 font-mono space-y-1">
                    <div>👤 <strong>Name:</strong> {leadForm.fullName}</div>
                    <div>📱 <strong>Mobile:</strong> {leadForm.mobileNumber}</div>
                    <div>📍 <strong>Area:</strong> {leadForm.preferredLocation}</div>
                    <div>💰 <strong>Budget:</strong> {leadForm.budgetRange}</div>
                  </div>

                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition shadow-xs cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    Dispatch to WhatsApp
                  </a>
                  <button
                    onClick={handleRestartLeadFlow}
                    className="w-full text-center text-[10px] font-mono text-slate-400 hover:text-slate-600 transition underline block mt-2"
                  >
                    Start a New Property Search
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input keyboard tray */}
            <div className="p-3 bg-white border-t border-slate-150 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    processAnswer(inputText);
                  }
                }}
                placeholder={leadStep === 'DONE' ? "Consultation Finished!" : "Ask Dvarix AI Assistant..."}
                disabled={leadStep === 'DONE'}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs outline-none transition text-slate-800 select-all"
              />
              <button
                onClick={() => processAnswer(inputText)}
                disabled={!inputText.trim() || leadStep === 'DONE'}
                className="p-2.5 bg-indigo-600 disabled:bg-slate-100 text-white disabled:text-slate-300 rounded-xl transition cursor-pointer"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom request modal launcher */}
            <div className="bg-slate-50 border-t border-slate-150 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500 font-sans">
              <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> Need custom coordinates?</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenCustomRequestForm();
                }}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Traditional Grid Form
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
