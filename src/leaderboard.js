import qs from 'qs'
import fetch from 'node-fetch'
import subWeeks from 'date-fns/subWeeks'

import S3Client from './utils/Aws'

const s3 = new S3Client()

export const leaderboard = async () => {
  console.log('env', process.env)
  const objects = await s3.list({
    Bucket: process.env.TM_AWS_S3_BUCKET_PATH,
  })

  const athletes = objects.Contents.map(async ({ Key }) => {
    const object = await s3.get({
      Bucket: process.env.TM_AWS_S3_BUCKET_PATH,
      Key,
    })

    const objectJson = JSON.parse(object)

    const params = {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: objectJson.refresh_token,
      grant_type: 'refresh_token',
    }

    try {
      const response = await fetch(
        `https://www.strava.com/oauth/token?${qs.stringify(params)}`,
        {
          method: 'POST',
        }
      )
      const { access_token } = await response.json()
      return {
        access_token,
        name: objectJson.name,
        athleteId: objectJson.athleteId,
      }
    } catch (err) {
      console.error('fetch access token error', err)
    }
  })

  const athleteDistances = athletes.map(async (athlete) => {
    const data = await athlete
    try {
      const dateMinus1Week = subWeeks(new Date(), 1)
      const epoch = new Date(dateMinus1Week).getTime() / 1000
      const params = {
        after: epoch,
      }
      if (data.access_token) {
        const response = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?${qs.stringify(
            params
          )}`,
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        )
        const activities = await response.json()

        const types = ['Run', 'VirtualRun']
        if (!activities) {
          console.log(data.name, activities)
          return {}
        } else {
          const distance = activities.reduce(
            (acc, { type, distance }) =>
              types.includes(type) ? acc + distance : acc,
            0
          )
          return {
            id: data.athleteId,
            name: `${data.name.first} ${data.name.last}`,
            totalDistance: distance,
          }
        }
      } else {
        throw 'No access token'
      }
    } catch (err) {
      console.error('fetch activities error', err)
      return null
    }
  })

  const athletesWithZeroDistance = []
  const distances = (await Promise.all(athleteDistances)).filter((athlete) => {
    const isDistanceGreaterThanZero = athlete?.totalDistance > 0
    if (!isDistanceGreaterThanZero) {
      athletesWithZeroDistance.push(athlete)
    }
    return isDistanceGreaterThanZero
  })
  distances.sort((a, b) => b.totalDistance - a.totalDistance)

  const strings = distances.map(
    ({ name, totalDistance }, i) =>
      `${i + 1}/ ${name}: ${Number.parseFloat(totalDistance / 1000).toFixed(
        2
      )}km`
  )

  const body = JSON.stringify({
    text: `Total distances run by TotallyRunning club members this week:\n${strings.join(
      '\n'
    )}\n${athletesWithZeroDistance.length} athletes on 0km.`,
  })
  try {
    await fetch(process.env.SLACK_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
  } catch (err) {
    console.error(err)
  }
  return {
    statusCode: 200,
    body,
  }
}
