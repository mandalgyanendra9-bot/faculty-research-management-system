import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import ProfileAvatar from "../components/ui/ProfileAvatar";
import { roleLabels } from "../config";

const formatFileSize = (bytes = 0) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
};

const FacultyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    employeeId: "",
    qualification: "",
    areaOfExpertise: "",
    googleScholarId: "",
    orcidId: "",
    scopusId: "",
    researchInterests: "",
    bio: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  const storedPhotoUrl = profile?.profilePhotoUrl || profile?.profileImageUrl || "";
  const activePhotoUrl = photoPreviewUrl || storedPhotoUrl;
  const selectedPhotoInfo = useMemo(
    () =>
      photo
        ? {
            name: photo.name,
            sizeLabel: formatFileSize(photo.size),
          }
        : null,
    [photo]
  );

  useEffect(() => {
    if (!photo) {
      setPhotoPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/faculty/me");
      const p = data.data;
      setProfile(p);
      setForm({
        employeeId: p.employeeId || "",
        qualification: p.qualification || "",
        areaOfExpertise: (p.areaOfExpertise || []).join(", "),
        googleScholarId: p.googleScholarId || "",
        orcidId: p.orcidId || "",
        scopusId: p.scopusId || "",
        researchInterests: (p.researchInterests || []).join(", "),
        bio: p.bio || "",
      });
    } catch (_error) {
      setProfile(null);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("employeeId", form.employeeId);
    payload.append("qualification", form.qualification);
    payload.append("areaOfExpertise", form.areaOfExpertise.split(",").map((x) => x.trim()));
    payload.append("googleScholarId", form.googleScholarId);
    payload.append("orcidId", form.orcidId);
    payload.append("scopusId", form.scopusId);
    payload.append("researchInterests", form.researchInterests.split(",").map((x) => x.trim()));
    payload.append("bio", form.bio);
    if (photo) payload.append("profilePhoto", photo);

    try {
      await api.put("/faculty/me", payload);
      toast.success("Profile updated");
      setPhoto(null);
      setPhotoPreviewUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center">
        <ProfileAvatar
          name={profile?.user?.name}
          photoUrl={activePhotoUrl}
          className="h-20 w-20 shrink-0"
          textClassName="text-lg"
        />
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-slate-900 dark:text-slate-100">Faculty Profile</h2>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{profile?.user?.name || "No profile loaded"}</p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{profile?.user?.email || "-"}</p>
          <p className="truncate text-xs font-medium uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
            {roleLabels[profile?.user?.role] || profile?.user?.role || "-"}
          </p>
        </div>
      </div>

      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" encType="multipart/form-data" onSubmit={saveProfile}>
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className={key === "bio" ? "md:col-span-2" : ""}>
            <label className="mb-1 block text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</label>
            {key === "bio" ? (
              <textarea
                className="w-full rounded-lg border px-3 py-2"
                rows={3}
                value={value}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            ) : (
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={value}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Profile Photo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
              </div>

              {selectedPhotoInfo ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Selected image</p>
                  <p className="mt-1 truncate text-slate-600 dark:text-slate-300">{selectedPhotoInfo.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPhotoInfo.sizeLabel}</p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreviewUrl("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Clear selected image
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your current uploaded photo stays visible until you choose a new image.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-900">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Preview
              </p>
              <ProfileAvatar
                name={profile?.user?.name}
                photoUrl={activePhotoUrl}
                className="h-28 w-28"
                textClassName="text-xl"
              />
              <p className="mt-2 max-w-[11rem] truncate text-center text-xs text-slate-500 dark:text-slate-400">
                {selectedPhotoInfo ? "New image preview" : storedPhotoUrl ? "Current uploaded photo" : "No photo uploaded yet"}
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-white">Save Profile</button>
        </div>
      </form>

      {profile?.autoGeneratedResearchProfile ? (
        <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
          <p className="font-medium">Auto-generated Faculty Research Profile</p>
          <p>{profile.autoGeneratedResearchProfile}</p>
        </div>
      ) : null}
    </div>
  );
};

export default FacultyProfilePage;
