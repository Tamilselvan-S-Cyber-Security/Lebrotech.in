/** Shared Lerbo Tech copy — internship certificate focus */

export const CERTIFICATE_TAGLINE = "Get Your Internship Certificate";
export const CERTIFICATE_INTRO =
  "Lerbo Tech is a professional internship platform — apply to verified openings, complete verification, and earn your official completion certificate.";

export const PLATFORM_FEATURES = [
  {
    id: "verified",
    title: "Verified internship openings",
    desc: "Every startup is reviewed before listings go live, so students apply only to genuine, certificate-eligible roles.",
  },
  {
    id: "match",
    title: "Smart profile matching",
    desc: "One student profile surfaces internships by department, skills, and mode — remote, hybrid, or on-site.",
  },
  {
    id: "pipeline",
    title: "End-to-end application pipeline",
    desc: "Apply, track status, and message startups from a single dashboard built for campus hiring workflows.",
  },
  {
    id: "certificate",
    title: "Official completion certificates",
    desc: "Finish your internship and download a verified Lerbo Tech certificate for your resume and LinkedIn.",
  },
  {
    id: "campus",
    title: "Campus & placement ready",
    desc: "Institutions track applications, verifications, and certificates — ready for placement and accreditation reports.",
  },
  {
    id: "free",
    title: "Free for every role",
    desc: "Students, startups, and institutions use the full platform at no cost — post, apply, and certify without fees.",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    n: "01",
    title: "Apply for Internship",
    desc: "Browse verified openings and submit your application in one click with your Lerbo Tech profile.",
  },
  {
    n: "02",
    title: "Verification & Validation",
    desc: "Our team reviews your profile and credentials before your application reaches the startup.",
  },
  {
    n: "03",
    title: "Receive Your Certificate",
    desc: "Complete your internship and download your official, verified Lerbo Tech completion certificate.",
  },
];

export const STUDENT_BENEFITS = [
  "All departments welcome — engineering, commerce, arts, management, design, law & more",
  "Verified internships with official completion certificates",
  "Course & workshop certificates (Cyber Security, Cloud, Full Stack & more)",
  "Step-by-step: apply, verify, complete, and download your certificate",
  "One profile for internships, workshops, and certificate applications",
  "Share verified certificates on your resume, LinkedIn, and campus records",
];

/** Short copy for /students hero */
export const STUDENT_PAGE_INTRO =
  "Every student, every department — Lerbo Tech guides you through verified internships, hands-on course workshops, and official completion certificates. Whether you study engineering, commerce, arts, management, or any other stream, your path to a verified credential is the same: apply, get verified, complete, and certify.";

export const STUDENT_DEGREE_TAGS = [
  "B.Tech / B.E", "B.Sc", "B.Com", "B.A", "BBA", "BCA", "MBA", "MCA", "M.Tech", "Diploma", "All streams",
];

export const STUDENT_CERTIFICATE_PATHS = [
  {
    id: "internships",
    title: "Internships",
    desc: "Browse certificate-eligible internships across tech, marketing, finance, operations, design, HR, and more — matched to your department and skills.",
    cta: "/opportunities",
    ctaLabel: "Browse internships",
  },
  {
    id: "workshops",
    title: "Course workshops",
    desc: "Enroll in Cyber Security, Cloud, Full Stack, VAPT, and more — verified workshop certificate from ₹199 (marketing offer).",
    cta: "/apply-certificate",
    ctaLabel: "Apply for workshop — ₹199",
  },
  {
    id: "certificates",
    title: "Verified certificates",
    desc: "Receive your official Lerbo Tech certificate after verification and completion — valid for internships, courses, and workshops.",
    cta: "/apply-certificate",
    ctaLabel: "Get your certificate",
  },
];

export const STARTUP_BENEFITS = [
  "Post verified internships eligible for Lerbo Tech certificates",
  "Review and validate student applications in one pipeline",
  "Confirm internship completion for certificate issuance",
  "Build trust with certificate-backed internship programs",
  "Reach students focused on getting certified",
];

export const INSTITUTION_BENEFITS = [
  { t: "Certificate dashboard", d: "See which students applied, were verified, and received their internship certificate." },
  { t: "Verified internship feed", d: "Share certificate-eligible internships with departments instantly." },
  { t: "NAAC-ready reports", d: "Download certificate and internship outcome reports for accreditation." },
];

export const FAQS = {
  Students: [
    { q: "Is Lerbo Tech free for students?", a: "Yes. Students never pay. Applying to internships, completing verification, and earning your completion certificate is completely free." },
    { q: "How do I get my internship certificate?", a: "Apply for a verified internship, pass verification and validation, complete your internship, and your Lerbo Tech certificate is issued automatically." },
    { q: "Is the certificate verified?", a: "Yes. Every certificate is issued only after your profile is verified, your application is validated, and your internship completion is confirmed by the startup." },
    { q: "Can non-tech students get a certificate?", a: "Absolutely — we have certificate-eligible internships across marketing, content, operations, design, finance, HR, sales and more." },
    { q: "How do I know an internship is legitimate?", a: "Every startup is verified by our admin team before any internship goes live and becomes certificate-eligible." },
  ],
  Startups: [
    { q: "How do I issue certificates to interns?", a: "Mark internship completion in your dashboard. Lerbo Tech generates a verified certificate for the student automatically." },
    { q: "How much does posting an internship cost?", a: "Nothing. Startups use Lerbo Tech free — unlimited internship postings, applicant management, and certificate issuance with no monthly fee." },
    { q: "Do you take a fee when we certify an intern?", a: "Never. There are no per-intern commissions, recruiter cuts, or startup subscription fees." },
    { q: "What is verification and validation?", a: "We verify student profiles and validate applications before they reach your pipeline, so you review only genuine, certificate-ready candidates." },
  ],
  Institutions: [
    { q: "Can we track student certificates?", a: "Yes. The institution dashboard shows which students applied, were verified, completed internships, and received their Lerbo Tech certificate." },
    { q: "Is there a paid campus plan?", a: "No. Institutions use Lerbo Tech free — unlimited students, analytics, referral links, and certificate tracking with no subscription." },
    { q: "Can students self-register?", a: "Yes, but you can also bulk-import a batch from your placement office for faster onboarding and certificate tracking." },
  ],
};

export const TESTIMONIALS = [
  { q: "I applied on Lerbo Tech, completed verification, and received my internship certificate in weeks.", n: "Arun", r: "3rd Year Student", photo: `${process.env.PUBLIC_URL}/placement/1.png` },
  { q: "We use Lerbo Tech to run internships that end with a verified certificate for every intern.", n: "Kumar", r: "Founder", photo: `${process.env.PUBLIC_URL}/placement/2.png` },
  { q: "Our campus tracks who applied, got verified, and received their Lerbo Tech certificate — all in one place.", n: "Vijay", r: "Placement Officer", photo: `${process.env.PUBLIC_URL}/placement/3.png` },
  { q: "The verification step gave my resume real credibility. Recruiters trust the Lerbo Tech certificate.", n: "Sneha", r: "Final Year Student", photo: `${process.env.PUBLIC_URL}/placement/4.png` },
  { q: "Posting internships and issuing certificates is effortless. Our interns love the verified proof.", n: "Rahul", r: "CTO", photo: `${process.env.PUBLIC_URL}/placement/1.png` },
  { q: "From application to certificate, everything is transparent. Best platform for campus placements.", n: "Meera", r: "Placement Head", photo: `${process.env.PUBLIC_URL}/placement/2.png` },
  { q: "I got a paid internship and a verified certificate — both through Lerbo Tech. Highly recommend it.", n: "Karthik", r: "2nd Year Student", photo: `${process.env.PUBLIC_URL}/placement/3.png` },
  { q: "The certificate feed helps our department share only genuine, verified opportunities with students.", n: "Divya", r: "Faculty Coordinator", photo: `${process.env.PUBLIC_URL}/placement/4.png` },
];

export const STORIES = [
  { who: "Arun", from: "BITS Pilani · CSE 3rd year", role: "Certified Frontend Intern", q: "I applied on Lerbo Tech, passed verification, completed my internship, and downloaded my certificate within weeks.", photo: `${process.env.PUBLIC_URL}/placement/1.png` },
  { who: "Kumar", from: "Founder, TechNest (Seed)", role: "Certificate Partner", q: "Every intern we hire through Lerbo Tech gets a verified completion certificate. It builds trust with students and their colleges.", photo: `${process.env.PUBLIC_URL}/placement/2.png` },
  { who: "Vijay", from: "TPO, SRM University", role: "Institution Partner", q: "We finally track who applied, got verified, and received their certificate. NAAC reports are a click away.", photo: `${process.env.PUBLIC_URL}/placement/3.png` },
  { who: "Rohan Verma", from: "BITS Pilani · CSE final year", role: "Certified DevOps Intern", q: "The three-step flow was clear — apply, verify, get certified. My Lerbo Tech certificate is on my resume and LinkedIn.", photo: `${process.env.PUBLIC_URL}/placement/4.png` },
];
