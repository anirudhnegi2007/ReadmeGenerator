// Middleware to require GitHub access token from various sources
export function requireGitHubToken(req, res, next) {
  //  Extract token from multiple sources
  const token =
    req.headers["x-github-token"] ||
    req.body?.githubToken ||
    req.query?.githubToken ||
    req.session?.user?.github?.token;

 
  if (!token) {
    return res.status(401).json({ message: "Missing GitHub access token" });
  }

  
  req.githubToken = token;

  console.log("GitHub token found for request.");
  next();
}
