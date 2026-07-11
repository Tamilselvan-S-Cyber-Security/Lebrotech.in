import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminTotpGuard from "@/components/AdminTotpGuard";

// Public
import Landing from "@/pages/public/Landing";
import About from "@/pages/public/About";
import HowItWorks from "@/pages/public/HowItWorks";
import ForStudents from "@/pages/public/ForStudents";
import OpportunitiesPublic from "@/pages/public/OpportunitiesPublic";
import OpportunityDetailPublic from "@/pages/public/OpportunityDetailPublic";
import Stories from "@/pages/public/Stories";
import Contact from "@/pages/public/Contact";
import FAQ from "@/pages/public/FAQ";
import Privacy from "@/pages/public/Privacy";
import Terms from "@/pages/public/Terms";

// Auth
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Student
import StudentDashboard from "@/pages/student/Dashboard";
import StudentOpportunities from "@/pages/student/Opportunities";
import StudentOpportunityDetail from "@/pages/student/OpportunityDetail";
import StudentApplications from "@/pages/student/Applications";
import StudentProfile from "@/pages/student/Profile";
import StudentNotifications from "@/pages/student/Notifications";
import StudentOnboarding from "@/pages/student/Onboarding";
import StudentSaved from "@/pages/student/Saved";
import StudentCertification from "@/pages/student/Certification";

// Startup
import StartupDashboard from "@/pages/startup/Dashboard";
import StartupPostOpportunity from "@/pages/startup/PostOpportunity";
import StartupManagePostings from "@/pages/startup/ManagePostings";
import StartupApplicants from "@/pages/startup/Applicants";
import StartupCandidateProfile from "@/pages/startup/CandidateProfile";
import StartupProfile from "@/pages/startup/Profile";
import StartupNotifications from "@/pages/startup/Notifications";
import StartupBilling from "@/pages/startup/Billing";
import StartupOnboarding from "@/pages/startup/Onboarding";

// Institution
import InstitutionDashboard from "@/pages/institution/Dashboard";
import InstitutionStudents from "@/pages/institution/Students";
import InstitutionAnalytics from "@/pages/institution/Analytics";
import InstitutionOpportunities from "@/pages/institution/Opportunities";
import InstitutionProfile from "@/pages/institution/Profile";
import InstitutionOnboardStudents from "@/pages/institution/OnboardStudents";
import InstitutionBilling from "@/pages/institution/Billing";

// Admin
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminVerifications from "@/pages/admin/Verifications";
import AdminOpportunities from "@/pages/admin/Opportunities";
import AdminEnquiries from "@/pages/admin/Enquiries";
import AdminBrandSettings from "@/pages/admin/BrandSettings";
import AdminActivity from "@/pages/admin/Activity";
import AdminStudentDetail from "@/pages/admin/StudentDetail";
import AdminStartupDetail from "@/pages/admin/StartupDetail";
import AdminInstitutionDetail from "@/pages/admin/InstitutionDetail";
import AdminOpportunityDetail from "@/pages/admin/OpportunityDetail";
import AdminBilling from "@/pages/admin/Billing";
import AdminSecurity from "@/pages/admin/Security";
import AdminApplications from "@/pages/admin/Applications";
import AdminCertificates from "@/pages/admin/Certificates";

// Public
import ApplyCertificate from "@/pages/public/ApplyCertificate";

// Shared
import Help from "@/pages/shared/Help";
import Messages from "@/pages/shared/Messages";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/students" element={<ForStudents />} />
            <Route path="/startups" element={<Navigate to="/students" replace />} />
            <Route path="/institutions" element={<Navigate to="/students" replace />} />
            <Route path="/opportunities" element={<OpportunitiesPublic />} />
            <Route path="/opportunities/:id" element={<OpportunityDetailPublic />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/apply-certificate" element={<ApplyCertificate />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student */}
            <Route path="/student" element={<ProtectedRoute roles={["student"]}><Navigate to="/student/dashboard" replace /></ProtectedRoute>} />
            <Route path="/student/onboarding" element={<ProtectedRoute roles={["student"]}><StudentOnboarding /></ProtectedRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/opportunities" element={<ProtectedRoute roles={["student"]}><StudentOpportunities /></ProtectedRoute>} />
            <Route path="/student/opportunities/:id" element={<ProtectedRoute roles={["student"]}><StudentOpportunityDetail /></ProtectedRoute>} />
            <Route path="/student/applications" element={<ProtectedRoute roles={["student"]}><StudentApplications /></ProtectedRoute>} />
            <Route path="/student/certification" element={<ProtectedRoute roles={["student"]}><StudentCertification /></ProtectedRoute>} />
            <Route path="/student/certificatation" element={<ProtectedRoute roles={["student"]}><Navigate to="/student/certification" replace /></ProtectedRoute>} />
            <Route path="/student/saved" element={<ProtectedRoute roles={["student"]}><StudentSaved /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute roles={["student"]}><StudentProfile /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute roles={["student"]}><StudentNotifications /></ProtectedRoute>} />
            <Route path="/student/help" element={<ProtectedRoute roles={["student"]}><Help /></ProtectedRoute>} />
            <Route path="/student/messages" element={<ProtectedRoute roles={["student"]}><Messages /></ProtectedRoute>} />

            {/* Startup */}
            <Route path="/startup" element={<ProtectedRoute roles={["startup"]}><Navigate to="/startup/dashboard" replace /></ProtectedRoute>} />
            <Route path="/startup/onboarding" element={<ProtectedRoute roles={["startup"]}><StartupOnboarding /></ProtectedRoute>} />
            <Route path="/startup/dashboard" element={<ProtectedRoute roles={["startup"]}><StartupDashboard /></ProtectedRoute>} />
            <Route path="/startup/post" element={<ProtectedRoute roles={["startup"]}><StartupPostOpportunity /></ProtectedRoute>} />
            <Route path="/startup/opportunities" element={<ProtectedRoute roles={["startup"]}><StartupManagePostings /></ProtectedRoute>} />
            <Route path="/startup/applicants/:oppId" element={<ProtectedRoute roles={["startup"]}><StartupApplicants /></ProtectedRoute>} />
            <Route path="/startup/candidate/:studentId" element={<ProtectedRoute roles={["startup"]}><StartupCandidateProfile /></ProtectedRoute>} />
            <Route path="/startup/profile" element={<ProtectedRoute roles={["startup"]}><StartupProfile /></ProtectedRoute>} />
            <Route path="/startup/notifications" element={<ProtectedRoute roles={["startup"]}><StartupNotifications /></ProtectedRoute>} />
            <Route path="/startup/billing" element={<ProtectedRoute roles={["startup"]}><StartupBilling /></ProtectedRoute>} />
            <Route path="/startup/help" element={<ProtectedRoute roles={["startup"]}><Help /></ProtectedRoute>} />
            <Route path="/startup/messages" element={<ProtectedRoute roles={["startup"]}><Messages /></ProtectedRoute>} />

            {/* Institution */}
            <Route path="/institution" element={<ProtectedRoute roles={["institution"]}><Navigate to="/institution/dashboard" replace /></ProtectedRoute>} />
            <Route path="/institution/dashboard" element={<ProtectedRoute roles={["institution"]}><InstitutionDashboard /></ProtectedRoute>} />
            <Route path="/institution/students" element={<ProtectedRoute roles={["institution"]}><InstitutionStudents /></ProtectedRoute>} />
            <Route path="/institution/onboard" element={<ProtectedRoute roles={["institution"]}><InstitutionOnboardStudents /></ProtectedRoute>} />
            <Route path="/institution/analytics" element={<ProtectedRoute roles={["institution"]}><InstitutionAnalytics /></ProtectedRoute>} />
            <Route path="/institution/opportunities" element={<ProtectedRoute roles={["institution"]}><InstitutionOpportunities /></ProtectedRoute>} />
            <Route path="/institution/profile" element={<ProtectedRoute roles={["institution"]}><InstitutionProfile /></ProtectedRoute>} />
            <Route path="/institution/billing" element={<ProtectedRoute roles={["institution"]}><InstitutionBilling /></ProtectedRoute>} />
            <Route path="/institution/notifications" element={<ProtectedRoute roles={["institution"]}><StudentNotifications /></ProtectedRoute>} />
            <Route path="/institution/help" element={<ProtectedRoute roles={["institution"]}><Help /></ProtectedRoute>} />

            {/* Admin — TOTP security gate on all dashboard routes */}
            <Route path="/admin/security" element={<ProtectedRoute roles={["admin"]}><AdminSecurity /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><Navigate to="/admin/dashboard" replace /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminDashboard /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminUsers /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/verifications" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminVerifications /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/applications" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminApplications /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/certificates" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminCertificates /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/opportunities" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminOpportunities /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/opportunities/:id" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminOpportunityDetail /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/billing" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminBilling /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/students/:id" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminStudentDetail /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/startups/:id" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminStartupDetail /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/institutions/:id" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminInstitutionDetail /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/activity" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminActivity /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/enquiries" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminEnquiries /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/brand" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><AdminBrandSettings /></AdminTotpGuard></ProtectedRoute>} />
            <Route path="/admin/help" element={<ProtectedRoute roles={["admin"]}><AdminTotpGuard><Help /></AdminTotpGuard></ProtectedRoute>} />

            {/* 404 → home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
