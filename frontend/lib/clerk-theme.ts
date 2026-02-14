export const clerkTheme = {
  baseTheme: undefined,
  variables: {
    colorPrimary: "#14347F",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#F8FAFC",
    colorInputText: "#0B1220",
    colorNeutral: "#64748B",
    colorDanger: "#DC2626",
    colorSuccess: "#16A34A",
    colorWarning: "#F59E0B",
    borderRadius: "12px",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    card: {
      boxShadow: "none",
      border: "1px solid #E2E8F0",
      borderRadius: "16px",
      padding: "32px",
    },
    headerTitle: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#0B1220",
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "#64748B",
    },
    formButtonPrimary: {
      backgroundColor: "#FFB800",
      color: "#0D1E52",
      fontSize: "14px",
      fontWeight: "600",
      padding: "12px 16px",
      borderRadius: "12px",
      "&:hover": {
        backgroundColor: "#FFC52B",
      },
      "&:focus": {
        boxShadow: "0 0 0 2px #00A9E6",
      },
      "&:active": {
        backgroundColor: "#D99500",
      },
    },
    formButtonSecondary: {
      backgroundColor: "#F1F5F9",
      color: "#0B1220",
      fontSize: "14px",
      fontWeight: "600",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
      "&:hover": {
        backgroundColor: "#E2E8F0",
      },
    },
    formFieldInput: {
      fontSize: "14px",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
      backgroundColor: "#FFFFFF",
      "&:focus": {
        borderColor: "#00A9E6",
        boxShadow: "0 0 0 2px rgba(0, 169, 230, 0.2)",
      },
    },
    formFieldLabel: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#0B1220",
      marginBottom: "8px",
    },
    formFieldAction: {
      color: "#00A9E6",
      fontSize: "13px",
      fontWeight: "600",
      "&:hover": {
        color: "#2FC6FF",
      },
    },
    footerActionLink: {
      color: "#00A9E6",
      fontWeight: "600",
      "&:hover": {
        color: "#2FC6FF",
      },
    },
    footerActionText: {
      fontSize: "14px",
      color: "#64748B",
    },
    dividerLine: {
      backgroundColor: "#E2E8F0",
    },
    dividerText: {
      color: "#64748B",
      fontSize: "13px",
    },
    socialButtonsBlockButton: {
      backgroundColor: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: "12px",
      padding: "12px 16px",
      "&:hover": {
        backgroundColor: "#F8FAFC",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#0B1220",
      fontWeight: "600",
    },
    identityPreview: {
      backgroundColor: "#F8FAFC",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
    },
    formFieldInfoText: {
      fontSize: "13px",
      color: "#64748B",
    },
    alert: {
      borderRadius: "12px",
      fontSize: "14px",
    },
    formResendCodeLink: {
      color: "#00A9E6",
      fontWeight: "600",
    },
    otpCodeFieldInput: {
      borderRadius: "10px",
      border: "1px solid #E2E8F0",
      fontSize: "20px",
      fontWeight: "600",
      "&:focus": {
        borderColor: "#00A9E6",
        boxShadow: "0 0 0 2px rgba(0, 169, 230, 0.2)",
      },
    },
  },
} as const;

export const clerkThemeDark = {
  ...clerkTheme,
  variables: {
    ...clerkTheme.variables,
    colorPrimary: "#FFB800",
    colorBackground: "#0D1E52",
    colorInputBackground: "#112768",
    colorInputText: "#F8FAFC",
    colorNeutral: "#CBD5E1",
  },
  elements: {
    ...clerkTheme.elements,
    card: {
      ...clerkTheme.elements.card,
      border: "1px solid #1E3FAF",
      backgroundColor: "#112768",
    },
    headerTitle: {
      ...clerkTheme.elements.headerTitle,
      color: "#F8FAFC",
    },
    headerSubtitle: {
      ...clerkTheme.elements.headerSubtitle,
      color: "#CBD5E1",
    },
    formButtonPrimary: {
      ...clerkTheme.elements.formButtonPrimary,
      backgroundColor: "#FFB800",
      color: "#0D1E52",
      "&:hover": {
        backgroundColor: "#FFC52B",
      },
    },
    formButtonSecondary: {
      ...clerkTheme.elements.formButtonSecondary,
      backgroundColor: "#14347F",
      color: "#F8FAFC",
      border: "1px solid #1E3FAF",
      "&:hover": {
        backgroundColor: "#1E3FAF",
      },
    },
    formFieldInput: {
      ...clerkTheme.elements.formFieldInput,
      backgroundColor: "#112768",
      border: "1px solid #1E3FAF",
      color: "#F8FAFC",
      "&:focus": {
        borderColor: "#00A9E6",
      },
    },
    formFieldLabel: {
      ...clerkTheme.elements.formFieldLabel,
      color: "#F8FAFC",
    },
    socialButtonsBlockButton: {
      ...clerkTheme.elements.socialButtonsBlockButton,
      backgroundColor: "#112768",
      border: "1px solid #1E3FAF",
      "&:hover": {
        backgroundColor: "#14347F",
      },
    },
    socialButtonsBlockButtonText: {
      ...clerkTheme.elements.socialButtonsBlockButtonText,
      color: "#F8FAFC",
    },
    identityPreview: {
      ...clerkTheme.elements.identityPreview,
      backgroundColor: "#14347F",
      border: "1px solid #1E3FAF",
    },
    footerActionText: {
      ...clerkTheme.elements.footerActionText,
      color: "#CBD5E1",
    },
    dividerLine: {
      ...clerkTheme.elements.dividerLine,
      backgroundColor: "#1E3FAF",
    },
    dividerText: {
      ...clerkTheme.elements.dividerText,
      color: "#CBD5E1",
    },
    alert: {
      ...clerkTheme.elements.alert,
      backgroundColor: "#14347F",
    },
    otpCodeFieldInput: {
      ...clerkTheme.elements.otpCodeFieldInput,
      backgroundColor: "#112768",
      border: "1px solid #1E3FAF",
      color: "#F8FAFC",
    },
  },
} as const;

export const userButtonTheme = {
  variables: {
    colorPrimary: "#14347F",
    colorBackground: "#FFFFFF",
    colorNeutral: "#64748B",
    borderRadius: "12px",
  },
  elements: {
    rootBox: {
      position: "relative",
    },
    userButtonTriggerBox: {
      borderRadius: "10px",
      "&:focus": {
        boxShadow: "0 0 0 2px rgba(0, 169, 230, 0.4)",
      },
    },
    userButtonAvatarBox: {
      width: "36px",
      height: "36px",
    },
    popoverCard: {
      borderRadius: "16px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 6px 18px rgba(2, 6, 23, 0.10)",
      padding: "8px",
    },
    popoverActionButton: {
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#0B1220",
      "&:hover": {
        backgroundColor: "#F1F5F9",
      },
    },
    popoverActionButtonIcon: {
      color: "#64748B",
    },
    userPreviewMainIdentifier: {
      fontWeight: "600",
      color: "#0B1220",
    },
    userPreviewSecondaryIdentifier: {
      color: "#64748B",
      fontSize: "13px",
    },
    userPreview: {
      padding: "12px",
      borderRadius: "10px",
      backgroundColor: "#F8FAFC",
    },
    dividerLine: {
      backgroundColor: "#E2E8F0",
      margin: "8px 0",
    },
    organizationSwitcherPopoverCard: {
      borderRadius: "16px",
      border: "1px solid #E2E8F0",
    },
    organizationSwitcherPopoverActionButton: {
      borderRadius: "10px",
    },
  },
} as const;

export const userButtonThemeDark = {
  variables: {
    colorPrimary: "#FFB800",
    colorBackground: "#0D1E52",
    colorNeutral: "#CBD5E1",
    borderRadius: "12px",
  },
  elements: {
    ...userButtonTheme.elements,
    popoverCard: {
      ...userButtonTheme.elements.popoverCard,
      border: "1px solid #1E3FAF",
      backgroundColor: "#112768",
    },
    popoverActionButton: {
      ...userButtonTheme.elements.popoverActionButton,
      color: "#F8FAFC",
      "&:hover": {
        backgroundColor: "#14347F",
      },
    },
    popoverActionButtonIcon: {
      color: "#CBD5E1",
    },
    userPreviewMainIdentifier: {
      ...userButtonTheme.elements.userPreviewMainIdentifier,
      color: "#F8FAFC",
    },
    userPreviewSecondaryIdentifier: {
      ...userButtonTheme.elements.userPreviewSecondaryIdentifier,
      color: "#CBD5E1",
    },
    userPreview: {
      ...userButtonTheme.elements.userPreview,
      backgroundColor: "#14347F",
    },
    dividerLine: {
      ...userButtonTheme.elements.dividerLine,
      backgroundColor: "#1E3FAF",
    },
  },
} as const;
