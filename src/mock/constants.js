// Ported from the former Node backend (server/lib/constants.js).
// These drive the /meta/constants, /billing and /brand mock endpoints.

export const DOMAINS = [
  "Cyber Security", "Ethical Hacking", "Penetration Testing", "Network Security",
  "Application Security", "Cloud Security", "SOC / Blue Team", "Red Team",
  "Vulnerability Assessment", "Malware Analysis", "Digital Forensics",
  "Bug Bounty", "Security Operations", "Identity & Access Management",
  "DevSecOps", "Compliance & GRC",
  "QA / Software Testing", "Manual Testing", "Automation Testing",
  "API Testing", "Performance Testing", "Mobile App Testing", "Security Testing",
  "Fintech", "EdTech", "HealthTech", "AgriTech", "SaaS", "E-commerce",
  "Logistics", "HRTech", "LegalTech", "CleanTech", "AI/ML", "IoT",
  "Travel Tech", "D2C", "ERP", "DevOps", "Full Stack", "Data Science",
  "Blockchain", "Web Development", "Mobile Development", "UI/UX",
  "Product", "Marketing", "Content", "Other",
];

export const SKILLS = [
  "React", "Python", "Node.js", "Django", "Flask", "FastAPI", "Java", "Go",
  "Kubernetes", "Docker", "PostgreSQL", "MongoDB", "Machine Learning",
  "Deep Learning", "TensorFlow", "PyTorch", "Sklearn", "Flutter",
  "React Native", "Android", "iOS", "Swift", "Kotlin", "C++", "Embedded",
  "Firebase", "AWS", "GCP", "Azure", "Figma", "Photoshop", "Canva",
  "UI/UX Design", "Product Management", "Content Writing", "SEO", "SEM",
  "Performance Marketing", "Social Media", "Excel", "PowerBI", "Tableau",
  "Data Analysis", "SQL", "Growth Hacking", "Sales", "Business Development",
  "Recruitment", "HR", "Strategy", "Operations", "Finance", "Accounting",
  "Legal Research", "Copywriting", "Video Editing", "Graphic Design",
  "Communication", "Leadership", "Public Speaking",
  // Cyber security & ethical hacking
  "Ethical Hacking", "Penetration Testing", "OWASP", "Burp Suite", "Metasploit",
  "Nmap", "Wireshark", "Kali Linux", "Linux", "Networking", "Cryptography",
  "SIEM", "Splunk", "CrowdStrike", "Firewalls", "IDS/IPS", "Threat Hunting",
  "Incident Response", "Vulnerability Assessment", "Web App Security",
  "API Security", "Cloud Security", "Zero Trust", "CISSP", "CEH", "CompTIA Security+",
  // Testing
  "Manual Testing", "Automation Testing", "Selenium", "Cypress", "Playwright",
  "JUnit", "TestNG", "Postman", "REST Assured", "JMeter", "Appium",
  "QA", "Bug Tracking", "Test Planning", "Regression Testing",
];

export const DEGREES = ["B.Tech", "B.Sc", "B.Com", "B.A", "BBA", "BCA", "MBA", "MCA", "M.Tech", "Other"];

/** Academic departments (student / institution profiles) */
export const DEPARTMENTS = [
  "Computer Science (CSE)", "Information Technology (IT)",
  "Cyber Security", "Information Security", "Computer Science & Cyber Security",
  "Electronics & Communication (ECE)", "Electrical (EEE)",
  "Mechanical", "Civil", "Chemical", "Aerospace", "Biotechnology",
  "Artificial Intelligence & Data Science", "Artificial Intelligence & Machine Learning",
  "Software Engineering", "Electronics & Instrumentation",
  "Management", "Marketing", "Finance", "Operations", "HR",
  "Arts", "Science", "Commerce", "Economics", "Design", "Law",
  "Psychology", "Mass Communication", "Pharmacy", "Nursing", "Other",
];

/** Functional departments when posting an internship (/startup/post) */
export const OPPORTUNITY_DEPARTMENTS = [
  "Cyber Security", "Ethical Hacking", "Information Security", "SOC",
  "Network Security", "Application Security", "Cloud Security",
  "QA / Testing", "Automation Testing", "Manual Testing",
  "Engineering", "Software Development", "Full Stack", "Backend", "Frontend",
  "DevOps", "Cloud", "Data Science", "AI/ML", "Product", "Design", "UI/UX",
  "Marketing", "Content", "Sales", "Business Development",
  "Finance", "Operations", "HR", "Legal", "Research", "Other",
];

export const WORK_MODES = ["remote", "hybrid", "onsite"];
export const STIPEND_BUCKETS = ["Unpaid", "₹0-5K", "₹5-10K", "₹10-20K", "₹20-30K", "₹30K+", "Negotiable"];
export const DURATIONS = ["1 month", "2 months", "3 months", "6 months", "Flexible"];
export const TEAM_SIZES = ["1-5", "6-20", "21-50", "51-200", "200+"];
export const STARTUP_STAGES = ["Idea", "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped", "Profitable"];
export const INSTITUTION_TYPES = ["Engineering College", "Arts & Science", "Management", "University", "Deemed University", "Polytechnic", "Law School", "Incubation Center", "Other"];
export const ACCREDITATIONS = ["NAAC", "NBA", "ISO", "UGC", "AICTE"];
export const APPLICATION_STAGES = ["applied", "reviewed", "shortlisted", "interview", "offer", "hired", "rejected"];
export const PERKS = ["Certificate", "Letter of Recommendation", "PPO possibility", "Flexible hours", "Free courses", "Equity"];

export const INDIAN_CITIES = [
  "Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata",
  "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal",
  "Patna", "Vadodara", "Surat", "Goa", "Coimbatore", "Trichy", "Madurai",
  "Vijayawada", "Visakhapatnam", "Noida", "Gurgaon", "Chandigarh", "Manipal",
  "Phagwara", "Jamshedpur", "Kozhikode",
];

export const CITY_TO_STATE = {
  Bengaluru: "Karnataka", Mumbai: "Maharashtra", Delhi: "Delhi",
  Hyderabad: "Telangana", Chennai: "Tamil Nadu", Pune: "Maharashtra",
  Kolkata: "West Bengal", Ahmedabad: "Gujarat", Jaipur: "Rajasthan",
  Lucknow: "Uttar Pradesh", Kanpur: "Uttar Pradesh", Nagpur: "Maharashtra",
  Indore: "Madhya Pradesh", Bhopal: "Madhya Pradesh", Patna: "Bihar",
  Vadodara: "Gujarat", Surat: "Gujarat", Goa: "Goa",
  Coimbatore: "Tamil Nadu", Trichy: "Tamil Nadu", Madurai: "Tamil Nadu",
  Vijayawada: "Andhra Pradesh", Visakhapatnam: "Andhra Pradesh",
  Noida: "Uttar Pradesh", Gurgaon: "Haryana", Chandigarh: "Chandigarh",
  Manipal: "Karnataka", Phagwara: "Punjab", Jamshedpur: "Jharkhand",
  Kozhikode: "Kerala",
};

export const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "Malayalam", "Gujarati", "Punjabi"];

/** Paid plans removed — students, startups, and institutions are free. */
export const PLANS = {};

export const DEFAULT_BRAND = {
  id: "default",
  name: "Lerbo Tech",
  tagline: "Get Your Internship Certificate",
  description:
    "Lerbo Tech helps you apply for verified internships, pass verification and validation, and receive your official completion certificate.",
  phone: "+91 95856 41186",
  email: "connect@lerbotech.in",
  address_lines: [
    "3/153, N. Valasai", "Seikalathur", "Manamadurai", "Sivagangai", "Tamil Nadu", "India – 630 606",
  ],
  linkedin_url: "https://www.linkedin.com/company/lerbo-tech",
  instagram_url: "https://www.instagram.com/lerbotech/",
  business_hours: "Mon – Sat · 10:00 AM to 7:00 PM IST",
  support_response_sla: "We typically respond within 24 hours.",
  copyright: "© 2025 Lerbo Tech. Made in India for India's startup ecosystem.",
};

export const DEMO_PASSWORD = "Demo@2025";
export const ADMIN_EMAIL = "tamilselvan@cyberwolf360.in";
export const ADMIN_PASSWORD = "Admin@CyberWolf2025";
