import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-heads-up",
  description: "A browser-local clue passing game for a room of peers.",
  accentHex: "#ea580c",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});
