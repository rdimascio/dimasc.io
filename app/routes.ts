import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("ava", "routes/ava.tsx"),
  route("rhys", "routes/rhys.tsx"),
] satisfies RouteConfig;
