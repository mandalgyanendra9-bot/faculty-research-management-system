require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Department = require("../models/Department");
const FacultyProfile = require("../models/FacultyProfile");
const Publication = require("../models/Publication");
const ResearchProject = require("../models/ResearchProject");
const Patent = require("../models/Patent");
const Grant = require("../models/Grant");
const Event = require("../models/Event");
const Lookup = require("../models/Lookup");
const AIResearchPaper = require("../models/AIResearchPaper");
const AISemanticDocument = require("../models/AISemanticDocument");
const PlagiarismReport = require("../models/PlagiarismReport");
const SystemSetting = require("../models/SystemSetting");
const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    FacultyProfile.deleteMany({}),
    Publication.deleteMany({}),
    ResearchProject.deleteMany({}),
    Patent.deleteMany({}),
    Grant.deleteMany({}),
    Event.deleteMany({}),
    Lookup.deleteMany({}),
    AIResearchPaper.deleteMany({}),
    AISemanticDocument.deleteMany({}),
    PlagiarismReport.deleteMany({}),
    SystemSetting.deleteMany({}),
    AnalyticsSnapshot.deleteMany({}),
  ]);

  const departments = await Department.insertMany([
    { name: "Computer Science and Engineering", code: "CSE", school: "Engineering" },
    { name: "Electronics and Communication", code: "ECE", school: "Engineering" },
    { name: "Mechanical Engineering", code: "MECH", school: "Engineering" },
    { name: "Civil Engineering", code: "CIVIL", school: "Engineering" },
    { name: "Electrical Engineering", code: "EEE", school: "Engineering" },
    { name: "Information Technology", code: "IT", school: "Engineering" },
  ]);

  await Lookup.insertMany([
    { type: "designation", value: "Assistant Professor" },
    { type: "designation", value: "Associate Professor" },
    { type: "designation", value: "Professor" },
    { type: "designation", value: "Research Scholar" },
    { type: "designation", value: "Lab Instructor" },
    { type: "research_category", value: "Machine Learning" },
    { type: "research_category", value: "Embedded Systems" },
    { type: "research_category", value: "Sustainable Manufacturing" },
  ]);

  const [superAdmin, adminUser, hod, coordinator, faculty1, faculty2] = await Promise.all([
    User.create({
      name: "Super Admin",
      email: "mandalgyanendra9@gmail.com",
      password: "Admin@123",
      role: "super_admin",
      isActive: true,
      department: departments[0]._id,
      designation: "System Administrator",
    }),
    User.create({
      name: "Admin User",
      email: "admin.user@frms.com",
      password: "AdminUser@123",
      role: "admin",
      department: departments[0]._id,
      designation: "Admin",
    }),
    User.create({
      name: "Dr. Anita Rao",
      email: "hod.cse@frms.com",
      password: "Hod@12345",
      role: "hod_dean",
      department: departments[0]._id,
      designation: "HOD",
    }),
    User.create({
      name: "Prof. Vijay Kumar",
      email: "coordinator@frms.com",
      password: "Coord@123",
      role: "research_coordinator",
      department: departments[1]._id,
      designation: "Research Coordinator",
    }),
    User.create({
      name: "Dr. Priya Nair",
      email: "faculty1@frms.com",
      password: "Faculty@123",
      role: "faculty",
      department: departments[0]._id,
      designation: "Associate Professor",
    }),
    User.create({
      name: "Dr. Arjun Sen",
      email: "faculty2@frms.com",
      password: "Faculty@123",
      role: "faculty",
      department: departments[1]._id,
      designation: "Assistant Professor",
    }),
  ]);

  await Department.findByIdAndUpdate(departments[0]._id, { hod: hod._id });

  await FacultyProfile.insertMany([
    {
      user: faculty1._id,
      employeeId: "FAC001",
      qualification: "Ph.D. in Computer Science",
      areaOfExpertise: ["Artificial Intelligence", "Data Mining"],
      googleScholarId: "scholar_priya",
      orcidId: "0000-0001-2345-6789",
      scopusId: "57123456789",
      researchInterests: ["Machine Learning", "Explainable AI"],
      joinedAt: new Date("2018-07-01"),
    },
    {
      user: faculty2._id,
      employeeId: "FAC002",
      qualification: "Ph.D. in Electronics",
      areaOfExpertise: ["Signal Processing", "IoT"],
      googleScholarId: "scholar_arjun",
      orcidId: "0000-0002-4567-8910",
      scopusId: "57234567890",
      researchInterests: ["Embedded Systems", "Smart Sensors"],
      joinedAt: new Date("2020-01-15"),
    },
  ]);

  await Publication.insertMany([
    {
      title: "Deep Learning for Predictive Maintenance",
      type: "journal",
      authors: ["Dr. Priya Nair", "Dr. Anita Rao"],
      journalOrConferenceName: "IEEE Access",
      doi: "10.1109/ACCESS.2025.1234567",
      issnIsbn: "2169-3536",
      publicationYear: 2025,
      volumeIssuePage: "Vol 13, Issue 5, pp. 101-114",
      indexingType: "Scopus",
      impactFactor: 3.9,
      citationCount: 18,
      submittedBy: faculty1._id,
      department: departments[0]._id,
      approvalStatus: "approved",
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
      score: 31,
    },
    {
      title: "IoT-driven Smart Campus Energy Monitoring",
      type: "conference",
      authors: ["Dr. Arjun Sen"],
      journalOrConferenceName: "International Conference on Smart Systems",
      publicationYear: 2024,
      indexingType: "IEEE",
      citationCount: 4,
      submittedBy: faculty2._id,
      department: departments[1]._id,
      approvalStatus: "pending",
      score: 18,
    },
  ]);

  await ResearchProject.insertMany([
    {
      projectTitle: "AI-based Rural Healthcare Diagnostics",
      fundingAgency: "DST",
      principalInvestigator: "Dr. Priya Nair",
      coInvestigators: ["Dr. Anita Rao"],
      amountSanctioned: 1250000,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2027-05-31"),
      status: "Ongoing",
      progressReport: "Prototype validated with pilot data",
      submittedBy: faculty1._id,
      department: departments[0]._id,
      approvalStatus: "approved",
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
    },
  ]);

  await Patent.insertMany([
    {
      patentTitle: "Low-power Edge Device for Soil Intelligence",
      applicationNumber: "IN202541000123",
      inventors: ["Dr. Arjun Sen", "Prof. Vijay Kumar"],
      status: "Filed",
      filingDate: new Date("2025-01-12"),
      submittedBy: faculty2._id,
      department: departments[1]._id,
      approvalStatus: "pending",
    },
  ]);

  await Grant.insertMany([
    {
      grantProposal: "Autonomous Water Quality Monitoring",
      agencyName: "AICTE",
      amountRequested: 800000,
      amountApproved: 500000,
      utilizationReport: "30% utilized for sensors and deployment",
      statusTracking: "Phase 1 Complete",
      submittedBy: faculty1._id,
      department: departments[0]._id,
      approvalStatus: "approved",
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
    },
  ]);

  await Event.insertMany([
    {
      eventName: "Outcome-based Research Practices Workshop",
      eventType: "Workshop",
      participationType: "Attended",
      role: "Participant",
      date: new Date("2025-08-22"),
      submittedBy: faculty1._id,
      department: departments[0]._id,
      approvalStatus: "approved",
      approvedBy: superAdmin._id,
      approvedAt: new Date(),
    },
  ]);

  const paper = await AIResearchPaper.create({
    uploadedBy: faculty1._id,
    title: "AI-driven Clinical Decision Support in Primary Care",
    fileUrl: "/uploads/sample-ai-paper.pdf",
    extractedText:
      "This study explores AI-driven clinical decision support systems in primary healthcare. The methodology uses retrospective patient data and interpretable machine learning models to improve triage outcomes and reduce response time.",
    abstractSummary:
      "AI-based decision support can improve triage speed and accuracy in primary care when coupled with explainable model outputs.",
    keyFindings:
      "Interpretable models improved clinician trust and reduced decision time while maintaining acceptable predictive performance.",
    keywords: ["healthcare", "triage", "explainable-ai", "decision-support"],
    contributionSummary:
      "The work demonstrates practical adoption pathways for explainable AI in real-world primary care settings.",
  });

  await AISemanticDocument.create({
    sourceType: "paper",
    sourceId: paper._id,
    faculty: faculty1._id,
    department: departments[0]._id,
    title: paper.title,
    content: paper.extractedText,
    keywords: paper.keywords,
    embedding: [],
    metadata: { seeded: true },
  });

  await PlagiarismReport.create({
    publication: (await Publication.findOne({ title: "IoT-driven Smart Campus Energy Monitoring" }))._id,
    submittedBy: faculty2._id,
    similarityPercentage: 34,
    flagged: true,
    notes: "Similarity above threshold; requires revision before final approval.",
    reportUrl: "/uploads/sample-plagiarism-report.pdf",
  });

  await SystemSetting.create({
    key: "ai_provider_config",
    value: { mode: "auto", preferredProvider: "openai" },
    updatedBy: superAdmin._id,
  });

  await AnalyticsSnapshot.insertMany([
    {
      type: "citation",
      payload: {
        averageCitation: 11,
        highImpactPublications: [
          { title: "Deep Learning for Predictive Maintenance", citationCount: 18, predictedNextYear: 23 },
        ],
      },
    },
    {
      type: "trend",
      payload: {
        trendingTopics: [
          { topic: "machine", count: 5 },
          { topic: "iot", count: 4 },
        ],
      },
    },
  ]);

  // eslint-disable-next-line no-console
  console.log("Seed data created successfully");
  // eslint-disable-next-line no-console
  console.log("Admin login => email: mandalgyanendra9@gmail.com password: Admin@123");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
