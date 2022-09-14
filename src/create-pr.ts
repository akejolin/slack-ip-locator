import { Octokit } from "@octokit/core";
import { createPullRequest } from "octokit-plugin-create-pull-request"
import crypto from 'crypto'

const generateHash = (str:string):string => crypto
.createHash('md5')
.update(str, 'utf8')
.digest('hex')

export const createPR = async ({ip, email}:{ ip:string, email?:string }) => {

  try {

    const CustomOctokit = Octokit.plugin(
      createPullRequest
    )

    const octokit = new CustomOctokit({ auth: process.env.GITHUB_OCTOKIT_TOKEN });
    const pr = await octokit
      .createPullRequest({
        owner: process.env.GITHUB_OWNER as string,
        repo: process.env.GITHUB_REPO as string,
        title: "SLACK BOT wants to add new data",
        body: "New data added",
        head: `slack-bot/${generateHash(`${new Date()}`)}`,
        base: "main",
        update: true,
        forceFork: false,
        changes: [{
          files: {
            "storage.csv":  ({ exists, encoding, content }) => {
              // do not create the file if it does not exist
              if (!exists) return null
              return `${Buffer.from(content, encoding).toString("utf-8")}\n${ip ? ip : ''}${email ? `,${email}` : ''}`
            },
          },
          commit:  "update storage.csv"
        }
        ],
      })
    return pr
  } catch(error) {
    console.error(error)
  }
}

export default createPR
  



