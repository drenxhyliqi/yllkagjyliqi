/** A block of legal text: a paragraph, a bulleted list, or a small table. */
export type LegalBlock =
  | string
  | { list: string[] }
  | { table: { columns: string[]; rows: string[][] } };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  title: string;
  /** Used for the page's meta description. */
  description: string;
  intro: string;
  sections: LegalSection[];
};

/** Business details quoted in the documents, so they stay in sync with the settings. */
export type LegalContext = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};
