
export interface CharacterTrait {
  id: string;
  category: string;
  description: string;
}

export interface VisualReference {
  id: string;
  url: string;
  title: string;
  description: string;
}

export interface CharacterSection {
  id: string;
  title: string;
  content: string;
  images: VisualReference[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  image?: string;
  backstory: string;
  traits: CharacterTrait[];
  images: VisualReference[];
  customSections: CharacterSection[]; 
}

export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  images: VisualReference[];
}

export interface DialogueEntry {
  id: string;
  speaker: string;
  text: string;
}

export interface Scene {
  id: string;
  title?: string;
  description: string;
  dialogues: DialogueEntry[];
  speaker?: string;
  dialogue?: string;
}

export interface Script {
  id: string;
  title: string;
  summary: string;
  scenes: Scene[];
  images: VisualReference[];
}

export interface WorldNote {
  id: string;
  title: string;
  content: string;
}

export interface Author {
  name: string;
  role: string;
  photo?: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface CustomItem {
  id: string;
  name: string;
  description: string;
  fields: CustomField[];
  images: VisualReference[];
}

export interface CustomCategory {
  id: string;
  name: string;
  items: CustomItem[];
}

export interface Universe {
  id: string;
  name: string;
  description: string;
  customLogo?: string;
  characters: Character[];
  locations: Location[];
  scripts: Script[];
  customCategories: CustomCategory[];
  worldNotes: WorldNote[];
  images: VisualReference[];
  extraSections?: CharacterSection[]; // Novas seções de conteúdo do universo
  createdAt: number;
}

export type ViewType = 'dashboard' | 'characters' | 'scripts' | 'locations' | string;
