import { useEffect, useMemo, useState } from "react";
import { toBackendFileUrl } from "../../config/api";

const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const ProfileAvatar = ({ name = "", photoUrl = "", className = "h-12 w-12", textClassName = "text-sm" }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolvedUrl = useMemo(() => (photoUrl ? toBackendFileUrl(photoUrl) : ""), [photoUrl]);

  useEffect(() => {
    setLoadFailed(false);
  }, [resolvedUrl]);

  return (
    <div
      className={`${className} grid place-items-center overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-brand-100 via-slate-100 to-brand-200 font-semibold text-brand-800 dark:border-slate-700 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 dark:text-brand-100`}
    >
      {resolvedUrl && !loadFailed ? (
        <img
          src={resolvedUrl}
          alt={name ? `${name} profile photo` : "Profile photo"}
          className="h-full w-full object-cover"
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <span className={textClassName}>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default ProfileAvatar;
