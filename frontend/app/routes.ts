import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  // Handle and silence Chrome devtools background requests
  route(".well-known/appspecific/com.chrome.devtools.json", "routes/noop.tsx"),
] satisfies RouteConfig;
