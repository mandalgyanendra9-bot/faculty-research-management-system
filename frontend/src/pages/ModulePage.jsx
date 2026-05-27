import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import { moduleConfig } from "../config";
import DataTable from "../components/ui/DataTable";
import Modal from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";

const getInitialForm = (fields) =>
  fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

const ModulePage = ({ moduleKey }) => {
  const { user } = useAuth();
  const config = useMemo(() => moduleConfig[moduleKey], [moduleKey]);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState(getInitialForm(config.fields));
  const [file, setFile] = useState(null);

  const loadRows = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/${config.endpoint}`, {
        params: {
          search,
          mine: user?.role === "faculty" ? "true" : undefined,
        },
      });
      setRows(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to fetch ${config.label}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  const openAdd = () => {
    setEditingRow(null);
    setForm(getInitialForm(config.fields));
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    const populated = config.fields.reduce((acc, field) => {
      if (Array.isArray(row[field.name])) {
        acc[field.name] = row[field.name].join(", ");
      } else {
        acc[field.name] = row[field.name] ?? "";
      }
      return acc;
    }, {});

    setEditingRow(row);
    setForm(populated);
    setFile(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      config.fields.forEach((field) => {
        if (field.name === "file") return;
        const value = form[field.name];
        if (value !== "" && value !== null && value !== undefined) {
          if (["authors", "coInvestigators", "inventors", "areaOfExpertise", "researchInterests"].includes(field.name)) {
            payload.append(field.name, value.split(",").map((x) => x.trim()));
          } else {
            payload.append(field.name, value);
          }
        }
      });

      if (file) payload.append(config.fileField, file);

      if (editingRow) {
        await api.put(`/${config.endpoint}/${editingRow._id}`, payload);
        toast.success(`${config.label} updated`);
      } else {
        await api.post(`/${config.endpoint}`, payload);
        toast.success(`${config.label} submitted`);
      }

      setModalOpen(false);
      loadRows();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to save ${config.label}`);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await api.delete(`/${config.endpoint}/${row._id}`);
      toast.success("Deleted");
      loadRows();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">{config.label}</h2>
          <p className="text-sm text-slate-500">Add, manage, and track approval status</p>
        </div>

        <div className="flex gap-2">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm" onClick={loadRows}>
            Filter
          </button>
          <button className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white" onClick={openAdd}>
            Add New
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <DataTable columns={config.columns} rows={rows} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {modalOpen ? (
        <Modal title={`${editingRow ? "Edit" : "Add"} ${config.label}`} onClose={() => setModalOpen(false)}>
          <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSave}>
            {config.fields.map((field) => (
              <div key={field.name} className={field.type === "file" ? "md:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium">{field.label}</label>
                {field.type === "select" ? (
                  <select
                    className="w-full rounded-lg border px-3 py-2"
                    value={form[field.name]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                  >
                    <option value="">Select</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "file" ? (
                  <input
                    type="file"
                    className="w-full rounded-lg border px-3 py-2"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    className="w-full rounded-lg border px-3 py-2"
                    value={form[field.name]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <div className="md:col-span-2">
              <button className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white">
                {editingRow ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default ModulePage;
