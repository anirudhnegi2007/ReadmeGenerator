import {
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../services/Firebase.js";

const provider = new GithubAuthProvider();

// Request private repo access
provider.addScope("repo");

export const loginWithGitHub = async () => {

 try { 

  const result = await signInWithPopup(auth, provider);

  const credential =
    GithubAuthProvider.credentialFromResult(result);

  const githubAccessToken = credential.accessToken;
  const firebaseUser = result.user;

  return { firebaseUser, githubAccessToken };}
  catch(error){
    console.error("Error during GitHub login:", error);
    throw error;
  }

};




const handleLogin = async () => {
  const { firebaseUser, githubAccessToken } =
    await loginWithGitHub();

  const firebaseIdToken =
    await firebaseUser.getIdToken();


  await fetch("/api/auth/github", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firebaseIdToken,
      githubAccessToken,
    }),
  });
};
export { handleLogin };




