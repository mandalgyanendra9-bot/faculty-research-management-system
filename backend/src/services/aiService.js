const fs = require("fs");
const { getAIProviderConfig } = require("./settingsService");

const JOURNAL_CONFERENCE_MAP = [
  {
    domain: "artificial intelligence machine learning healthcare",
    journals: ["IEEE Journal of Biomedical and Health Informatics", "Artificial Intelligence in Medicine", "Journal of Healthcare Informatics Research"],
    conferences: ["AAAI", "IJCAI", "IEEE BIBM"],
    researchDomains: ["Clinical NLP", "Medical Imaging AI", "Predictive Healthcare"],
  },
  {
    domain: "data science analytics big data",
    journals: ["Data Mining and Knowledge Discovery", "Knowledge and Information Systems", "Journal of Big Data"],
    conferences: ["KDD", "ICDM", "PAKDD"],
    researchDomains: ["Knowledge Graphs", "Responsible AI", "Decision Intelligence"],
  },
  {
    domain: "iot embedded systems electronics",
    journals: ["IEEE Internet of Things Journal", "Microprocessors and Microsystems", "Sensors"],
    conferences: ["IEEE IoTDI", "IEEE ICC", "ACM/IEEE IPSN"],
    researchDomains: ["Edge Intelligence", "Sensor Fusion", "Low-power Embedded AI"],
  },
  {
    domain: "mechanical manufacturing materials",
    journals: ["Journal of Manufacturing Processes", "Materials Today: Proceedings", "International Journal of Advanced Manufacturing Technology"],
    conferences: ["ICMPC", "ICME", "ASME IMECE"],
    researchDomains: ["Smart Manufacturing", "Sustainable Materials", "Digital Twin in Manufacturing"],
  },
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "from",
  "this",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "using",
  "into",
  "their",
  "about",
  "between",
  "through",
  "based",
  "study",
  "analysis",
  "approach",
  "method",
  "paper",
  "research",
]);

const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";

const openAIEnabled = () => Boolean(process.env.OPENAI_API_KEY);
const geminiEnabled = () => Boolean(process.env.GEMINI_API_KEY);

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && token.length > 2 && !STOP_WORDS.has(token));

const frequencyKeywords = (text, topN = 12) => {
  const freq = {};
  tokenize(text).forEach((token) => {
    freq[token] = (freq[token] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([token]) => token);
};

const firstSentences = (text, count = 4) => {
  const sentences = String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  return sentences.slice(0, count).join(" ");
};

const buildFallbackSummary = (text) => {
  const snippet = firstSentences(text, 5);
  const keywords = frequencyKeywords(text, 10);
  return {
    abstractSummary: snippet || "Summary unavailable. Please provide richer text content.",
    keyFindings: firstSentences(text, 3) || "Key findings unavailable.",
    keywords,
    contributionSummary: `The work contributes to ${keywords.slice(0, 3).join(", ") || "the selected domain"} with focus on practical and research outcomes.`,
  };
};

const resolveProviderOrder = async () => {
  const config = await getAIProviderConfig();
  const mode = config?.mode || "auto";
  const preferred = config?.preferredProvider || "openai";

  if (mode === "gemini") return ["gemini", "openai"];
  if (mode === "openai") return ["openai", "gemini"];

  return preferred === "gemini" ? ["gemini", "openai"] : ["openai", "gemini"];
};

const callOpenAIChatJson = async (systemPrompt, userPrompt) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI chat error: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
};

const callOpenAIText = async (systemPrompt, userPrompt) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI chat error: ${response.status} ${text}`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content || "";
};

const callOpenAIEmbedding = async (text) => {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: String(text || "").slice(0, 7000),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding error: ${response.status} ${err}`);
  }

  const payload = await response.json();
  return payload.data?.[0]?.embedding || null;
};

const callGeminiJson = async (systemPrompt, userPrompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nReturn JSON only.\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini error: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned || "{}");
};

const callGeminiText = async (systemPrompt, userPrompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.3 },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini error: ${response.status} ${text}`);
  }

  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const callGeminiEmbedding = async (text) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: String(text || "").slice(0, 7000) }] } }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini embedding error: ${response.status} ${err}`);
  }

  const payload = await response.json();
  return payload.embedding?.values || null;
};

const callProviderJson = async (provider, systemPrompt, userPrompt) => {
  if (provider === "gemini") return callGeminiJson(systemPrompt, userPrompt);
  return callOpenAIChatJson(systemPrompt, userPrompt);
};

const callProviderText = async (provider, systemPrompt, userPrompt) => {
  if (provider === "gemini") return callGeminiText(systemPrompt, userPrompt);
  return callOpenAIText(systemPrompt, userPrompt);
};

const callProviderEmbedding = async (provider, text) => {
  if (provider === "gemini") return callGeminiEmbedding(text);
  return callOpenAIEmbedding(text);
};

const providerEnabled = (provider) => (provider === "gemini" ? geminiEnabled() : openAIEnabled());

const callLLMJson = async (systemPrompt, userPrompt) => {
  const order = await resolveProviderOrder();
  let lastError = null;

  for (const provider of order) {
    if (!providerEnabled(provider)) continue;
    try {
      return await callProviderJson(provider, systemPrompt, userPrompt);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return null;
};

const callLLMText = async (systemPrompt, userPrompt) => {
  const order = await resolveProviderOrder();
  let lastError = null;

  for (const provider of order) {
    if (!providerEnabled(provider)) continue;
    try {
      return await callProviderText(provider, systemPrompt, userPrompt);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return null;
};

const createEmbedding = async (text) => {
  const order = await resolveProviderOrder();
  let lastError = null;

  for (const provider of order) {
    if (!providerEnabled(provider)) continue;
    try {
      return await callProviderEmbedding(provider, text);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return null;
};

const cosineSimilarity = (a = [], b = []) => {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const keywordMatchScore = (query, text) => {
  const q = tokenize(query);
  const t = tokenize(text);
  if (!q.length || !t.length) return 0;
  const tSet = new Set(t);
  const overlap = q.filter((w) => tSet.has(w)).length;
  return overlap / q.length;
};

const extractTextFromPdf = async (filePath) => {
  const pdfParse = require("pdf-parse");
  const buffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(buffer);
  return parsed.text || "";
};

const extractTextWithOcr = async (filePath) => {
  try {
    const { createWorker } = require("tesseract.js");
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(filePath);
    await worker.terminate();
    return data?.text || "";
  } catch (_error) {
    return "";
  }
};

const generateResearchSummary = async (text) => {
  const clippedText = String(text || "").slice(0, 18000);

  try {
    const aiResult = await callLLMJson(
      "You generate concise structured research insights for universities.",
      `Analyze the research text and return JSON with keys: abstractSummary, keyFindings, keywords (array), contributionSummary. Text: ${clippedText}`
    );
    if (aiResult?.abstractSummary) {
      return {
        abstractSummary: aiResult.abstractSummary,
        keyFindings: aiResult.keyFindings,
        keywords: Array.isArray(aiResult.keywords) ? aiResult.keywords : frequencyKeywords(clippedText, 10),
        contributionSummary: aiResult.contributionSummary || "Contribution summary unavailable.",
      };
    }
  } catch (_error) {
    // fallback below
  }

  return buildFallbackSummary(clippedText);
};

const getPublicationRecommendations = async (researchArea) => {
  const area = String(researchArea || "").toLowerCase();
  const ranked = JOURNAL_CONFERENCE_MAP.map((bucket) => ({
    bucket,
    score: keywordMatchScore(area, bucket.domain),
  })).sort((a, b) => b.score - a.score);

  const selected = ranked[0]?.score ? ranked[0].bucket : JOURNAL_CONFERENCE_MAP[0];

  try {
    const aiResult = await callLLMJson(
      "You suggest realistic publication venues for academic researchers.",
      `Research area: ${researchArea}. Return JSON with journals (array), conferences (array), domains (array).`
    );

    if (aiResult?.journals?.length) {
      return {
        journals: aiResult.journals,
        conferences: aiResult.conferences || [],
        researchDomains: aiResult.domains || [],
      };
    }
  } catch (_error) {
    // fallback below
  }

  return {
    journals: selected.journals,
    conferences: selected.conferences,
    researchDomains: selected.researchDomains,
  };
};

const analyzeTrends = (publications = []) => {
  const topicFrequency = {};
  const yearTopicCounts = {};

  publications.forEach((pub) => {
    const year = pub.publicationYear || new Date(pub.createdAt || Date.now()).getFullYear();
    const keywords = [
      ...(pub.aiKeywords || []),
      ...frequencyKeywords(`${pub.title || ""} ${pub.journalOrConferenceName || ""}`, 5),
    ];

    if (!yearTopicCounts[year]) yearTopicCounts[year] = {};

    keywords.forEach((keyword) => {
      topicFrequency[keyword] = (topicFrequency[keyword] || 0) + 1;
      yearTopicCounts[year][keyword] = (yearTopicCounts[year][keyword] || 0) + 1;
    });
  });

  const trendingTopics = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([topic, count]) => ({ topic, count }));

  const topicGrowth = Object.entries(yearTopicCounts)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, topicMap]) => ({
      year: Number(year),
      totalTopics: Object.values(topicMap).reduce((sum, val) => sum + val, 0),
      topTopic: Object.entries(topicMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
    }));

  return { trendingTopics, topicGrowth };
};

const analyzeCitationInsights = (publications = []) => {
  const highImpactPublications = publications
    .map((pub) => {
      const citationCount = pub.citationCount || 0;
      const impactFactor = pub.impactFactor || 0;
      const publicationYear = pub.publicationYear || new Date(pub.createdAt || Date.now()).getFullYear();
      const age = Math.max(new Date().getFullYear() - publicationYear, 1);
      const yearlyGrowth = citationCount / age;
      const predictedNextYear = Math.round(citationCount + yearlyGrowth * 1.15);
      const impactScore = Math.round(citationCount * 0.7 + impactFactor * 8);

      return {
        publicationId: pub._id,
        title: pub.title,
        citationCount,
        impactFactor,
        yearlyGrowth: Number(yearlyGrowth.toFixed(2)),
        predictedNextYear,
        impactScore,
      };
    })
    .sort((a, b) => b.impactScore - a.impactScore);

  const avgCitation =
    highImpactPublications.reduce((sum, pub) => sum + pub.citationCount, 0) /
    Math.max(highImpactPublications.length, 1);

  return {
    averageCitation: Number(avgCitation.toFixed(2)),
    citationGrowthForecast: highImpactPublications.map((pub) => ({
      title: pub.title,
      current: pub.citationCount,
      predictedNextYear: pub.predictedNextYear,
    })),
    highImpactPublications: highImpactPublications.slice(0, 10),
  };
};

const smartSearchFallback = (query, documents) => {
  return documents
    .map((doc) => ({
      ...doc,
      score: keywordMatchScore(query, `${doc.title || ""} ${doc.content || ""}`),
    }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score);
};

const generateProposalDraft = async ({ title, domain, objectiveHint, grantType }) => {
  const fallback = {
    proposalTitle: title || `Research Proposal on ${domain || "Emerging Domain"}`,
    objectives: [
      `Investigate core challenges in ${domain || "the selected domain"}`,
      "Design a measurable solution framework",
      "Validate outcomes through experiments or field evaluation",
    ],
    literatureReviewOutline: [
      "Foundational theories and current state-of-the-art",
      "Gaps in existing studies",
      "Proposed novelty and expected contribution",
    ],
    methodology: "Mixed-method approach including data collection, model/experiment design, and impact evaluation.",
    expectedOutcomes: ["Scholarly publications", "Prototype or implementation artifact", "Policy/industry impact report"],
    grantAlignment: `Aligned for ${grantType || "institutional/disciplinary"} grant submission.`,
  };

  try {
    const aiResult = await callLLMJson(
      "You are a grant writing assistant for higher education research teams.",
      `Create a structured research proposal draft in JSON with keys proposalTitle, objectives (array), literatureReviewOutline (array), methodology, expectedOutcomes (array), grantAlignment. Inputs: title=${title}; domain=${domain}; objectiveHint=${objectiveHint}; grantType=${grantType}`
    );
    if (aiResult?.proposalTitle) return aiResult;
  } catch (_error) {
    // fallback below
  }

  return fallback;
};

const buildAssistantResponse = async ({ question, role }) => {
  const fallback = (() => {
    const q = String(question || "").toLowerCase();

    if (q.includes("submit") && q.includes("publication")) {
      return "Go to Publications, click Add New, fill title/type/year/indexing, upload PDF, and submit. It enters approval workflow automatically.";
    }

    if (q.includes("report")) {
      return "Open Reports, choose report type and format (PDF/Excel), then click Generate. You can download from the generated report list.";
    }

    if (q.includes("dashboard")) {
      return "Dashboard cards show core KPIs. Use charts for year-wise publication trends, department output, and faculty ranking insights.";
    }

    return "I can help with publication submissions, approvals, report generation, research planning, and analytics interpretation inside FRMS.";
  })();

  try {
    const aiText = await callLLMText(
      "You are a concise in-app assistant for Faculty Research Management System users.",
      `User role: ${role}. Question: ${question}`
    );

    return aiText || fallback;
  } catch (_error) {
    return fallback;
  }
};

const predictScore = ({ currentScore, publications = [], patents = [], projects = [], grants = [] }) => {
  const base = Number(currentScore || 0);
  const publicationVelocity = publications.length * 8;
  const patentVelocity = patents.length * 12;
  const projectVelocity = projects.length * 10;
  const grantVelocity = grants.length * 9;

  const nextYear = Math.round(base + publicationVelocity + patentVelocity + projectVelocity + grantVelocity);
  const twoYear = Math.round(nextYear + publicationVelocity * 0.9 + patentVelocity * 0.9 + projectVelocity * 0.8);

  return {
    currentScore: base,
    predictedNextYearScore: nextYear,
    predictedTwoYearScore: twoYear,
    performanceTrend: twoYear > base ? "upward" : "stable",
  };
};

module.exports = {
  frequencyKeywords,
  buildFallbackSummary,
  generateResearchSummary,
  getPublicationRecommendations,
  analyzeTrends,
  analyzeCitationInsights,
  createEmbedding,
  cosineSimilarity,
  smartSearchFallback,
  generateProposalDraft,
  buildAssistantResponse,
  predictScore,
  extractTextFromPdf,
  extractTextWithOcr,
  keywordMatchScore,
};
