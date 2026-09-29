export interface Todo {
  _id: string;
  text: string;
  isCompleted: boolean;
  createdAt: number;
}

export interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  success: string;
  danger: string;
}
