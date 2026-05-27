const { getOverview, getFacultyRanking } = require("../services/dashboardService");
const catchAsync = require("../utils/catchAsync");

const overview = async (_req, res) => {
  const data = await getOverview();
  res.json({ success: true, data });
};

const facultyRanking = async (_req, res) => {
  const data = await getFacultyRanking();
  res.json({ success: true, data });
};

module.exports = {
  overview: catchAsync(overview),
  facultyRanking: catchAsync(facultyRanking),
};
