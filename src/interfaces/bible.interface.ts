export interface Bible {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation?: string;
}
