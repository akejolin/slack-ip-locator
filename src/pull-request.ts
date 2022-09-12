import { Octokit } from "@octokit/core";


export const createPullRequest = async () => {

  const octokit = new Octokit(
    { auth: 'your-token!' }
  ),
  owner = 'test-user',
  repo = 'test-repo',
  title = 'My Test Pull Request',
  body  = 'This pull request is a test!',
  head  = 'my-feature-branch',
  base  = 'main';

  const response = await octokit.request(
      `POST /repos/{owner}/{repo}/pulls`, { owner, repo, title, body, head, base }
  )

  return response
}

export default createPullRequest