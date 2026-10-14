// Reads a setting whether it was saved in Vercel as UPPER_CASE or lower_case.
export function env(name) {
  return process.env[name] ?? process.env[name.toLowerCase()];
}
