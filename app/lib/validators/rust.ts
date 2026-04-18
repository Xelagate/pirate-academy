export type ValidatorResult = { ok: true } | { ok: false; msg: string };
export type Validator = (src: string) => ValidatorResult;

export const validators: Record<string, Validator> = {
  // Lesson 1: struct Pirate { name: ___ } → String
  "crab-forge-1": (src) =>
    /name\s*:\s*String\s*[,}]/.test(src)
      ? { ok: true }
      : { ok: false, msg: "name should be of type String" },

  // Lesson 2: doubloons: ___ → u64
  "crab-forge-2": (src) =>
    /doubloons\s*:\s*u64\s*[,}]/.test(src)
      ? { ok: true }
      : { ok: false, msg: "doubloons should be of type u64" },

  // Lesson 3: three pub keywords — on struct and both fields
  "crab-forge-3": (src) => {
    const pubs = (src.match(/\bpub\b/g) ?? []).length;
    return pubs >= 3
      ? { ok: true }
      : { ok: false, msg: `Found ${pubs} pub keyword(s) — need at least 3` };
  },

  // Lesson 4: pirates: ___<Pirate> → Vec
  "crab-forge-4": (src) =>
    /pirates\s*:\s*Vec\s*<\s*Pirate\s*>/.test(src)
      ? { ok: true }
      : { ok: false, msg: "Use Vec<Pirate> for the collection type" },

  // Lesson 5: impl Pirate { pub fn hoist(___) → &self
  "crab-forge-5": (src) =>
    /fn\s+hoist\s*\(\s*&\s*self/.test(src)
      ? { ok: true }
      : { ok: false, msg: "The first parameter should be &self" },

  // Lesson 6: #[___] pub struct Pirate → #[account]
  "crab-forge-6": (src) =>
    /#\[\s*account\s*\]/.test(src)
      ? { ok: true }
      : { ok: false, msg: "Add the #[account] attribute above the struct" },

  // Lesson 7: #[derive(___)] + pub bump: ___ → InitSpace, u8
  "crab-forge-7": (src) =>
    /#\[\s*derive\s*\([^)]*InitSpace[^)]*\)\s*\]/.test(src) &&
    /bump\s*:\s*u8\s*[,}]/.test(src)
      ? { ok: true }
      : {
          ok: false,
          msg: "Add InitSpace to #[derive(...)] and use u8 for bump",
        },
};
