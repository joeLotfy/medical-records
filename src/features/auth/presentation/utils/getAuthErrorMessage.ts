export function getAuthErrorMessage(error: unknown): string {
    const code =
        typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: unknown }).code
        : undefined;

    switch (code) {
        case "auth/email-already-in-use":
        return "An account already exists for this email. Please log in.";

    case "auth/invalid-email":
        return "Please enter a valid email address.";

    case "auth/weak-password":
        return "Choose a stronger password.";

    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
        return "The email or password is incorrect.";

    case "auth/too-many-requests":
        return "Too many attempts. Please wait and try again.";

    case "auth/network-request-failed":
        return "Network error. Check your internet connection.";

    case "auth/operation-not-allowed":
        return "Email/password authentication is not enabled.";

    default:
        return "Something went wrong. Please try again.";
  }
}