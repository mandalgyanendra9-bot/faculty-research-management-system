import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const AIModulePage = () => {
  const { user } = useAuth();
  const isReviewer = useMemo(
    () => ["super_admin", "admin", "hod_dean", "research_coordinator"].includes(user?.role),
    [user?.role]
  );

  const [summaryFile, setSummaryFile] = useState(null);
  const [summaryTitle, setSummaryTitle] = useState("");
  const [summaryResult, setSummaryResult] = useState(null);

  const [researchArea, setResearchArea] = useState("");
  const [recommendation, setRecommendation] = useState(null);

  const [trendData, setTrendData] = useState(null);
  const [citationData, setCitationData] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [publications, setPublications] = useState([]);
  const [plagForm, setPlagForm] = useState({ publicationId: "", similarityPercentage: "", notes: "" });
  const [plagFile, setPlagFile] = useState(null);

  const [proposalForm, setProposalForm] = useState({ title: "", domain: "", objectiveHint: "", grantType: "" });
  const [proposal, setProposal] = useState(null);

  const [cvFilePath, setCvFilePath] = useState("");

  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");

  const [scorePrediction, setScorePrediction] = useState(null);

  const [ocrFile, setOcrFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);

  useEffect(() => {
    api
      .get("/publications", { params: { mine: user?.role === "faculty" ? "true" : undefined } })
      .then((res) => setPublications(res.data.data || []))
      .catch(() => setPublications([]));
  }, [user?.role]);

  const submitSummary = async (e) => {
    e.preventDefault();
    if (!summaryFile) return toast.error("Please upload a PDF paper");

    try {
      const fd = new FormData();
      fd.append("paper", summaryFile);
      if (summaryTitle) fd.append("title", summaryTitle);
      const { data } = await api.post("/ai/research-summary", fd);
      setSummaryResult(data.data);
      toast.success("AI summary generated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Summary generation failed");
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await api.post("/ai/publication-recommendation", { researchArea });
      setRecommendation(data.data);
      toast.success("Recommendations ready");
    } catch (error) {
      toast.error(error.response?.data?.message || "Recommendation failed");
    }
  };

  const fetchTrends = async () => {
    try {
      const { data } = await api.get("/ai/trend-analysis");
      setTrendData(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Trend fetch failed");
    }
  };

  const fetchCitations = async () => {
    try {
      const { data } = await api.get("/ai/citation-insights");
      setCitationData(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Citation insights failed");
    }
  };

  const runSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const { data } = await api.post("/ai/smart-search", { query: searchQuery });
      setSearchResults(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Smart search failed");
    }
  };

  const submitPlagiarism = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("publicationId", plagForm.publicationId);
      fd.append("similarityPercentage", plagForm.similarityPercentage);
      if (plagForm.notes) fd.append("notes", plagForm.notes);
      if (plagFile) fd.append("report", plagFile);
      const { data } = await api.post("/ai/plagiarism", fd);
      toast.success(data.message || "Plagiarism report uploaded");
      setPlagForm({ publicationId: "", similarityPercentage: "", notes: "" });
      setPlagFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Plagiarism upload failed");
    }
  };

  const generateProposal = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/ai/proposal-assistant", proposalForm);
      setProposal(data.data);
      toast.success("Proposal draft generated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Proposal generation failed");
    }
  };

  const generateCv = async () => {
    try {
      const { data } = await api.get("/ai/faculty-cv");
      setCvFilePath(data.data.filePath);
      toast.success("Faculty CV generated");
    } catch (error) {
      toast.error(error.response?.data?.message || "CV generation failed");
    }
  };

  const askChat = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;
    try {
      const { data } = await api.post("/ai/chat", { question: chatQuestion });
      setChatAnswer(data.data.answer || "");
    } catch (error) {
      toast.error(error.response?.data?.message || "Chat request failed");
    }
  };

  const fetchScorePrediction = async () => {
    try {
      const { data } = await api.post("/ai/score-prediction", {});
      setScorePrediction(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Score prediction failed");
    }
  };

  const submitOcr = async (e) => {
    e.preventDefault();
    if (!ocrFile) return toast.error("Please upload a document/image");
    try {
      const fd = new FormData();
      fd.append("document", ocrFile);
      const { data } = await api.post("/ai/ocr", fd);
      setOcrData(data.data);
      toast.success("OCR processed");
    } catch (error) {
      toast.error(error.response?.data?.message || "OCR failed");
    }
  };

  const syncSemantic = async () => {
    try {
      await api.post("/ai/semantic-index/sync");
      toast.success("Semantic index synchronized");
    } catch (error) {
      toast.error(error.response?.data?.message || "Semantic sync failed");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">AI Research Intelligence Suite</h2>
        <p className="text-sm text-slate-500">Advanced AI support for summary, recommendations, trends, citations, search, plagiarism, CV, OCR, and forecasting.</p>
      </div>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">1. AI Research Summary (PDF)</h3>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={submitSummary}>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Paper Title (optional)"
            value={summaryTitle}
            onChange={(e) => setSummaryTitle(e.target.value)}
          />
          <input type="file" accept=".pdf" className="rounded-lg border px-3 py-2" onChange={(e) => setSummaryFile(e.target.files?.[0] || null)} />
          <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Generate Summary</button>
        </form>
        {summaryResult ? (
          <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
            <p><span className="font-semibold">Abstract:</span> {summaryResult.abstractSummary}</p>
            <p><span className="font-semibold">Key Findings:</span> {summaryResult.keyFindings}</p>
            <p><span className="font-semibold">Keywords:</span> {(summaryResult.keywords || []).join(", ")}</p>
            <p><span className="font-semibold">Contribution:</span> {summaryResult.contributionSummary}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">2. AI Publication Recommendation</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border px-3 py-2 md:col-span-2"
            placeholder="Research area (e.g., AI in healthcare)"
            value={researchArea}
            onChange={(e) => setResearchArea(e.target.value)}
          />
          <button className="rounded-lg bg-brand-600 px-3 py-2 text-white" onClick={fetchRecommendations}>Get Suggestions</button>
        </div>
        {recommendation ? (
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
            <CardList title="Journals" items={recommendation.journals || []} />
            <CardList title="Conferences" items={recommendation.conferences || []} />
            <CardList title="Domains" items={recommendation.researchDomains || []} />
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">3. AI Research Trend Analysis</h3>
        <div className="mb-3 flex gap-2">
          <button className="rounded bg-brand-600 px-3 py-2 text-sm text-white" onClick={fetchTrends}>Analyze Trends</button>
          {isReviewer ? <button className="rounded bg-slate-100 px-3 py-2 text-sm" onClick={syncSemantic}>Sync Semantic Index</button> : null}
        </div>
        {trendData ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-64 rounded-lg bg-slate-50 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData.trendingTopics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64 rounded-lg bg-slate-50 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.topicGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="totalTopics" stroke="#1d4ed8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">4. AI Citation Insights</h3>
        <button className="rounded bg-brand-600 px-3 py-2 text-sm text-white" onClick={fetchCitations}>Run Citation Analytics</button>
        {citationData ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm">Average Citation: <span className="font-semibold">{citationData.averageCitation}</span></p>
            <div className="h-64 rounded-lg bg-slate-50 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={citationData.citationGrowthForecast || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" hide />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="current" stroke="#0f766e" />
                  <Line type="monotone" dataKey="predictedNextYear" stroke="#b91c1c" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">5. AI Smart Search (Semantic)</h3>
        <div className="grid gap-2 md:grid-cols-4">
          <input
            className="rounded-lg border px-3 py-2 md:col-span-3"
            placeholder='Try: "AI papers on healthcare"'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="rounded-lg bg-brand-600 px-3 py-2 text-white" onClick={runSmartSearch}>Search</button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {searchResults.map((item, idx) => (
            <div key={`${item.sourceType}-${item.sourceId}-${idx}`} className="rounded border p-2">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-slate-500">{item.sourceType} | score: {item.score}</p>
              <p className="text-xs text-slate-600">{(item.keywords || []).join(", ")}</p>
            </div>
          ))}
          {!searchResults.length ? <p className="text-slate-500">No semantic results yet.</p> : null}
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">6. AI Plagiarism Support</h3>
        <form className="grid gap-2 md:grid-cols-4" onSubmit={submitPlagiarism}>
          <select
            className="rounded-lg border px-3 py-2"
            value={plagForm.publicationId}
            onChange={(e) => setPlagForm((p) => ({ ...p, publicationId: e.target.value }))}
            required
          >
            <option value="">Select publication</option>
            {publications.map((pub) => (
              <option key={pub._id} value={pub._id}>{pub.title}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            max="100"
            className="rounded-lg border px-3 py-2"
            placeholder="Similarity %"
            value={plagForm.similarityPercentage}
            onChange={(e) => setPlagForm((p) => ({ ...p, similarityPercentage: e.target.value }))}
            required
          />
          <input
            type="file"
            className="rounded-lg border px-3 py-2"
            onChange={(e) => setPlagFile(e.target.files?.[0] || null)}
          />
          <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Upload</button>
          <input
            className="rounded-lg border px-3 py-2 md:col-span-4"
            placeholder="Notes (optional)"
            value={plagForm.notes}
            onChange={(e) => setPlagForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </form>
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">7. AI Proposal Assistant</h3>
        <form className="grid gap-2 md:grid-cols-2" onSubmit={generateProposal}>
          {Object.keys(proposalForm).map((key) => (
            <input
              key={key}
              className="rounded-lg border px-3 py-2"
              placeholder={key}
              value={proposalForm[key]}
              onChange={(e) => setProposalForm((p) => ({ ...p, [key]: e.target.value }))}
            />
          ))}
          <button className="rounded-lg bg-brand-600 px-3 py-2 text-white md:col-span-2">Generate Proposal Draft</button>
        </form>
        {proposal ? (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="font-semibold">{proposal.proposalTitle}</p>
            <p className="mt-2"><span className="font-semibold">Methodology:</span> {proposal.methodology}</p>
            <p className="mt-2"><span className="font-semibold">Objectives:</span> {(proposal.objectives || []).join("; ")}</p>
            <p className="mt-2"><span className="font-semibold">Literature Outline:</span> {(proposal.literatureReviewOutline || []).join("; ")}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">8. AI Auto-Generated Faculty CV</h3>
        <button className="rounded bg-brand-600 px-3 py-2 text-sm text-white" onClick={generateCv}>Generate CV PDF</button>
        {cvFilePath ? (
          <p className="mt-2 text-sm">
            CV ready: <a className="text-brand-700 underline" href={`${import.meta.env.VITE_API_ROOT || "http://localhost:5000"}${cvFilePath}`} target="_blank" rel="noreferrer">Open PDF</a>
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">9. AI Chat Assistant</h3>
        <form className="grid gap-2 md:grid-cols-4" onSubmit={askChat}>
          <input
            className="rounded-lg border px-3 py-2 md:col-span-3"
            placeholder="Ask: How to submit publication?"
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
          />
          <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Ask</button>
        </form>
        {chatAnswer ? <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">{chatAnswer}</p> : null}
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">10. AI Research Score Prediction</h3>
        <button className="rounded bg-brand-600 px-3 py-2 text-sm text-white" onClick={fetchScorePrediction}>Predict Score</button>
        {scorePrediction?.facultyPrediction ? (
          <div className="mt-3 grid gap-2 md:grid-cols-3 text-sm">
            <MiniStat label="Current" value={scorePrediction.facultyPrediction.currentScore} />
            <MiniStat label="Next Year" value={scorePrediction.facultyPrediction.predictedNextYearScore} />
            <MiniStat label="Two Years" value={scorePrediction.facultyPrediction.predictedTwoYearScore} />
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">11. AI OCR Document Reading</h3>
        <form className="grid gap-2 md:grid-cols-3" onSubmit={submitOcr}>
          <input type="file" className="rounded-lg border px-3 py-2 md:col-span-2" onChange={(e) => setOcrFile(e.target.files?.[0] || null)} />
          <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Extract Text</button>
        </form>
        {ocrData ? (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="font-semibold">Auto-fill Hints</p>
            <p>Title: {ocrData.autoFill?.titleHint || "-"}</p>
            <p>Reference: {ocrData.autoFill?.referenceNumberHint || "-"}</p>
            <p>Date: {ocrData.autoFill?.dateHint || "-"}</p>
            <p className="mt-2 text-xs text-slate-600">Extracted text preview:</p>
            <p className="text-xs text-slate-700">{(ocrData.extractedText || "").slice(0, 1000)}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
};

const CardList = ({ title, items }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="mb-2 font-semibold text-slate-700">{title}</p>
    <ul className="space-y-1 text-sm">
      {items.map((item, idx) => (
        <li key={`${title}-${idx}`}>- {item}</li>
      ))}
    </ul>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-xl font-semibold text-brand-700">{value}</p>
  </div>
);

export default AIModulePage;
