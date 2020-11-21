async function httpRequest(...args) {
  const response = await fetch(...args)
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

async function fetchUserData() {
  try {
    const { data: { token } } = await httpRequest('/.netlify/functions/auth')
    const userData = await httpRequest('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `bearer ${token}`
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
                primaryLanguage {
                  name,
                  color
                },
                forkCount,
                stargazerCount
              },
              totalCount
            }
          }
        }`
      })
    })
    return userData
  } catch (error) {
    return Promise.reject(error)
  }
}

function createIconElement(iconName, iconClassName = 'icon') {
  const iconContainer = document.createElement('span')
  const icon = document.createElement('i')

  icon.setAttribute('data-feather', iconName)
  iconContainer.className = iconClassName
  iconContainer.appendChild(icon)

  return icon
}

function displayProfileSummary(profileInfo) {
  const userFullNameElement = document.getElementById('user-full-name')
  const userNameElement = document.getElementById('username')
  const userBioElement = document.getElementById('user-bio')
  const userImageContainerElement = document.getElementsByClassName('user__image')[0]

  const userImageElement = document.createElement('img')

  userFullNameElement.innerHTML = profileInfo.name
  userBioElement.innerHTML = profileInfo.bio
  userNameElement.innerHTML = profileInfo.login

  userImageElement.setAttribute('src', profileInfo.avatarUrl)
  userImageElement.setAttribute('height', '260')
  userImageElement.setAttribute('width', '260')
  userImageElement.setAttribute('alt', profileInfo.name)
  userImageContainerElement.appendChild(userImageElement)
}

function createRepositoryElement(node) {
  const { homepageUrl, name, updatedAt, primaryLanguage, forkCount, stargazerCount } = node
  const repoContainer = document.createElement('li')
  repoContainer.className = 'repository'

  repoContainer.innerHTML = `
    <div class="repository__name">
      <a href=${homepageUrl}>
        <h3>${name}</h3>
      </a>
      <span id="description" class="flex items-center">
        <span id="language" class="description__item">
          ${primaryLanguage.name}
        </span>
        <span id="stargazer-count" class="description__item">
          <svg class="octicon mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>
          </svg>
          ${stargazerCount}
        </span>
        <span id="fork-count" class="description__item">
          <svg class="octicon mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
          </svg>
          ${forkCount}
        </span>
        <span id="updated-at" class="description__item">
          ${updatedAt}
        </span>
      </span>
    </div>
    <span class="repository__star">
      <svg class="octicon mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>
      </svg>
      Star
    </span>
  `

  return repoContainer
}

function appendRepoCount(totalCount) {
  const repoCountContainer = document.querySelector('#repo-count')
  repoCountContainer.innerHTML = totalCount
}

function displayRepositories(repositories) {
  console.log('repositories: ', repositories)
  const { totalCount, nodes } = repositories
  const repositoriesElement = document.getElementById('repositories')

  nodes.forEach((node) => {
    const nodeElement = createRepositoryElement(node)
    repositoriesElement.appendChild(nodeElement)
  })

  appendRepoCount(totalCount)
}

async function init () {
  try {
    const { data } = await fetchUserData();
    const { repositories, ...profileInfo } = data.viewer

    displayProfileSummary(profileInfo)
    displayRepositories(repositories)
  } catch (error) {
    console.log('error occurred: ', error)
  }
}

window.onload = init
