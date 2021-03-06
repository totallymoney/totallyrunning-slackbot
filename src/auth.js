import fetch from 'node-fetch'

import S3Client from './utils/Aws'
import oauth2, { config } from './utils/oauth'

const s3 = new S3Client()

export const auth = async (event) => {
  if (event.httpMethod === 'POST') {
    try {
      await fetch(process.env.SLACK_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `<${process.env.AUTH_LINK}|Authenticate> with the TotallyRunning Strava slack bot.`,
              },
            },
          ],
        }),
      })
      return {
        statusCode: 200,
        body: 'success',
      }
    } catch (err) {
      console.error('auth error', err)
      return {
        statusCode: 500,
        body: err.message,
      }
    }
  } else {
    const authorizationURI = oauth2.authorizationCode.authorizeURL({
      redirect_uri: config.redirect_uri(event.headers.Host),
      scope: 'read,activity:read',
      state: '',
    })

    return {
      statusCode: 302,
      headers: {
        Location: authorizationURI,
        'Cache-Control': 'no-cache',
      },
      body: '',
    }
  }
}

export const authCallback = async (event) => {
  const { code } = event.queryStringParameters

  try {
    const {
      token: { athlete, refresh_token },
    } = oauth2.accessToken.create(
      await oauth2.authorizationCode.getToken({
        code: code,
        redirect_uri: config.redirect_uri(event.headers.Host),
        client_id: config.clientId,
        client_secret: config.clientSecret,
      })
    )

    await s3.put({
      Bucket: process.env.TM_AWS_S3_BUCKET_PATH,
      Key: `${athlete.id}.json`,
      Body: JSON.stringify({
        athleteId: athlete.id,
        name: {
          first: athlete.firstname,
          last: athlete.lastname,
        },
        refresh_token: refresh_token,
      }),
    })

    return {
      statusCode: 200,
      body: 'All done! You can return to Slack now.',
    }
  } catch (error) {
    console.log('Access Token Error', error.message)
    console.log(error)

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}
