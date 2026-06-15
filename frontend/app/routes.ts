import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx", { id: "dashboard-index" }),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route(".well-known/appspecific/com.chrome.devtools.json", "routes/noop.tsx"),
  route("*", "routes/home.tsx"),
] satisfies RouteConfig;
