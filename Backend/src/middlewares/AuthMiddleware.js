// Middleware to require GitHub access token from various sources
export function requireGitHubToken(req, res, next) {
  //  Extract token from multiple sources
  const token =
    req.headers["x-github-token"] ||
    req.body?.githubToken ||
    req.query?.githubToken ||
    req.session?.user?.github?.token;

 
  req.githubToken = token || null;

  console.log(token ? "GitHub token found for request." : "No GitHub token provided.");
  next();
}
