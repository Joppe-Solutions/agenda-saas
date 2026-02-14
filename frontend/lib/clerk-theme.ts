export const clerkTheme = {
  baseTheme: undefined,
  variables: {
    colorPrimary: "#00C8FF",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#F8FAFC",
    colorInputText: "#0B1220",
    colorNeutral: "#64748B",
    colorDanger: "#DC2626",
    colorSuccess: "#16A34A",
    colorWarning: "#00C8FF",
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
      backgroundColor: "#00C8FF",
      color: "#FFFFFF",
      fontSize: "14px",
      fontWeight: "600",
      padding: "12px 16px",
      borderRadius: "12px",
      "&:hover": {
        backgroundColor: "#00A8D9",
      },
      "&:focus": {
        boxShadow: "0 0 0 2px #00C8FF",
      },
      "&:active": {
        backgroundColor: "#0095C2",
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
        borderColor: "#00C8FF",
        boxShadow: "0 0 0 2px rgba(0, 200, 255, 0.2)",
      },
    },
    formFieldLabel: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#0B1220",
      marginBottom: "8px",
    },
    formFieldAction: {
      color: "#00C8FF",
      fontSize: "13px",
      fontWeight: "600",
      "&:hover": {
        color: "#00A8D9",
      },
    },
    footerActionLink: {
      color: "#00C8FF",
      fontWeight: "600",
      "&:hover": {
        color: "#00A8D9",
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
      color: "#00C8FF",
      fontWeight: "600",
    },
    otpCodeFieldInput: {
      borderRadius: "10px",
      border: "1px solid #E2E8F0",
      fontSize: "20px",
      fontWeight: "600",
      "&:focus": {
        borderColor: "#00C8FF",
        boxShadow: "0 0 0 2px rgba(0, 200, 255, 0.2)",
      },
    },
  },
} as const;

export const clerkThemeDark = {
  ...clerkTheme,
  variables: {
    ...clerkTheme.variables,
    colorPrimary: "#00D4FF",
    colorBackground: "#0D1E36",
    colorInputBackground: "#142744",
    colorInputText: "#F8FAFC",
    colorNeutral: "#CBD5E1",
  },
  elements: {
    ...clerkTheme.elements,
    card: {
      ...clerkTheme.elements.card,
      border: "1px solid #1E3A5F",
      backgroundColor: "#142744",
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
      backgroundColor: "#00D4FF",
      color: "#0D1E36",
      "&:hover": {
        backgroundColor: "#00BDE6",
      },
    },
    formButtonSecondary: {
      ...clerkTheme.elements.formButtonSecondary,
      backgroundColor: "#1E3A5F",
      color: "#F8FAFC",
      border: "1px solid #2A4A70",
      "&:hover": {
        backgroundColor: "#2A4A70",
      },
    },
    formFieldInput: {
      ...clerkTheme.elements.formFieldInput,
      backgroundColor: "#142744",
      border: "1px solid #1E3A5F",
      color: "#F8FAFC",
      "&:focus": {
        borderColor: "#00D4FF",
      },
    },
    formFieldLabel: {
      ...clerkTheme.elements.formFieldLabel,
      color: "#F8FAFC",
    },
    socialButtonsBlockButton: {
      ...clerkTheme.elements.socialButtonsBlockButton,
      backgroundColor: "#142744",
      border: "1px solid #1E3A5F",
      "&:hover": {
        backgroundColor: "#1E3A5F",
      },
    },
    socialButtonsBlockButtonText: {
      ...clerkTheme.elements.socialButtonsBlockButtonText,
      color: "#F8FAFC",
    },
    identityPreview: {
      ...clerkTheme.elements.identityPreview,
      backgroundColor: "#1E3A5F",
      border: "1px solid #2A4A70",
    },
    footerActionText: {
      ...clerkTheme.elements.footerActionText,
      color: "#CBD5E1",
    },
    dividerLine: {
      ...clerkTheme.elements.dividerLine,
      backgroundColor: "#1E3A5F",
    },
    dividerText: {
      ...clerkTheme.elements.dividerText,
      color: "#CBD5E1",
    },
    alert: {
      ...clerkTheme.elements.alert,
      backgroundColor: "#1E3A5F",
    },
    otpCodeFieldInput: {
      ...clerkTheme.elements.otpCodeFieldInput,
      backgroundColor: "#142744",
      border: "1px solid #1E3A5F",
      color: "#F8FAFC",
    },
  },
} as const;

export const userButtonTheme = {
  variables: {
    colorPrimary: "#00C8FF",
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
        boxShadow: "0 0 0 2px rgba(0, 200, 255, 0.4)",
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
    colorPrimary: "#00D4FF",
    colorBackground: "#0D1E36",
    colorNeutral: "#CBD5E1",
    borderRadius: "12px",
  },
  elements: {
    ...userButtonTheme.elements,
    popoverCard: {
      ...userButtonTheme.elements.popoverCard,
      border: "1px solid #1E3A5F",
      backgroundColor: "#142744",
    },
    popoverActionButton: {
      ...userButtonTheme.elements.popoverActionButton,
      color: "#F8FAFC",
      "&:hover": {
        backgroundColor: "#1E3A5F",
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
      backgroundColor: "#1E3A5F",
    },
    dividerLine: {
      ...userButtonTheme.elements.dividerLine,
      backgroundColor: "#1E3A5F",
    },
  },
} as const;
