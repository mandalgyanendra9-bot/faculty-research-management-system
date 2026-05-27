const calculatePublicationScore = (publication) => {
  let score = 0;
  const indexingType = publication.indexingType || "";

  if (["scopus", "sci"].includes(indexingType.toLowerCase())) score += 20;
  if (indexingType.toLowerCase().includes("ugc")) score += 12;
  if (indexingType.toLowerCase().includes("web of science")) score += 18;
  if (indexingType.toLowerCase().includes("ieee")) score += 16;

  score += Math.min(publication.citationCount || 0, 30) * 0.5;
  score += Math.min(publication.impactFactor || 0, 20) * 0.5;

  return Math.round(score);
};

const calculateResearchScore = ({ publications = [], patents = [], projects = [], grants = [], events = [] }) => {
  const publicationPoints = publications.reduce((sum, p) => sum + calculatePublicationScore(p), 0);
  const patentPoints = patents.reduce((sum, patent) => {
    const status = (patent.status || "").toLowerCase();
    if (status === "granted") return sum + 50;
    if (status === "published") return sum + 35;
    return sum + 20;
  }, 0);

  const projectPoints = projects.reduce((sum, project) => {
    const amount = project.amountSanctioned || 0;
    return sum + 25 + Math.min(amount / 100000, 40);
  }, 0);

  const grantPoints = grants.reduce((sum, grant) => {
    const approved = grant.amountApproved || 0;
    return sum + 15 + Math.min(approved / 100000, 35);
  }, 0);

  const eventPoints = events.length * 3;

  return Math.round(publicationPoints + patentPoints + projectPoints + grantPoints + eventPoints);
};

module.exports = { calculatePublicationScore, calculateResearchScore };
