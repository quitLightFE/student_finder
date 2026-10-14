import type { Student } from "./types";

const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export async function getStudents(): Promise<Student[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Students Loading Error");
  }

  return response.json();
}
