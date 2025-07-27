│ │ /*                                                                                                                                           │ │
│ │   app-simplified.js – EPRA Learning Simplified Application                                                                                   │ │
│ │   --------------------------------------------------------                                                                                   │ │
│ │   Simplified version with only Chat and Learning modules:                                                                                    │ │
│ │   • Chat interface with Claude integration                                                                                                   │ │
│ │   • Enhanced learning module system with EP4 content                                                                                         │ │
│ │   • Progress tracking with localStorage persistence                                                                                          │ │
│ │   • Removed dashboard and toolkit functionality                                                                                              │ │
│ │ */                                                                                                                                           │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Static Data ------------------------------------------------                                                             │ │
│ │ const DATA = {                                                                                                                               │ │
│ │   // Enhanced Learning Modules with comprehensive EP4 content                                                                                │ │
│ │   enhanced_learning_modules: [                                                                                                               │ │
│ │     {                                                                                                                                        │ │
│ │       id: "ep4-intro",                                                                                                                       │ │
│ │       title: "Introduction to Equator Principles EP4",                                                                                       │ │
│ │       description: "Understand the fundamentals of EP4 and its application",                                                                 │ │
│ │       difficulty: "Beginner",                                                                                                                │ │
│ │       estimatedTime: "15 minutes",                                                                                                           │ │
│ │       questions: [                                                                                                                           │ │
│ │         {                                                                                                                                    │ │
│ │           q: "What is the primary purpose of the Equator Principles?",                                                                       │ │
│ │           options: [                                                                                                                         │ │
│ │             "To provide a risk management framework for determining, assessing and managing environmental and social risk in projects",      │ │
│ │             "To set interest rates for project finance",                                                                                     │ │
│ │             "To regulate government lending policies",                                                                                       │ │
│ │             "To establish currency exchange standards"                                                                                       │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 0,                                                                                                                         │ │
│ │           explanation: "The Equator Principles provide a risk management framework for financial institutions to determine, assess and       │ │
│ │ manage environmental and social risks in project finance transactions."                                                                      │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "Which version of the Equator Principles is currently in effect?",                                                              │ │
│ │           options: ["EP3", "EP4", "EP5", "EP2"],                                                                                             │ │
│ │           answer: 1,                                                                                                                         │ │
│ │           explanation: "EP4 (Equator Principles 4) came into effect in July 2020 and is the current version."                                │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "What is the minimum project capital cost threshold for EP4 application?",                                                      │ │
│ │           options: ["USD 5 million", "USD 10 million", "USD 15 million", "USD 25 million"],                                                  │ │
│ │           answer: 1,                                                                                                                         │ │
│ │           explanation: "EP4 applies to project finance transactions with total project capital costs of USD 10 million or more."             │ │
│ │         }                                                                                                                                    │ │
│ │       ]                                                                                                                                      │ │
│ │     },                                                                                                                                       │ │
│ │     {                                                                                                                                        │ │
│ │       id: "categorization",                                                                                                                  │ │
│ │       title: "Project Categorization (A, B, C)",                                                                                             │ │
│ │       description: "Learn how to properly categorize projects based on environmental and social risks",                                      │ │
│ │       difficulty: "Intermediate",                                                                                                            │ │
│ │       estimatedTime: "20 minutes",                                                                                                           │ │
│ │       questions: [                                                                                                                           │ │
│ │         {                                                                                                                                    │ │
│ │           q: "A large-scale mining project in a biodiversity hotspot with significant community displacement would most likely be            │ │
│ │ categorized as:",                                                                                                                            │ │
│ │           options: ["Category A", "Category B", "Category C"],                                                                               │ │
│ │           answer: 0,                                                                                                                         │ │
│ │           explanation: "Category A projects have potential significant adverse environmental or social risks and/or impacts that are         │ │
│ │ diverse, irreversible, or unprecedented. Large-scale mining with biodiversity and social impacts fits this description."                     │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "Which factors determine project categorization?",                                                                              │ │
│ │           options: [                                                                                                                         │ │
│ │             "Only environmental impacts",                                                                                                    │ │
│ │             "Only social impacts",                                                                                                           │ │
│ │             "Environmental and social risks and impacts, considering type, location, sensitivity, scale, nature and magnitude",              │ │
│ │             "Project cost alone"                                                                                                             │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 2,                                                                                                                         │ │
│ │           explanation: "Categorization is based on environmental and social risks considering multiple factors including type, location,     │ │
│ │ sensitivity, scale, nature and magnitude of potential impacts."                                                                              │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "A Category C project is characterized by:",                                                                                    │ │
│ │           options: [                                                                                                                         │ │
│ │             "Significant adverse impacts",                                                                                                   │ │
│ │             "Minimal or no adverse environmental or social impacts",                                                                         │ │
│ │             "Moderate impacts requiring mitigation",                                                                                         │ │
│ │             "High financial risk"                                                                                                            │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 1,                                                                                                                         │ │
│ │           explanation: "Category C projects have minimal or no adverse environmental or social impacts."                                     │ │
│ │         }                                                                                                                                    │ │
│ │       ]                                                                                                                                      │ │
│ │     },                                                                                                                                       │ │
│ │     {                                                                                                                                        │ │
│ │       id: "stakeholder-engagement",                                                                                                          │ │
│ │       title: "Stakeholder Engagement Requirements",                                                                                          │ │
│ │       description: "Master the requirements for meaningful stakeholder consultation",                                                        │ │
│ │       difficulty: "Intermediate",                                                                                                            │ │
│ │       estimatedTime: "25 minutes",                                                                                                           │ │
│ │       questions: [                                                                                                                           │ │
│ │         {                                                                                                                                    │ │
│ │           q: "For Category A and B projects, what document must be prepared to guide stakeholder engagement?",                               │ │
│ │           options: [                                                                                                                         │ │
│ │             "Environmental Impact Assessment",                                                                                               │ │
│ │             "Stakeholder Engagement Plan",                                                                                                   │ │
│ │             "Management System Audit",                                                                                                       │ │
│ │             "Financial Risk Assessment"                                                                                                      │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 1,                                                                                                                         │ │
│ │           explanation: "A Stakeholder Engagement Plan (SEP) must be prepared for Category A and B projects to ensure systematic and          │ │
│ │ meaningful consultation."                                                                                                                    │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "What principle must guide stakeholder engagement for projects affecting Indigenous Peoples?",                                  │ │
│ │           options: [                                                                                                                         │ │
│ │             "Informed Consultation",                                                                                                         │ │
│ │             "Free, Prior and Informed Consent (FPIC)",                                                                                       │ │
│ │             "Community Notification",                                                                                                        │ │
│ │             "Environmental Assessment"                                                                                                       │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 1,                                                                                                                         │ │
│ │           explanation: "Free, Prior and Informed Consent (FPIC) is required for projects affecting Indigenous Peoples' lands, territories,   │ │
│ │ and natural and cultural resources."                                                                                                         │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "Which groups should be included in stakeholder engagement?",                                                                   │ │
│ │           options: [                                                                                                                         │ │
│ │             "Only directly affected communities",                                                                                            │ │
│ │             "Only government authorities",                                                                                                   │ │
│ │             "Project-affected communities, local NGOs, government agencies, and other relevant stakeholders",                                │ │
│ │             "Only project sponsors"                                                                                                          │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 2,                                                                                                                         │ │
│ │           explanation: "Stakeholder engagement should include project-affected communities, local NGOs, government agencies, and other       │ │
│ │ relevant stakeholders to ensure comprehensive consultation."                                                                                 │ │
│ │         }                                                                                                                                    │ │
│ │       ]                                                                                                                                      │ │
│ │     },                                                                                                                                       │ │
│ │     {                                                                                                                                        │ │
│ │       id: "climate-risk",                                                                                                                    │ │
│ │       title: "Climate Change Risk Assessment",                                                                                               │ │
│ │       description: "Understand climate-related risk identification and management",                                                          │ │
│ │       difficulty: "Advanced",                                                                                                                │ │
│ │       estimatedTime: "30 minutes",                                                                                                           │ │
│ │       questions: [                                                                                                                           │ │
│ │         {                                                                                                                                    │ │
│ │           q: "According to EP4, climate change risk assessment is required for:",                                                            │ │
│ │           options: [                                                                                                                         │ │
│ │             "Only Category A projects",                                                                                                      │ │
│ │             "Category A and B projects in high climate risk locations",                                                                      │ │
│ │             "All projects above USD 50 million",                                                                                             │ │
│ │             "Only renewable energy projects"                                                                                                 │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 1,                                                                                                                         │ │
│ │           explanation: "Climate change risk assessment is required for Category A and B projects in high climate risk locations, or projects │ │
│ │  with potentially significant GHG emissions."                                                                                                │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "What GHG emission threshold triggers additional climate assessment requirements?",                                             │ │
│ │           options: [                                                                                                                         │ │
│ │             "25,000 tonnes CO2e annually",                                                                                                   │ │
│ │             "50,000 tonnes CO2e annually",                                                                                                   │ │
│ │             "100,000 tonnes CO2e annually",                                                                                                  │ │
│ │             "200,000 tonnes CO2e annually"                                                                                                   │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 2,                                                                                                                         │ │
│ │           explanation: "Projects with combined Scope 1 and Scope 2 GHG emissions above 100,000 tonnes CO2e annually require additional       │ │
│ │ climate assessment."                                                                                                                         │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "Climate resilience assessment should consider:",                                                                               │ │
│ │           options: [                                                                                                                         │ │
│ │             "Only current climate conditions",                                                                                               │ │
│ │             "Historical weather patterns only",                                                                                              │ │
│ │             "Current and future climate risks including physical and transition risks",                                                      │ │
│ │             "Only temperature changes"                                                                                                       │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 2,                                                                                                                         │ │
│ │           explanation: "Climate resilience assessment must consider both current and future climate risks, including physical risks (extreme │ │
│ │  weather) and transition risks (policy changes, technology shifts)."                                                                         │ │
│ │         }                                                                                                                                    │ │
│ │       ]                                                                                                                                      │ │
│ │     },                                                                                                                                       │ │
│ │     {                                                                                                                                        │ │
│ │       id: "grievance-mechanisms",                                                                                                            │ │
│ │       title: "Grievance Mechanisms and Access to Remedy",                                                                                    │ │
│ │       description: "Learn requirements for effective grievance processes",                                                                   │ │
│ │       difficulty: "Intermediate",                                                                                                            │ │
│ │       estimatedTime: "20 minutes",                                                                                                           │ │
│ │       questions: [                                                                                                                           │ │
│ │         {                                                                                                                                    │ │
│ │           q: "Project-level grievance mechanisms must be established for:",                                                                  │ │
│ │           options: [                                                                                                                         │ │
│ │             "Category A projects only",                                                                                                      │ │
│ │             "All Category A and B projects",                                                                                                 │ │
│ │             "Only projects with community impacts",                                                                                          │ │
│ │             "Projects above USD 100 million"                                                                                                 │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 1,                                                                                                                         │ │
│ │           explanation: "Project-level grievance mechanisms are required for all Category A and B projects to ensure affected communities     │ │
│ │ have access to remedy."                                                                                                                      │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "An effective grievance mechanism should be:",                                                                                  │ │
│ │           options: [                                                                                                                         │ │
│ │             "Legitimate, accessible, predictable, equitable, transparent, rights-compatible, and based on engagement and dialogue",          │ │
│ │             "Managed only by the project sponsor",                                                                                           │ │
│ │             "Available only during construction phase",                                                                                      │ │
│ │             "Limited to environmental complaints"                                                                                            │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 0,                                                                                                                         │ │
│ │           explanation: "Effective grievance mechanisms must meet the UN Guiding Principles criteria: legitimate, accessible, predictable,    │ │
│ │ equitable, transparent, rights-compatible, and based on engagement and dialogue."                                                            │ │
│ │         },                                                                                                                                   │ │
│ │         {                                                                                                                                    │ │
│ │           q: "Worker grievance mechanisms should:",                                                                                          │ │
│ │           options: [                                                                                                                         │ │
│ │             "Replace national labor laws",                                                                                                   │ │
│ │             "Be separate from project-level community grievance mechanisms",                                                                 │ │
│ │             "Only handle safety issues",                                                                                                     │ │
│ │             "Require legal representation"                                                                                                   │ │
│ │           ],                                                                                                                                 │ │
│ │           answer: 1,                                                                                                                         │ │
│ │           explanation: "Worker grievance mechanisms should be established separately from community mechanisms to address workplace-specific │ │
│ │  issues and power dynamics."                                                                                                                 │ │
│ │         }                                                                                                                                    │ │
│ │       ]                                                                                                                                      │ │
│ │     }                                                                                                                                        │ │
│ │   ],                                                                                                                                         │ │
│ │   i18n: {                                                                                                                                    │ │
│ │     en: {                                                                                                                                    │ │
│ │       chat: "Chat",                                                                                                                          │ │
│ │       learning: "Learning",                                                                                                                  │ │
│ │       send: "Send",                                                                                                                          │ │
│ │       thinking: "Thinking",                                                                                                                  │ │
│ │       error: "Error",                                                                                                                        │ │
│ │       success: "Success",                                                                                                                    │ │
│ │       warning: "Warning",                                                                                                                    │ │
│ │       info: "Info"                                                                                                                           │ │
│ │     },                                                                                                                                       │ │
│ │     es: {                                                                                                                                    │ │
│ │       chat: "Chat",                                                                                                                          │ │
│ │       learning: "Aprendizaje",                                                                                                               │ │
│ │       send: "Enviar",                                                                                                                        │ │
│ │       thinking: "Pensando"                                                                                                                   │ │
│ │     },                                                                                                                                       │ │
│ │     fr: {                                                                                                                                    │ │
│ │       chat: "Chat",                                                                                                                          │ │
│ │       learning: "Apprentissage",                                                                                                             │ │
│ │       send: "Envoyer",                                                                                                                       │ │
│ │       thinking: "Réflexion"                                                                                                                  │ │
│ │     },                                                                                                                                       │ │
│ │     zh: {                                                                                                                                    │ │
│ │       chat: "聊天",                                                                                                                          │ │
│ │       learning: "学习",                                                                                                                      │ │
│ │       send: "发送",                                                                                                                          │ │
│ │       thinking: "思考中"                                                                                                                     │ │
│ │     }                                                                                                                                        │ │
│ │   }                                                                                                                                          │ │
│ │ };                                                                                                                                           │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Application State ------------------------------------------                                                             │ │
│ │ let currentLang = "en";                                                                                                                      │ │
│ │ let currentView = "chat";                                                                                                                    │ │
│ │ let apiKeys = {                                                                                                                              │ │
│ │   claude: "",                                                                                                                                │ │
│ │   perplexity: "",                                                                                                                            │ │
│ │   project_id: ""                                                                                                                             │ │
│ │ };                                                                                                                                           │ │
│ │                                                                                                                                              │ │
│ │ // API instances                                                                                                                             │ │
│ │ let claudeEPRA = null;                                                                                                                       │ │
│ │ let perplexitySearch = null;                                                                                                                 │ │
│ │                                                                                                                                              │ │
│ │ // Chat messages storage                                                                                                                     │ │
│ │ let chatMessages = [];                                                                                                                       │ │
│ │                                                                                                                                              │ │
│ │ // Router instance                                                                                                                           │ │
│ │ let router = null;                                                                                                                           │ │
│ │                                                                                                                                              │ │
│ │ // Current learning module instance                                                                                                          │ │
│ │ let currentLearningModule = null;                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Enhanced Learning Progress Management ----------------------                                                             │ │
│ │ class LearningProgressManager {                                                                                                              │ │
│ │   constructor() {                                                                                                                            │ │
│ │     this.storageKey = 'epra_learning_progress';                                                                                              │ │
│ │     this.progress = this.loadProgress();                                                                                                     │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   loadProgress() {                                                                                                                           │ │
│ │     try {                                                                                                                                    │ │
│ │       const saved = localStorage.getItem(this.storageKey);                                                                                   │ │
│ │       return saved ? JSON.parse(saved) : {};                                                                                                 │ │
│ │     } catch (error) {                                                                                                                        │ │
│ │       console.error('Error loading progress:', error);                                                                                       │ │
│ │       return {};                                                                                                                             │ │
│ │     }                                                                                                                                        │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   saveProgress() {                                                                                                                           │ │
│ │     try {                                                                                                                                    │ │
│ │       localStorage.setItem(this.storageKey, JSON.stringify(this.progress));                                                                  │ │
│ │     } catch (error) {                                                                                                                        │ │
│ │       console.error('Error saving progress:', error);                                                                                        │ │
│ │     }                                                                                                                                        │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   getModuleProgress(moduleId) {                                                                                                              │ │
│ │     return this.progress[moduleId] || { score: 0, completed: false, attempts: 0 };                                                           │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   setModuleProgress(moduleId, score, totalQuestions) {                                                                                       │ │
│ │     const percentage = Math.round((score / totalQuestions) * 100);                                                                           │ │
│ │     this.progress[moduleId] = {                                                                                                              │ │
│ │       score: percentage,                                                                                                                     │ │
│ │       completed: percentage >= 70,                                                                                                           │ │
│ │       attempts: (this.progress[moduleId]?.attempts || 0) + 1,                                                                                │ │
│ │       lastAttempt: new Date().toISOString()                                                                                                  │ │
│ │     };                                                                                                                                       │ │
│ │     this.saveProgress();                                                                                                                     │ │
│ │     return this.progress[moduleId];                                                                                                          │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   getOverallProgress() {                                                                                                                     │ │
│ │     const modules = DATA.enhanced_learning_modules;                                                                                          │ │
│ │     const completed = modules.filter(module =>                                                                                               │ │
│ │       this.getModuleProgress(module.id).completed                                                                                            │ │
│ │     ).length;                                                                                                                                │ │
│ │     return Math.round((completed / modules.length) * 100);                                                                                   │ │
│ │   }                                                                                                                                          │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ const learningManager = new LearningProgressManager();                                                                                       │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Utility Functions ------------------------------------------                                                             │ │
│ │ function t(key) {                                                                                                                            │ │
│ │   return DATA.i18n[currentLang]?.[key] ?? DATA.i18n.en[key] ?? key;                                                                          │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ function updateTranslations() {                                                                                                              │ │
│ │   document.querySelectorAll("[data-i18n]").forEach((el) => {                                                                                 │ │
│ │     el.textContent = t(el.dataset.i18n);                                                                                                     │ │
│ │   });                                                                                                                                        │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ const escapeHTML = (str) => str.replace(/[&<>"']/g, (c) => ({                                                                                │ │
│ │   "&": "&amp;",                                                                                                                              │ │
│ │   "<": "&lt;",                                                                                                                               │ │
│ │   ">": "&gt;",                                                                                                                               │ │
│ │   '"': "&quot;",                                                                                                                             │ │
│ │   "'": "&#39;"                                                                                                                               │ │
│ │ }[c]));                                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │ function showToast(message, type = 'info') {                                                                                                 │ │
│ │   const toast = document.createElement('div');                                                                                               │ │
│ │   toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;                                                        │ │
│ │   toast.style.cssText = 'top: 20px; right: 20px; z-index: 1060; max-width: 350px;';                                                          │ │
│ │   toast.innerHTML = `                                                                                                                        │ │
│ │     ${message}                                                                                                                               │ │
│ │     <button type="button" class="btn-close" data-bs-dismiss="alert"></button>                                                                │ │
│ │   `;                                                                                                                                         │ │
│ │   document.body.appendChild(toast);                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   setTimeout(() => {                                                                                                                         │ │
│ │     if (toast.parentNode) {                                                                                                                  │ │
│ │       toast.parentNode.removeChild(toast);                                                                                                   │ │
│ │     }                                                                                                                                        │ │
│ │   }, 5000);                                                                                                                                  │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ function updateDemoBanner() {                                                                                                                │ │
│ │   const banner = document.getElementById('demoBanner');                                                                                      │ │
│ │   if (apiKeys.claude) {                                                                                                                      │ │
│ │     banner.style.display = 'none';                                                                                                           │ │
│ │   } else {                                                                                                                                   │ │
│ │     banner.style.display = 'block';                                                                                                          │ │
│ │   }                                                                                                                                          │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- API Integration --------------------------------------------                                                             │ │
│ │ async function initializeAPIs() {                                                                                                            │ │
│ │   try {                                                                                                                                      │ │
│ │     // Initialize APIs if classes are available                                                                                              │ │
│ │     if (window.ClaudeEPRA && apiKeys.claude) {                                                                                               │ │
│ │       claudeEPRA = new window.ClaudeEPRA(apiKeys.claude, {                                                                                   │ │
│ │         projectId: apiKeys.project_id || undefined,                                                                                          │ │
│ │         temperature: 0.1,                                                                                                                    │ │
│ │         maxTokens: 4096                                                                                                                      │ │
│ │       });                                                                                                                                    │ │
│ │       console.log('✓ ClaudeEPRA initialized');                                                                                               │ │
│ │     }                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     if (window.PerplexitySearch && apiKeys.perplexity) {                                                                                     │ │
│ │       perplexitySearch = new window.PerplexitySearch(apiKeys.perplexity, {                                                                   │ │
│ │         domains: ['equator-principles.com', 'ifc.org', 'worldbank.org', 'ebrd.com'],                                                         │ │
│ │         maxResults: 5                                                                                                                        │ │
│ │       });                                                                                                                                    │ │
│ │       console.log('✓ PerplexitySearch initialized');                                                                                         │ │
│ │     }                                                                                                                                        │ │
│ │   } catch (error) {                                                                                                                          │ │
│ │     console.error('API initialization error:', error);                                                                                       │ │
│ │     showToast('Error initializing API connections', 'warning');                                                                              │ │
│ │   }                                                                                                                                          │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Settings Modal --------------------------------------------                                                              │ │
│ │ function setupSettingsModal() {                                                                                                              │ │
│ │   const saveBtn = document.getElementById('saveSettings');                                                                                   │ │
│ │   const statusDiv = document.getElementById('configStatus');                                                                                 │ │
│ │                                                                                                                                              │ │
│ │   if (!saveBtn) return;                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │   saveBtn.addEventListener('click', async () => {                                                                                            │ │
│ │     const claudeKey = document.getElementById('claudeKey').value.trim();                                                                     │ │
│ │     const projectId = document.getElementById('projectId').value.trim();                                                                     │ │
│ │     const perplexityKey = document.getElementById('perplexityKey').value.trim();                                                             │ │
│ │                                                                                                                                              │ │
│ │     if (!claudeKey) {                                                                                                                        │ │
│ │       statusDiv.innerHTML = '<div class="alert alert-danger">Claude API key is required</div>';                                              │ │
│ │       return;                                                                                                                                │ │
│ │     }                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     // Show loading state                                                                                                                    │ │
│ │     saveBtn.disabled = true;                                                                                                                 │ │
│ │     saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';                                              │ │
│ │     statusDiv.innerHTML = '<div class="alert alert-info">Validating configuration...</div>';                                                 │ │
│ │                                                                                                                                              │ │
│ │     try {                                                                                                                                    │ │
│ │       // Update API keys                                                                                                                     │ │
│ │       apiKeys.claude = claudeKey;                                                                                                            │ │
│ │       apiKeys.project_id = projectId;                                                                                                        │ │
│ │       apiKeys.perplexity = perplexityKey;                                                                                                    │ │
│ │                                                                                                                                              │ │
│ │       // Initialize APIs                                                                                                                     │ │
│ │       await initializeAPIs();                                                                                                                │ │
│ │                                                                                                                                              │ │
│ │       statusDiv.innerHTML = '<div class="alert alert-success">Configuration saved successfully!</div>';                                      │ │
│ │       updateDemoBanner();                                                                                                                    │ │
│ │                                                                                                                                              │ │
│ │       // Close modal after delay                                                                                                             │ │
│ │       setTimeout(() => {                                                                                                                     │ │
│ │         const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));                                                 │ │
│ │         if (modal) {                                                                                                                         │ │
│ │           modal.hide();                                                                                                                      │ │
│ │         }                                                                                                                                    │ │
│ │         showToast('API configuration updated successfully', 'success');                                                                      │ │
│ │       }, 1500);                                                                                                                              │ │
│ │                                                                                                                                              │ │
│ │     } catch (error) {                                                                                                                        │ │
│ │       console.error('Configuration error:', error);                                                                                          │ │
│ │       statusDiv.innerHTML = `<div class="alert alert-danger">Configuration error: ${error.message}</div>`;                                   │ │
│ │     } finally {                                                                                                                              │ │
│ │       saveBtn.disabled = false;                                                                                                              │ │
│ │       saveBtn.innerHTML = '<i class="fa-solid fa-save me-2"></i>Save Configuration';                                                         │ │
│ │     }                                                                                                                                        │ │
│ │   });                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │   // Load existing values                                                                                                                    │ │
│ │   const claudeKeyInput = document.getElementById('claudeKey');                                                                               │ │
│ │   const projectIdInput = document.getElementById('projectId');                                                                               │ │
│ │   const perplexityKeyInput = document.getElementById('perplexityKey');                                                                       │ │
│ │                                                                                                                                              │ │
│ │   if (claudeKeyInput) claudeKeyInput.value = apiKeys.claude;                                                                                 │ │
│ │   if (projectIdInput) projectIdInput.value = apiKeys.project_id;                                                                             │ │
│ │   if (perplexityKeyInput) perplexityKeyInput.value = apiKeys.perplexity;                                                                     │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Citations Management ---------------------------------------                                                             │ │
│ │ function setupCitationHandlers() {                                                                                                           │ │
│ │   const citationCanvas = new bootstrap.Offcanvas(document.getElementById('citationCanvas'));                                                 │ │
│ │   const citationListDiv = document.getElementById('citationList');                                                                           │ │
│ │                                                                                                                                              │ │
│ │   window.openCitations = function(citations) {                                                                                               │ │
│ │     citationListDiv.innerHTML = '';                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │     citations.forEach((citation, index) => {                                                                                                 │ │
│ │       const citationDiv = document.createElement('div');                                                                                     │ │
│ │       citationDiv.className = 'mb-3 p-3 border rounded';                                                                                     │ │
│ │       citationDiv.innerHTML = `                                                                                                              │ │
│ │         <div class="d-flex justify-content-between align-items-start mb-2">                                                                  │ │
│ │           <span class="badge bg-primary">[${index + 1}]</span>                                                                               │ │
│ │           <small class="text-muted">${citation.type || 'Reference'}</small>                                                                  │ │
│ │         </div>                                                                                                                               │ │
│ │         <div class="mb-2">                                                                                                                   │ │
│ │           <strong>${escapeHTML(citation.title || 'Citation')}</strong>                                                                       │ │
│ │         </div>                                                                                                                               │ │
│ │         <div class="text-muted">                                                                                                             │ │
│ │           ${escapeHTML(citation.source || citation.text || 'No source available')}                                                           │ │
│ │         </div>                                                                                                                               │ │
│ │         ${citation.url ? `<div class="mt-2">                                                                                                 │ │
│ │           <a href="${citation.url}" target="_blank" class="btn btn-sm btn-outline-primary">                                                  │ │
│ │             <i class="fa-solid fa-external-link-alt me-1"></i>View Source                                                                    │ │
│ │           </a>                                                                                                                               │ │
│ │         </div>` : ''}                                                                                                                        │ │
│ │       `;                                                                                                                                     │ │
│ │       citationListDiv.appendChild(citationDiv);                                                                                              │ │
│ │     });                                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │     citationCanvas.show();                                                                                                                   │ │
│ │   };                                                                                                                                         │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Fixed Router System ----------------------------------------                                                             │ │
│ │ class Router {                                                                                                                               │ │
│ │   constructor() {                                                                                                                            │ │
│ │     this.routes = new Map();                                                                                                                 │ │
│ │     this.isLoading = false;                                                                                                                  │ │
│ │     this.currentHash = '';                                                                                                                   │ │
│ │                                                                                                                                              │ │
│ │     // Setup navigation immediately                                                                                                          │ │
│ │     this.setupNavigation();                                                                                                                  │ │
│ │                                                                                                                                              │ │
│ │     // Listen for hash changes                                                                                                               │ │
│ │     window.addEventListener('hashchange', () => {                                                                                            │ │
│ │       this.load();                                                                                                                           │ │
│ │     });                                                                                                                                      │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   setupNavigation() {                                                                                                                        │ │
│ │     console.log('Setting up navigation...');                                                                                                 │ │
│ │                                                                                                                                              │ │
│ │     // Add click handlers to navigation links                                                                                                │ │
│ │     document.querySelectorAll('.nav-link').forEach(link => {                                                                                 │ │
│ │       link.addEventListener('click', (e) => {                                                                                                │ │
│ │         e.preventDefault();                                                                                                                  │ │
│ │         e.stopPropagation();                                                                                                                 │ │
│ │                                                                                                                                              │ │
│ │         const hash = link.getAttribute('href');                                                                                              │ │
│ │         if (hash && hash.startsWith('#')) {                                                                                                  │ │
│ │           const route = hash.substring(1);                                                                                                   │ │
│ │           console.log('Navigation clicked:', route);                                                                                         │ │
│ │           this.navigate(route);                                                                                                              │ │
│ │         }                                                                                                                                    │ │
│ │       });                                                                                                                                    │ │
│ │     });                                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │     console.log('Navigation setup complete');                                                                                                │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   navigate(route) {                                                                                                                          │ │
│ │     console.log('Navigating to:', route);                                                                                                    │ │
│ │     window.location.hash = route;                                                                                                            │ │
│ │     this.load();                                                                                                                             │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   register(hash, handler) {                                                                                                                  │ │
│ │     this.routes.set(hash, handler);                                                                                                          │ │
│ │     console.log('Route registered:', hash);                                                                                                  │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   async load() {                                                                                                                             │ │
│ │     if (this.isLoading) {                                                                                                                    │ │
│ │       console.log('Already loading, skipping...');                                                                                           │ │
│ │       return;                                                                                                                                │ │
│ │     }                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     this.isLoading = true;                                                                                                                   │ │
│ │                                                                                                                                              │ │
│ │     const hash = window.location.hash.slice(1) || 'chat';                                                                                    │ │
│ │     console.log('Loading route:', hash);                                                                                                     │ │
│ │                                                                                                                                              │ │
│ │     // Don't reload if already on this route                                                                                                 │ │
│ │     if (this.currentHash === hash) {                                                                                                         │ │
│ │       this.isLoading = false;                                                                                                                │ │
│ │       return;                                                                                                                                │ │
│ │     }                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     this.currentHash = hash;                                                                                                                 │ │
│ │     currentView = hash;                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │     // Update navigation                                                                                                                     │ │
│ │     document.querySelectorAll('.nav-link').forEach((link) => {                                                                               │ │
│ │       const href = link.getAttribute('href');                                                                                                │ │
│ │       if (href === `#${hash}`) {                                                                                                             │ │
│ │         link.classList.add('active');                                                                                                        │ │
│ │       } else {                                                                                                                               │ │
│ │         link.classList.remove('active');                                                                                                     │ │
│ │       }                                                                                                                                      │ │
│ │     });                                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │     const handler = this.routes.get(hash);                                                                                                   │ │
│ │     if (handler) {                                                                                                                           │ │
│ │       try {                                                                                                                                  │ │
│ │         const container = document.getElementById('tabContent');                                                                             │ │
│ │         if (container) {                                                                                                                     │ │
│ │           container.innerHTML = '<div class="d-flex justify-content-center p-4"><div class="spinner-lg"></div></div>';                       │ │
│ │                                                                                                                                              │ │
│ │           console.log('Calling handler for:', hash);                                                                                         │ │
│ │           const view = await handler();                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │           container.innerHTML = '';                                                                                                          │ │
│ │           container.appendChild(view);                                                                                                       │ │
│ │           container.focus();                                                                                                                 │ │
│ │                                                                                                                                              │ │
│ │           console.log('Route loaded successfully:', hash);                                                                                   │ │
│ │         }                                                                                                                                    │ │
│ │       } catch (error) {                                                                                                                      │ │
│ │         console.error('View loading error:', error);                                                                                         │ │
│ │         const container = document.getElementById('tabContent');                                                                             │ │
│ │         if (container) {                                                                                                                     │ │
│ │           container.innerHTML = `<div class="alert alert-danger">Error loading view: ${error.message}</div>`;                                │ │
│ │         }                                                                                                                                    │ │
│ │       }                                                                                                                                      │ │
│ │     } else {                                                                                                                                 │ │
│ │       console.warn('No handler found for route:', hash);                                                                                     │ │
│ │     }                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     this.isLoading = false;                                                                                                                  │ │
│ │   }                                                                                                                                          │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Demo Response Generation -----------------------------------                                                             │ │
│ │ function generateDemoResponse(query) {                                                                                                       │ │
│ │   const lowerQuery = query.toLowerCase();                                                                                                    │ │
│ │                                                                                                                                              │ │
│ │   if (lowerQuery.includes('principle') || lowerQuery.includes('ep4')) {                                                                      │ │
│ │     return `The Equator Principles (EP4) consists of **10 principles** that provide a framework for financial institutions to manage         │ │
│ │ environmental and social risks in project finance transactions.                                                                              │ │
│ │                                                                                                                                              │ │
│ │ **Key principles include:**                                                                                                                  │ │
│ │ - **Principle 1**: Review and Categorisation                                                                                                 │ │
│ │ - **Principle 2**: Environmental and Social Assessment                                                                                       │ │
│ │ - **Principle 3**: Applicable Environmental and Social Standards                                                                             │ │
│ │ - **Principle 4**: Environmental and Social Management System                                                                                │ │
│ │ - **Principle 5**: Stakeholder Engagement                                                                                                    │ │
│ │                                                                                                                                              │ │
│ │ Each principle addresses specific aspects of risk management and due diligence.`;                                                            │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   if (lowerQuery.includes('category') || lowerQuery.includes('classification')) {                                                            │ │
│ │     return `Projects are **categorized** based on their potential environmental and social impacts:                                          │ │
│ │                                                                                                                                              │ │
│ │ **Category A**: Projects with potential significant adverse environmental and social risks                                                   │ │
│ │ **Category B**: Projects with potential limited adverse environmental and social risks                                                       │ │
│ │ **Category C**: Projects with minimal or no adverse environmental and social risks                                                           │ │
│ │                                                                                                                                              │ │
│ │ The categorization determines the level of assessment and management required.`;                                                             │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   if (lowerQuery.includes('stakeholder') || lowerQuery.includes('engagement')) {                                                             │ │
│ │     return `**Stakeholder engagement** is a key requirement under Principle 5, requiring:                                                    │ │
│ │                                                                                                                                              │ │
│ │ - **Meaningful consultation** with affected communities                                                                                      │ │
│ │ - **Ongoing dialogue** throughout the project lifecycle                                                                                      │ │
│ │ - **Grievance mechanisms** for addressing concerns                                                                                           │ │
│ │ - **Free, prior, and informed consent** where applicable                                                                                     │ │
│ │                                                                                                                                              │ │
│ │ Effective stakeholder engagement helps identify risks early and builds project support.`;                                                    │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   if (lowerQuery.includes('assessment') || lowerQuery.includes('esia')) {                                                                    │ │
│ │     return `**Environmental and Social Impact Assessment (ESIA)** is required for Category A and B projects:                                 │ │
│ │                                                                                                                                              │ │
│ │ **Key components:**                                                                                                                          │ │
│ │ - Environmental impact analysis                                                                                                              │ │
│ │ - Social impact analysis                                                                                                                     │ │
│ │ - Stakeholder consultation                                                                                                                   │ │
│ │ - Mitigation measures                                                                                                                        │ │
│ │ - Monitoring plans                                                                                                                           │ │
│ │                                                                                                                                              │ │
│ │ The ESIA must be conducted by qualified independent experts and follow applicable standards.`;                                               │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   return `The **Equator Principles** provide a comprehensive risk management framework for project finance transactions. They help financial │ │
│ │  institutions:                                                                                                                               │ │
│ │                                                                                                                                              │ │
│ │ - **Identify** environmental and social risks                                                                                                │ │
│ │ - **Assess** project impacts systematically                                                                                                  │ │
│ │ - **Manage** risks through appropriate standards                                                                                             │ │
│ │ - **Monitor** ongoing compliance                                                                                                             │ │
│ │                                                                                                                                              │ │
│ │ For specific guidance on your question, please refer to the EP4 documentation or consult with EP specialists.`;                              │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ function getDemoCitations() {                                                                                                                │ │
│ │   return [                                                                                                                                   │ │
│ │     {                                                                                                                                        │ │
│ │       type: 'core',                                                                                                                          │ │
│ │       title: 'The Equator Principles EP4',                                                                                                   │ │
│ │       source: 'Equator Principles Association (2020)',                                                                                       │ │
│ │       url: 'https://equator-principles.com/ep4/'                                                                                             │ │
│ │     },                                                                                                                                       │ │
│ │     {                                                                                                                                        │ │
│ │       type: 'standard',                                                                                                                      │ │
│ │       title: 'IFC Performance Standards',                                                                                                    │ │
│ │       source: 'International Finance Corporation (2012)',                                                                                    │ │
│ │       url: 'https://www.ifc.org/performancestandards'                                                                                        │ │
│ │     },                                                                                                                                       │ │
│ │     {                                                                                                                                        │ │
│ │       type: 'guidance',                                                                                                                      │ │
│ │       title: 'EP4 Implementation Guidance',                                                                                                  │ │
│ │       source: 'Equator Principles Association (2020)',                                                                                       │ │
│ │       url: 'https://equator-principles.com/guidance/'                                                                                        │ │
│ │     }                                                                                                                                        │ │
│ │   ];                                                                                                                                         │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Chat View Implementation -----------------------------------                                                             │ │
│ │ async function renderChat() {                                                                                                                │ │
│ │   console.log('Rendering chat view...');                                                                                                     │ │
│ │                                                                                                                                              │ │
│ │   const wrapper = document.createElement('div');                                                                                             │ │
│ │   wrapper.className = 'chat-container';                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │   // Messages container                                                                                                                      │ │
│ │   const messagesDiv = document.createElement('div');                                                                                         │ │
│ │   messagesDiv.className = 'chat-messages d-flex flex-column gap-2';                                                                          │ │
│ │   messagesDiv.id = 'chatMessages';                                                                                                           │ │
│ │   wrapper.appendChild(messagesDiv);                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   // Input container                                                                                                                         │ │
│ │   const inputContainer = document.createElement('div');                                                                                      │ │
│ │   inputContainer.className = 'chat-input-container d-flex gap-2';                                                                            │ │
│ │                                                                                                                                              │ │
│ │   const textarea = document.createElement('textarea');                                                                                       │ │
│ │   textarea.className = 'chat-input form-control';                                                                                            │ │
│ │   textarea.rows = 2;                                                                                                                         │ │
│ │   textarea.placeholder = `Ask about Equator Principles... (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to send)`;           │ │
│ │                                                                                                                                              │ │
│ │   const sendBtn = document.createElement('button');                                                                                          │ │
│ │   sendBtn.className = 'btn btn-primary';                                                                                                     │ │
│ │   sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';                                                                             │ │
│ │   sendBtn.disabled = true;                                                                                                                   │ │
│ │                                                                                                                                              │ │
│ │   inputContainer.appendChild(textarea);                                                                                                      │ │
│ │   inputContainer.appendChild(sendBtn);                                                                                                       │ │
│ │   wrapper.appendChild(inputContainer);                                                                                                       │ │
│ │                                                                                                                                              │ │
│ │   // Welcome message                                                                                                                         │ │
│ │   const welcomeMsg = document.createElement('div');                                                                                          │ │
│ │   welcomeMsg.className = 'chat-msg ai fade-in';                                                                                              │ │
│ │   welcomeMsg.innerHTML = `                                                                                                                   │ │
│ │     <div class="mb-2">                                                                                                                       │ │
│ │       <strong><i class="fa-solid fa-robot me-2"></i>EPRA Learning Assistant</strong>                                                         │ │
│ │     </div>                                                                                                                                   │ │
│ │     <div>                                                                                                                                    │ │
│ │       Hello! I'm your Equator Principles learning assistant. I can help you with:                                                            │ │
│ │       <ul class="mb-2 mt-2">                                                                                                                 │ │
│ │         <li>EP4 requirements and guidelines</li>                                                                                             │ │
│ │         <li>Risk categorization (A, B, C)</li>                                                                                               │ │
│ │         <li>Environmental and social standards</li>                                                                                          │ │
│ │         <li>Stakeholder engagement processes</li>                                                                                            │ │
│ │         <li>Compliance and monitoring frameworks</li>                                                                                        │ │
│ │       </ul>                                                                                                                                  │ │
│ │       ${apiKeys.claude ? 'I have access to real-time information and can provide detailed, cited responses.' : '<em>Configure your Claude    │ │
│ │ API key in Settings for enhanced responses.</em>'}                                                                                           │ │
│ │     </div>                                                                                                                                   │ │
│ │   `;                                                                                                                                         │ │
│ │   messagesDiv.appendChild(welcomeMsg);                                                                                                       │ │
│ │                                                                                                                                              │ │
│ │   // Restore chat history                                                                                                                    │ │
│ │   chatMessages.forEach(msg => {                                                                                                              │ │
│ │     const msgDiv = document.createElement('div');                                                                                            │ │
│ │     msgDiv.className = `chat-msg ${msg.type}`;                                                                                               │ │
│ │     msgDiv.innerHTML = msg.content;                                                                                                          │ │
│ │     messagesDiv.appendChild(msgDiv);                                                                                                         │ │
│ │   });                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │   let isSending = false;                                                                                                                     │ │
│ │                                                                                                                                              │ │
│ │   // Input validation                                                                                                                        │ │
│ │   textarea.addEventListener('input', () => {                                                                                                 │ │
│ │     const hasText = textarea.value.trim().length > 0;                                                                                        │ │
│ │     sendBtn.disabled = !hasText;                                                                                                             │ │
│ │   });                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │   const sendMessage = async () => {                                                                                                          │ │
│ │     if (isSending) return;                                                                                                                   │ │
│ │     const text = textarea.value.trim();                                                                                                      │ │
│ │     if (!text) return;                                                                                                                       │ │
│ │                                                                                                                                              │ │
│ │     isSending = true;                                                                                                                        │ │
│ │     textarea.value = '';                                                                                                                     │ │
│ │     sendBtn.disabled = true;                                                                                                                 │ │
│ │                                                                                                                                              │ │
│ │     // User message                                                                                                                          │ │
│ │     const userMsg = document.createElement('div');                                                                                           │ │
│ │     userMsg.className = 'chat-msg user slide-up';                                                                                            │ │
│ │     userMsg.textContent = text;                                                                                                              │ │
│ │     messagesDiv.appendChild(userMsg);                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     // Store message                                                                                                                         │ │
│ │     chatMessages.push({                                                                                                                      │ │
│ │       type: 'user',                                                                                                                          │ │
│ │       content: text                                                                                                                          │ │
│ │     });                                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │     // AI response placeholder                                                                                                               │ │
│ │     const aiMsg = document.createElement('div');                                                                                             │ │
│ │     aiMsg.className = 'chat-msg ai slide-up';                                                                                                │ │
│ │     aiMsg.innerHTML = `                                                                                                                      │ │
│ │       <div class="d-flex align-items-center gap-2">                                                                                          │ │
│ │         <div class="spinner"></div>                                                                                                          │ │
│ │         <span class="thinking-indicator">${t('thinking')}</span>                                                                             │ │
│ │       </div>                                                                                                                                 │ │
│ │     `;                                                                                                                                       │ │
│ │     messagesDiv.appendChild(aiMsg);                                                                                                          │ │
│ │     messagesDiv.scrollTop = messagesDiv.scrollHeight;                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     try {                                                                                                                                    │ │
│ │       let response;                                                                                                                          │ │
│ │       let citations = [];                                                                                                                    │ │
│ │                                                                                                                                              │ │
│ │       if (claudeEPRA) {                                                                                                                      │ │
│ │         // Real Claude API call                                                                                                              │ │
│ │         const result = await claudeEPRA.generateEPResponse(text, !!perplexitySearch);                                                        │ │
│ │         response = result.content;                                                                                                           │ │
│ │         citations = result.citations || [];                                                                                                  │ │
│ │       } else {                                                                                                                               │ │
│ │         // Demo mode response                                                                                                                │ │
│ │         await new Promise(resolve => setTimeout(resolve, 1500));                                                                             │ │
│ │         response = generateDemoResponse(text);                                                                                               │ │
│ │         citations = getDemoCitations();                                                                                                      │ │
│ │       }                                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │       // Process response with citations                                                                                                     │ │
│ │       let processedResponse = response;                                                                                                      │ │
│ │       if (citations.length > 0) {                                                                                                            │ │
│ │         citations.forEach((citation, index) => {                                                                                             │ │
│ │           processedResponse += ` <sup class="citation-sup citation-${citation.type || 'core'}"                                               │ │
│ │ onclick="openCitations([${JSON.stringify(citations).replace(/"/g, '&quot;')}])" style="cursor: pointer;">[${index + 1}]</sup>`;              │ │
│ │         });                                                                                                                                  │ │
│ │       }                                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │       // Render response                                                                                                                     │ │
│ │       const markdownContent = document.createElement('div');                                                                                 │ │
│ │       markdownContent.className = 'markdown-content';                                                                                        │ │
│ │       markdownContent.innerHTML = DOMPurify.sanitize(marked.parse(processedResponse));                                                       │ │
│ │                                                                                                                                              │ │
│ │       aiMsg.innerHTML = '';                                                                                                                  │ │
│ │       aiMsg.appendChild(markdownContent);                                                                                                    │ │
│ │                                                                                                                                              │ │
│ │       // Store message                                                                                                                       │ │
│ │       chatMessages.push({                                                                                                                    │ │
│ │         type: 'ai',                                                                                                                          │ │
│ │         content: aiMsg.innerHTML                                                                                                             │ │
│ │       });                                                                                                                                    │ │
│ │                                                                                                                                              │ │
│ │     } catch (error) {                                                                                                                        │ │
│ │       console.error('Chat error:', error);                                                                                                   │ │
│ │       const errorMsg = `                                                                                                                     │ │
│ │         <div class="alert alert-danger mb-0">                                                                                                │ │
│ │           <i class="fa-solid fa-exclamation-triangle me-2"></i>                                                                              │ │
│ │           Error: ${escapeHTML(error.message)}                                                                                                │ │
│ │           ${!apiKeys.claude ? '<br><small>Try configuring your Claude API key in Settings.</small>' : ''}                                    │ │
│ │         </div>                                                                                                                               │ │
│ │       `;                                                                                                                                     │ │
│ │       aiMsg.innerHTML = errorMsg;                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │       chatMessages.push({                                                                                                                    │ │
│ │         type: 'ai',                                                                                                                          │ │
│ │         content: errorMsg                                                                                                                    │ │
│ │       });                                                                                                                                    │ │
│ │     } finally {                                                                                                                              │ │
│ │       isSending = false;                                                                                                                     │ │
│ │       messagesDiv.scrollTop = messagesDiv.scrollHeight;                                                                                      │ │
│ │     }                                                                                                                                        │ │
│ │   };                                                                                                                                         │ │
│ │                                                                                                                                              │ │
│ │   // Event handlers                                                                                                                          │ │
│ │   sendBtn.addEventListener('click', sendMessage);                                                                                            │ │
│ │   textarea.addEventListener('keydown', (e) => {                                                                                              │ │
│ │     if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {                                                                                     │ │
│ │       e.preventDefault();                                                                                                                    │ │
│ │       sendMessage();                                                                                                                         │ │
│ │     }                                                                                                                                        │ │
│ │   });                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │   console.log('Chat view rendered');                                                                                                         │ │
│ │   return wrapper;                                                                                                                            │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Enhanced Learning View Implementation ----------------------                                                             │ │
│ │ async function renderLearning() {                                                                                                            │ │
│ │   console.log('Rendering learning view...');                                                                                                 │ │
│ │                                                                                                                                              │ │
│ │   const wrapper = document.createElement('div');                                                                                             │ │
│ │   wrapper.className = 'row g-4';                                                                                                             │ │
│ │                                                                                                                                              │ │
│ │   // Module list (left column)                                                                                                               │ │
│ │   const moduleCol = document.createElement('div');                                                                                           │ │
│ │   moduleCol.className = 'col-md-4';                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   const moduleListCard = document.createElement('div');                                                                                      │ │
│ │   moduleListCard.className = 'card';                                                                                                         │ │
│ │   moduleListCard.innerHTML = '<div class="card-header"><h5><i class="fa-solid fa-graduation-cap me-2"></i>Learning Modules</h5></div>';      │ │
│ │                                                                                                                                              │ │
│ │   const moduleList = document.createElement('div');                                                                                          │ │
│ │   moduleList.className = 'list-group list-group-flush';                                                                                      │ │
│ │                                                                                                                                              │ │
│ │   DATA.enhanced_learning_modules.forEach((module) => {                                                                                       │ │
│ │     const moduleItem = document.createElement('button');                                                                                     │ │
│ │     moduleItem.className = 'list-group-item list-group-item-action';                                                                         │ │
│ │                                                                                                                                              │ │
│ │     const progress = learningManager.getModuleProgress(module.id);                                                                           │ │
│ │     const isCompleted = progress.completed;                                                                                                  │ │
│ │                                                                                                                                              │ │
│ │     moduleItem.innerHTML = `                                                                                                                 │ │
│ │       <div class="d-flex justify-content-between align-items-start">                                                                         │ │
│ │         <div>                                                                                                                                │ │
│ │           <h6 class="mb-1">${module.title}</h6>                                                                                              │ │
│ │           <p class="mb-1 text-muted small">${module.description}</p>                                                                         │ │
│ │           <small class="text-muted">                                                                                                         │ │
│ │             <i class="fa-solid fa-clock"></i> ${module.estimatedTime}                                                                        │ │
│ │             <span class="difficulty-badge difficulty-${module.difficulty.toLowerCase()}">${module.difficulty}</span>                         │ │
│ │           </small>                                                                                                                           │ │
│ │         </div>                                                                                                                               │ │
│ │         <div class="text-end">                                                                                                               │ │
│ │           ${isCompleted ? '<i class="fa-solid fa-check-circle text-success"></i>' : ''}                                                      │ │
│ │           <div class="small text-muted">${progress.score}%</div>                                                                             │ │
│ │         </div>                                                                                                                               │ │
│ │       </div>                                                                                                                                 │ │
│ │       <div class="progress mt-2" style="height: 4px;">                                                                                       │ │
│ │         <div class="progress-bar" style="width: ${progress.score}%"></div>                                                                   │ │
│ │       </div>                                                                                                                                 │ │
│ │     `;                                                                                                                                       │ │
│ │                                                                                                                                              │ │
│ │     moduleItem.addEventListener('click', () => {                                                                                             │ │
│ │       currentLearningModule = module;                                                                                                        │ │
│ │       loadModule(module);                                                                                                                    │ │
│ │     });                                                                                                                                      │ │
│ │     moduleList.appendChild(moduleItem);                                                                                                      │ │
│ │   });                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │   moduleListCard.appendChild(moduleList);                                                                                                    │ │
│ │   moduleCol.appendChild(moduleListCard);                                                                                                     │ │
│ │   wrapper.appendChild(moduleCol);                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │   // Content area (right column)                                                                                                             │ │
│ │   const contentCol = document.createElement('div');                                                                                          │ │
│ │   contentCol.className = 'col-md-8';                                                                                                         │ │
│ │   contentCol.id = 'moduleContent';                                                                                                           │ │
│ │                                                                                                                                              │ │
│ │   const placeholderCard = document.createElement('div');                                                                                     │ │
│ │   placeholderCard.className = 'card';                                                                                                        │ │
│ │   placeholderCard.innerHTML = `                                                                                                              │ │
│ │     <div class="card-body text-center">                                                                                                      │ │
│ │       <i class="fa-solid fa-graduation-cap fa-3x text-muted mb-3"></i>                                                                       │ │
│ │       <h5>Select a Learning Module</h5>                                                                                                      │ │
│ │       <p class="text-muted">Choose a module from the left to begin your EP4 learning journey.</p>                                            │ │
│ │       <div class="mt-3">                                                                                                                     │ │
│ │         <div class="text-muted">Overall Progress: <strong>${learningManager.getOverallProgress()}%</strong></div>                            │ │
│ │         <div class="progress mt-2" style="height: 8px;">                                                                                     │ │
│ │           <div class="progress-bar" style="width: ${learningManager.getOverallProgress()}%"></div>                                           │ │
│ │         </div>                                                                                                                               │ │
│ │       </div>                                                                                                                                 │ │
│ │     </div>                                                                                                                                   │ │
│ │   `;                                                                                                                                         │ │
│ │                                                                                                                                              │ │
│ │   contentCol.appendChild(placeholderCard);                                                                                                   │ │
│ │   wrapper.appendChild(contentCol);                                                                                                           │ │
│ │                                                                                                                                              │ │
│ │   function loadModule(module) {                                                                                                              │ │
│ │     console.log('Loading module:', module.id);                                                                                               │ │
│ │                                                                                                                                              │ │
│ │     const contentArea = document.getElementById('moduleContent');                                                                            │ │
│ │     let currentQuestionIndex = 0;                                                                                                            │ │
│ │     let score = 0;                                                                                                                           │ │
│ │                                                                                                                                              │ │
│ │     function renderQuestion() {                                                                                                              │ │
│ │       if (currentQuestionIndex >= module.questions.length) {                                                                                 │ │
│ │         // Module complete                                                                                                                   │ │
│ │         const finalScore = Math.round((score / module.questions.length) * 100);                                                              │ │
│ │         const progress = learningManager.setModuleProgress(module.id, score, module.questions.length);                                       │ │
│ │                                                                                                                                              │ │
│ │         contentArea.innerHTML = `                                                                                                            │ │
│ │           <div class="card">                                                                                                                 │ │
│ │             <div class="card-body text-center module-complete-animation">                                                                    │ │
│ │               <i class="fa-solid fa-trophy fa-3x trophy-icon mb-3"></i>                                                                      │ │
│ │               <h4>Module Complete!</h4>                                                                                                      │ │
│ │               <div class="completion-score">${finalScore}%</div>                                                                             │ │
│ │               <p class="mb-3">You scored ${score} out of ${module.questions.length} questions correctly.</p>                                 │ │
│ │               ${finalScore >= 70 ?                                                                                                           │ │
│ │                 '<div class="alert alert-success">🎉 Excellent work! You have mastered this topic.</div>' :                                  │ │
│ │                 '<div class="alert alert-info">Good effort! Consider reviewing the material and retaking the module.</div>'                  │ │
│ │               }                                                                                                                              │ │
│ │               <div class="d-flex justify-content-center gap-2 mb-3">                                                                         │ │
│ │                 <button class="btn btn-primary" onclick="window.retakeModule('${module.id}')">                                               │ │
│ │                   <i class="fa-solid fa-redo me-2"></i>Retake Module                                                                         │ │
│ │                 </button>                                                                                                                    │ │
│ │                 <button class="btn btn-secondary" onclick="window.backToModules()">                                                          │ │
│ │                   <i class="fa-solid fa-arrow-left me-2"></i>Back to Modules                                                                 │ │
│ │                 </button>                                                                                                                    │ │
│ │               </div>                                                                                                                         │ │
│ │               <div class="mt-3">                                                                                                             │ │
│ │                 <small class="text-muted">Attempt #${progress.attempts} • ${new Date(progress.lastAttempt).toLocaleDateString()}</small>     │ │
│ │               </div>                                                                                                                         │ │
│ │             </div>                                                                                                                           │ │
│ │           </div>                                                                                                                             │ │
│ │         `;                                                                                                                                   │ │
│ │                                                                                                                                              │ │
│ │         showToast(`Module completed with ${finalScore}% score!`, finalScore >= 70 ? 'success' : 'info');                                     │ │
│ │         return;                                                                                                                              │ │
│ │       }                                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │       const question = module.questions[currentQuestionIndex];                                                                               │ │
│ │       const progress = Math.round(((currentQuestionIndex + 1) / module.questions.length) * 100);                                             │ │
│ │                                                                                                                                              │ │
│ │       contentArea.innerHTML = `                                                                                                              │ │
│ │         <div class="card question-card">                                                                                                     │ │
│ │           <div class="card-header">                                                                                                          │ │
│ │             <div class="d-flex justify-content-between align-items-center">                                                                  │ │
│ │               <h5 class="mb-0">${module.title}</h5>                                                                                          │ │
│ │               <small class="text-muted">Question ${currentQuestionIndex + 1} of ${module.questions.length}</small>                           │ │
│ │             </div>                                                                                                                           │ │
│ │             <div class="progress mt-2" style="height: 6px;">                                                                                 │ │
│ │               <div class="progress-bar" style="width: ${progress}%"></div>                                                                   │ │
│ │             </div>                                                                                                                           │ │
│ │           </div>                                                                                                                             │ │
│ │           <div class="card-body">                                                                                                            │ │
│ │             <h6 class="mb-3">${question.q}</h6>                                                                                              │ │
│ │             <div class="d-grid gap-2" id="questionOptions"></div>                                                                            │ │
│ │           </div>                                                                                                                             │ │
│ │         </div>                                                                                                                               │ │
│ │       `;                                                                                                                                     │ │
│ │                                                                                                                                              │ │
│ │       const optionsContainer = document.getElementById('questionOptions');                                                                   │ │
│ │                                                                                                                                              │ │
│ │       question.options.forEach((option, index) => {                                                                                          │ │
│ │         const button = document.createElement('button');                                                                                     │ │
│ │         button.className = 'answer-option';                                                                                                  │ │
│ │         button.textContent = option;                                                                                                         │ │
│ │                                                                                                                                              │ │
│ │         button.addEventListener('click', () => {                                                                                             │ │
│ │           const isCorrect = index === question.answer;                                                                                       │ │
│ │                                                                                                                                              │ │
│ │           // Disable all buttons                                                                                                             │ │
│ │           [...optionsContainer.children].forEach(btn => {                                                                                    │ │
│ │             btn.disabled = true;                                                                                                             │ │
│ │           });                                                                                                                                │ │
│ │                                                                                                                                              │ │
│ │           if (isCorrect) {                                                                                                                   │ │
│ │             button.classList.add('correct', 'answer-correct-animation');                                                                     │ │
│ │             score++;                                                                                                                         │ │
│ │           } else {                                                                                                                           │ │
│ │             button.classList.add('incorrect', 'answer-incorrect-animation');                                                                 │ │
│ │             // Highlight correct answer                                                                                                      │ │
│ │             optionsContainer.children[question.answer].classList.add('correct');                                                             │ │
│ │           }                                                                                                                                  │ │
│ │                                                                                                                                              │ │
│ │           // Show explanation                                                                                                                │ │
│ │           const explanation = document.createElement('div');                                                                                 │ │
│ │           explanation.className = `alert ${isCorrect ? 'alert-success' : 'alert-info'} mt-3`;                                                │ │
│ │           explanation.innerHTML = `                                                                                                          │ │
│ │             <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong><br>                                                                 │ │
│ │             ${question.explanation}                                                                                                          │ │
│ │           `;                                                                                                                                 │ │
│ │                                                                                                                                              │ │
│ │           contentArea.querySelector('.card-body').appendChild(explanation);                                                                  │ │
│ │                                                                                                                                              │ │
│ │           // Next button                                                                                                                     │ │
│ │           const nextBtn = document.createElement('button');                                                                                  │ │
│ │           nextBtn.className = 'btn btn-primary mt-3';                                                                                        │ │
│ │           nextBtn.textContent = currentQuestionIndex < module.questions.length - 1 ? "Next Question" : "Complete Module";                    │ │
│ │           nextBtn.addEventListener('click', () => {                                                                                          │ │
│ │             currentQuestionIndex++;                                                                                                          │ │
│ │             renderQuestion();                                                                                                                │ │
│ │           });                                                                                                                                │ │
│ │                                                                                                                                              │ │
│ │           contentArea.querySelector('.card-body').appendChild(nextBtn);                                                                      │ │
│ │         });                                                                                                                                  │ │
│ │                                                                                                                                              │ │
│ │         optionsContainer.appendChild(button);                                                                                                │ │
│ │       });                                                                                                                                    │ │
│ │     }                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     renderQuestion();                                                                                                                        │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   // Global functions for module navigation                                                                                                  │ │
│ │   window.retakeModule = (moduleId) => {                                                                                                      │ │
│ │     const module = DATA.enhanced_learning_modules.find(m => m.id === moduleId);                                                              │ │
│ │     if (module) {                                                                                                                            │ │
│ │       currentLearningModule = module;                                                                                                        │ │
│ │       loadModule(module);                                                                                                                    │ │
│ │     }                                                                                                                                        │ │
│ │   };                                                                                                                                         │ │
│ │                                                                                                                                              │ │
│ │   window.backToModules = () => {                                                                                                             │ │
│ │     // Navigate back to learning view to refresh progress                                                                                    │ │
│ │     if (router) {                                                                                                                            │ │
│ │       router.navigate('learning');                                                                                                           │ │
│ │     }                                                                                                                                        │ │
│ │   };                                                                                                                                         │ │
│ │                                                                                                                                              │ │
│ │   console.log('Learning view rendered');                                                                                                     │ │
│ │   return wrapper;                                                                                                                            │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Theme Management -------------------------------------------                                                             │ │
│ │ function setupThemeToggle() {                                                                                                                │ │
│ │   const darkToggle = document.getElementById('darkToggle');                                                                                  │ │
│ │                                                                                                                                              │ │
│ │   function setTheme(theme) {                                                                                                                 │ │
│ │     document.documentElement.setAttribute('data-color-scheme', theme);                                                                       │ │
│ │     darkToggle.innerHTML = theme === 'dark'                                                                                                  │ │
│ │       ? '<i class="fa-solid fa-sun"></i>'                                                                                                    │ │
│ │       : '<i class="fa-solid fa-moon"></i>';                                                                                                  │ │
│ │   }                                                                                                                                          │ │
│ │                                                                                                                                              │ │
│ │   darkToggle.addEventListener('click', () => {                                                                                               │ │
│ │     const current = document.documentElement.getAttribute('data-color-scheme');                                                              │ │
│ │     const newTheme = current === 'dark' ? 'light' : 'dark';                                                                                  │ │
│ │     setTheme(newTheme);                                                                                                                      │ │
│ │   });                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │   // Set initial theme                                                                                                                       │ │
│ │   setTheme('light');                                                                                                                         │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Language Management ----------------------------------------                                                             │ │
│ │ function setupLanguageSelector() {                                                                                                           │ │
│ │   const langSelect = document.getElementById('langSelect');                                                                                  │ │
│ │                                                                                                                                              │ │
│ │   langSelect.addEventListener('change', () => {                                                                                              │ │
│ │     currentLang = langSelect.value;                                                                                                          │ │
│ │     updateTranslations();                                                                                                                    │ │
│ │     showToast(`Language changed to ${langSelect.options[langSelect.selectedIndex].text}`, 'info');                                           │ │
│ │   });                                                                                                                                        │ │
│ │ }                                                                                                                                            │ │
│ │                                                                                                                                              │ │
│ │ // ---------------- Application Initialization --------------------------------                                                              │ │
│ │ document.addEventListener('DOMContentLoaded', async () => {                                                                                  │ │
│ │   console.log('Initializing EPRA Learning application...');                                                                                  │ │
│ │                                                                                                                                              │ │
│ │   try {                                                                                                                                      │ │
│ │     // Setup core functionality                                                                                                              │ │
│ │     setupSettingsModal();                                                                                                                    │ │
│ │     setupThemeToggle();                                                                                                                      │ │
│ │     setupLanguageSelector();                                                                                                                 │ │
│ │     setupCitationHandlers();                                                                                                                 │ │
│ │                                                                                                                                              │ │
│ │     // Initialize router - only chat and learning                                                                                            │ │
│ │     router = new Router();                                                                                                                   │ │
│ │     router.register('chat', renderChat);                                                                                                     │ │
│ │     router.register('learning', renderLearning);                                                                                             │ │
│ │                                                                                                                                              │ │
│ │     // Update UI                                                                                                                             │ │
│ │     updateTranslations();                                                                                                                    │ │
│ │     updateDemoBanner();                                                                                                                      │ │
│ │                                                                                                                                              │ │
│ │     // Load initial view                                                                                                                     │ │
│ │     await router.load();                                                                                                                     │ │
│ │                                                                                                                                              │ │
│ │     // Initialize APIs if keys are available                                                                                                 │ │
│ │     if (apiKeys.claude) {                                                                                                                    │ │
│ │       await initializeAPIs();                                                                                                                │ │
│ │     }                                                                                                                                        │ │
│ │                                                                                                                                              │ │
│ │     console.log('✓ EPRA Learning application initialized successfully');                                                                     │ │
│ │                                                                                                                                              │ │
│ │   } catch (error) {                                                                                                                          │ │
│ │     console.error('Initialization error:', error);                                                                                           │ │
│ │     showToast('Application initialization error', 'error');                                                                                  │ │
│ │   }                                                                                                                                          │ │
│ │ });   