/**
 * App-wide configuration.
 *
 * feedbackEmail: Used for the contact link in the footer and modal.
 * Gmail +addressing (e.g. user+tag@gmail.com) delivers to the same inbox;
 * use a tag like +liver to filter feedback. It does not increase spam risk.
 * Override at build time with VITE_FEEDBACK_EMAIL in .env if needed.
 */
export const AppConfig = {
  feedbackEmail:
    import.meta.env?.VITE_FEEDBACK_EMAIL || "lithium.34advance@icloud.com",

  repositoryUrl: "https://github.com/rasnastudios/piacenza-liver",

  creator: {
    name: "Lorenzo Andraghetti",
    github: "https://github.com/andraghetti",
    linkedin: "https://linkedin.com/in/andraghetti",
  },

  tampieri: {
    name: "Luca Tampieri",
    linkedin: "https://linkedin.com/in/luca-tampieri",
    artstation: "https://www.artstation.com/lukedt",
    instagram: "https://www.instagram.com/heythereluke/",
  },
}
