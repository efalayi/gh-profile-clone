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

function createRepositoryDescriptionElement(description) {
  const { updatedAt, primaryLanguage, forkCount, stargazerCount } = description

  const descriptionContainer = document.createElement('span')

  descriptionContainer.innerHTML = `
    <span id="language" class="description__item">
      <i data-feather="star"></i>
      ${primaryLanguage.name}
    </span>
    <span id="stargazer-count" class="description__item">
      <i data-feather="star"></i>
      ${stargazerCount}
    </span>
    <span id="fork-count" class="description__item">
      ${forkCount}
    </span>
    <span id="updated-at" class="description__item">
      ${updatedAt}
    </span>
  `

  return descriptionContainer
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
      <span id="description" class="flex">
        <span id="language" class="description__item">
          ${primaryLanguage.name}
        </span>
        <span id="stargazer-count" class="description__item">
          ${stargazerCount}
        </span>
        <span id="fork-count" class="description__item">
          ${forkCount}
        </span>
        <span id="updated-at" class="description__item">
          ${updatedAt}
        </span>
      </span>
    </div>
    <span class="repository__star">
      <span class="icon"><i data-feather="star"></i></span>
      <span>Star</span>
    </span>
  `

  return repoContainer
}

function displayRepositories(repositories) {
  console.log('repositories: ', repositories)
  const { totalCount, nodes } = repositories
  const repositoriesElement = document.getElementById('repositories')

  nodes.forEach((node) => {
    const nodeElement = createRepositoryElement(node)
    repositoriesElement.appendChild(nodeElement)
  })
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
