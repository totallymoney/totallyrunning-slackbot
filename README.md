# TotallyRunning slack bot

Connects to the TotallyRunning Strava club, run `/totallyrunning-leaderboard` in the TotallyMoney slack and it will post the total distances of the authenticated runners, ordered in descending order, for the last 7 days.

This was a product of TotallyMoney's Big Hack 2020, held on 11/06/20.

## Future

### Technical

- Implement [https://www.npmjs.com/package/serverless-slack](serverless-slack)
- Implement [https://github.com/UnbounDev/node-strava-v3](node-strava-v3)
- Convert to TypeScript
- Write unit tests
- Use DynamoDB instead of S3 for persisting data

### Features

- Use a CloudWatch trigger to automatically post the leaderboard at a specific time each week
- Compare data to previous time periods (e.g week-by-week)
- Get different time periods, using the slash command e.g `/totallyrunning-leaderboard 30` to get the last 30 days
- Live streamed updates from Strava when someone sets a personal best
- Other activity types
- Use Slack usernames in the leaderboard
- Make authenticate message (`/totallyrunning-auth`) only visible to the user who requested it get
