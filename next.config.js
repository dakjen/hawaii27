// Stamp each build with its commit so the client can tell when a newer
// deploy exists and refresh itself — installed home-screen apps otherwise
// keep the old page alive indefinitely.
const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GIT_COMMIT_SHA ||
  `dev-${Date.now()}`;

module.exports = {
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
  generateBuildId: async () => buildId,
};
