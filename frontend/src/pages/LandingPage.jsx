import { Link } from "react-router-dom";
import { BrainCircuit, CheckCircle2, ClipboardList, FileText, ShieldCheck, Users } from "lucide-react";

const featureCards = [
  {
    title: "End-to-End Research Lifecycle",
    description: "Track publications, projects, patents, grants, and events in one institutional platform.",
    icon: ClipboardList,
  },
  {
    title: "Accreditation-Ready Reports",
    description: "Generate NAAC, NBA, NIRF, department-wise, and faculty API score reports in PDF/Excel.",
    icon: FileText,
  },
  {
    title: "AI Research Intelligence",
    description: "Use summary, recommendation, semantic search, OCR, proposal assistant, and CV generation modules.",
    icon: BrainCircuit,
  },
  {
    title: "Secure Governance",
    description: "Role-based access control, audit logs, approval workflow, and account activation safeguards.",
    icon: ShieldCheck,
  },
];

const workflow = [
  "Faculty submits research entries and documents",
  "HOD/Dean or Coordinator reviews and verifies",
  "Admin/Super Admin finalizes approval/rejection",
  "Reports, analytics, and AI insights update automatically",
];

const rolePills = ["Faculty", "HOD/Dean", "Research Coordinator", "Admin", "Super Admin"];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-16 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-100">
              <Users size={14} />
              Major Project Ready Platform
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-slate-100 md:text-5xl">
              Faculty Research Management System
            </h1>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
              FRMS is a production-ready institutional platform for research submissions, approval governance,
              accreditation reporting, and AI-powered research operations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                Login
              </Link>
              <Link to="/register" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                Register
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Role Workflow Snapshot</h2>
            <div className="space-y-3">
              {workflow.map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {rolePills.map((role) => (
                <span key={role} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-slate-800 dark:text-brand-100">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 md:px-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Platform Highlights</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featureCards.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-3 inline-flex rounded-lg bg-brand-50 p-2 text-brand-700 dark:bg-slate-800 dark:text-brand-100">
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Screenshots Preview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {["Dashboard", "AI Suite", "Reports", "Approvals", "Audit Logs", "Mobile View"].map((shot) => (
            <div key={shot} className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center dark:border-slate-600 dark:bg-slate-900">
              <CheckCircle2 className="mx-auto mb-2 text-slate-400" size={20} />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{shot}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Screenshot placeholder</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
