// Vercel: exit 0 skips a build; exit 1 continues it.
const projects = {
  prj_lGdVKeHQvPy04jzl4ewyPNJgaUTX: "demo/ristorante",
  prj_xBliz6NN4ILQG19JZCc1GkY7qpwG: "demo/pizzeria",
};
const expected = projects[process.env.VERCEL_PROJECT_ID];
const branch = process.env.VERCEL_GIT_COMMIT_REF;
// A manual/local build without Git metadata remains possible.
const skip = Boolean(expected && branch && branch !== expected);
console.log(
  skip
    ? `Skipped: ${branch} is not ${expected}`
    : `Build allowed: ${branch || "manual/local"}`,
);
process.exit(skip ? 0 : 1);
