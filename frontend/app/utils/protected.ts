import { redirect } from "react-router";
import { getToken } from "./auth";

export function requireAuth() {
  if (typeof window !== "undefined") {
    const token = getToken();
    if (!token) {
      throw redirect("/login");
    }
  }
}
