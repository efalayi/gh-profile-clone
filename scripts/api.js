const GITHUB_API_TOKEN = '';

async function fetchUserData() {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `bearer ${GITHUB_API_TOKEN}`
    },
    body: JSON.stringify({
      query: `{ 
        viewer { 
          login,
          avatarUrl,
          name,
          bio,
          repositories(first: 20) {
            nodes {
              homepageUrl,
              name,
              updatedAt,
            },
            totalCount
          }
        }
      }`
    })
  })

  const { status } = response
  const responseData = await response.json()

  if ( response.ok) {
    return Promise.resolve({
      status,
      data: responseData?.data || responseData
    })
  }
  return Promise.reject({
    status,
    error: responseData
  })
}

async function init () {
  try {
    const { data } = await fetchUserData();
    console.log('viewer details: ', data)
  } catch (error) {
    console.log('error occurred: ', error)
  }
}

window.onload = init
