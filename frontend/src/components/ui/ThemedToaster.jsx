import { Toaster } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

const ThemedToaster = () => {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: isDark ? "#0f172a" : "#ffffff",
          color: isDark ? "#e2e8f0" : "#1f2937",
          border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
          boxShadow: isDark
            ? "0 10px 30px rgba(2, 6, 23, 0.55)"
            : "0 10px 30px rgba(15, 23, 42, 0.12)",
        },
        success: {
          iconTheme: {
            primary: "#059669",
            secondary: "#ecfdf5",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fff1f2",
          },
        },
      }}
    />
  );
};

export default ThemedToaster;
