const User = require("../models/User");
const Department = require("../models/Department");
const Publication = require("../models/Publication");
const Patent = require("../models/Patent");
const ResearchProject = require("../models/ResearchProject");
const Grant = require("../models/Grant");
const Event = require("../models/Event");
const { calculateResearchScore } = require("../utils/score");

const getOverview = async () => {
  const [
    totalFaculty,
    totalPublications,
    totalPatents,
    totalProjects,
    totalGrants,
    pendingApprovals,
    departments,
  ] = await Promise.all([
    User.countDocuments({ role: "faculty" }),
    Publication.countDocuments({ approvalStatus: "approved" }),
    Patent.countDocuments({ approvalStatus: "approved" }),
    ResearchProject.countDocuments({ approvalStatus: "approved" }),
    Grant.countDocuments({ approvalStatus: "approved" }),
    Promise.all([
      Publication.countDocuments({ approvalStatus: "pending" }),
      Patent.countDocuments({ approvalStatus: "pending" }),
      ResearchProject.countDocuments({ approvalStatus: "pending" }),
      Grant.countDocuments({ approvalStatus: "pending" }),
      Event.countDocuments({ approvalStatus: "pending" }),
    ]).then((arr) => arr.reduce((a, b) => a + b, 0)),
    Department.find({ isActive: true }).lean(),
  ]);

  const deptOutputs = await Promise.all(
    departments.map(async (dept) => {
      const [pubs, patents, projects, grants, events] = await Promise.all([
        Publication.countDocuments({ department: dept._id, approvalStatus: "approved" }),
        Patent.countDocuments({ department: dept._id, approvalStatus: "approved" }),
        ResearchProject.countDocuments({ department: dept._id, approvalStatus: "approved" }),
        Grant.countDocuments({ department: dept._id, approvalStatus: "approved" }),
        Event.countDocuments({ department: dept._id, approvalStatus: "approved" }),
      ]);

      return {
        department: dept.name,
        output: pubs + patents + projects + grants + events,
      };
    })
  );

  const yearWisePublications = await Publication.aggregate([
    { $match: { approvalStatus: "approved" } },
    { $group: { _id: "$publicationYear", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalFaculty,
    totalPublications,
    totalPatents,
    totalProjects,
    totalGrants,
    pendingApprovals,
    departmentWiseResearchOutput: deptOutputs,
    yearWisePublications: yearWisePublications.map((x) => ({ year: x._id, count: x.count })),
    topPerformingDepartments: deptOutputs.sort((a, b) => b.output - a.output).slice(0, 5),
  };
};

const getFacultyRanking = async () => {
  const facultyUsers = await User.find({ role: "faculty", isActive: true }).populate("department").lean();

  const ranking = await Promise.all(
    facultyUsers.map(async (user) => {
      const [publications, patents, projects, grants, events] = await Promise.all([
        Publication.find({ submittedBy: user._id, approvalStatus: "approved" }).lean(),
        Patent.find({ submittedBy: user._id, approvalStatus: "approved" }).lean(),
        ResearchProject.find({ submittedBy: user._id, approvalStatus: "approved" }).lean(),
        Grant.find({ submittedBy: user._id, approvalStatus: "approved" }).lean(),
        Event.find({ submittedBy: user._id, approvalStatus: "approved" }).lean(),
      ]);

      const score = calculateResearchScore({ publications, patents, projects, grants, events });
      return {
        facultyId: user._id,
        name: user.name,
        department: user.department?.name || "N/A",
        score,
      };
    })
  );

  return ranking.sort((a, b) => b.score - a.score);
};

module.exports = { getOverview, getFacultyRanking };
