export type Validator = (value: string) => string | null;

export const validateFirstName: Validator = (value) => {
  const v = value.trim();
  if (!v) return "Please enter your first name.";
  if (v.length < 2) return "Your name must be at least 2 characters.";
  if (!/^[\p{L}][\p{L}' -]*$/u.test(v)) return "Names can only contain letters, spaces, hyphens and apostrophes.";
  return null;
};

export const validateEmail: Validator = (value) => {
  const v = value.trim();
  if (!v) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Please enter a valid email address, e.g. name@example.com.";
  return null;
};
