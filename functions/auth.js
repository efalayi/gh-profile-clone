exports.handler = async function(event, context) {
  const token = process.env.GITHUB_API_TOKEN

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Authenticated',
      data: { token }
    })
  }
}
