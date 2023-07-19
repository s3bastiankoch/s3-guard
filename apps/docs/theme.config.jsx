import { Shield } from "lucide-react";

export default {
  project: {},
  darkMode: false,
  nextThemes: {
    forcedTheme: "dark",
  },

  footer: { component: null },
  feedback: { content: null },

  editLink: {
    text: "Edit this page on GitHub →",
    component: ({ children, className, filePath }) => (
      <a href={`/${filePath}`} className={className}>
        {children}
      </a>
    ),
  },

  gitTimestamp: null,
  useNextSeoProps() {
    return {
      titleTemplate: "%s – S3 Guard",
    };
  },

  logo: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        fontSize: "16px",
      }}
    >
      <Shield fill="white" size={14} />
      <span>S3 Guard</span>
    </div>
  ),
};
