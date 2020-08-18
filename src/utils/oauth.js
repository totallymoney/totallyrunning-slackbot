import simpleOauth from 'simple-oauth2'

export const config = {
  clientId: process.env.STRAVA_CLIENT_ID,
  clientSecret: process.env.STRAVA_CLIENT_SECRET,
  tokenHost: 'https://strava.com',
  authorizePath: 'https://www.strava.com/oauth/authorize',
  tokenPath: 'https://www.strava.com/oauth/token',
  redirect_uri: (host) => `http://${host}/prod/authCallback`,
}

function authInstance(credentials) {
  if (!credentials.client.id) {
    throw new Error('MISSING REQUIRED ENV VARS. Please set STRAVA_CLIENT_ID')
  }
  if (!credentials.client.secret) {
    throw new Error(
      'MISSING REQUIRED ENV VARS. Please set STRAVA_CLIENT_SECRET'
    )
  }
  return simpleOauth.create(credentials)
}

export default authInstance({
  client: {
    id: config.clientId,
    secret: config.clientSecret,
  },
  auth: {
    tokenHost: config.tokenHost,
    tokenPath: config.tokenPath,
    authorizePath: config.authorizePath,
  },
})
