// Utility for dynamic imports and code splitting

export const dynamicImport = {
  // Analytics components
  AnalyticsCharts: () =>
    import("@/components/dashboard/charts").then((mod) => mod.AnalyticsCharts),

  // Documentation components
  DocumentationContent: () =>
    import("@/components/dashboard/documentation").then(
      (mod) => mod.DocumentationContent
    ),

  // Integration components
  IntegrationManager: () =>
    import("@/components/dashboard/integration").then(
      (mod) => mod.IntegrationManager
    ),

  // Third-party heavy components
  LottiePlayer: () =>
    import("@lottiefiles/react-lottie-player").then((mod) => ({
      default: mod.Player,
    })),

  // Data visualization components
  DataTable: () =>
    import("@/components/ui/data-table").then((mod) => mod.DataTable),

  // Form components with validation
  FormWithValidation: () =>
    import("@/components/ui/form-validation").then(
      (mod) => mod.FormWithValidation
    ),

  // Rich text editor
  RichTextEditor: () =>
    import("@/components/ui/rich-text-editor").then(
      (mod) => mod.RichTextEditor
    ),

  // File upload component
  FileUploader: () =>
    import("@/components/ui/file-uploader").then((mod) => mod.FileUploader),

  // Dashboard widgets
  DashboardWidgets: () =>
    import("@/components/dashboard/widgets").then(
      (mod) => mod.DashboardWidgets
    ),
};