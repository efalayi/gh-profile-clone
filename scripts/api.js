import { httpRequest, formatDate } from './library.js'

async function fetchTotalRepositoryCount() {
  try {
    const { data: { token } } = await httpRequest('/.netlify/functions/auth')
    const { data: { viewer } } = await httpRequest('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `bearer ${token}`
      },
      body: JSON.stringify({
        query: `{ 
          viewer { 
            repositories {
              totalCount
            }
          }
        }`
      })
    })
    return viewer.repositories.totalCount
  } catch (error) {
    return Promise.reject(error)
  }
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
            repositories(affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], privacy: PUBLIC, first: 20, orderBy: {direction: DESC, field: UPDATED_AT}) {
              nodes {
                name,
                description,
                resourcePath,
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

function createRepositoryElement(node) {
  const { resourcePath, name, description, updatedAt, primaryLanguage, forkCount, stargazerCount } = node
  const repoContainer = document.createElement('li')
  repoContainer.className = 'repository'

  repoContainer.innerHTML = `
    <div class="w-75">
      <a href="https://github.com${resourcePath}" target="_blank">
        <h3>${name}</h3>
      </a>
      <span class="block mt-2 mb-2 text--grey">${description || ''}</span>
      <span class="flex items-center flex-wrap text--grey">
        <span class="description__item">
          <span class="dot mr-1" style="background-color: ${primaryLanguage.color};"></span>
          ${primaryLanguage.name}
        </span>
        <span class="description__item">
          <svg class="octicon mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>
          </svg>
          ${stargazerCount}
        </span>
        <span class="description__item">
          <svg class="octicon mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
          </svg>
          ${forkCount}
        </span>
        <span class="description__item">
          Updated on ${formatDate(updatedAt)}
        </span>
      </span>
    </div>
    <button class="repository__star">
      <svg class="octicon mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>
      </svg>
      Star
    </button>
  `

  return repoContainer
}

function displayProfileSummary(profileInfo) {
  const userFullNameElement = document.querySelector('#user-full-name')
  const userNameElements = document.querySelectorAll('.username')
  const userBioElement = document.querySelector('#user-bio')
  const userImageContainerElement = document.querySelector('.user__image')
  const userStatusElement = document.createElement('span')

  userStatusElement.className = 'user__status'
  userStatusElement.innerHTML = `
    <span class="pr-2 pl-2">
      <svg class="octicon" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
        <path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zM5 8a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zM5.32 9.636a.75.75 0 011.038.175l.007.009c.103.118.22.222.35.31.264.178.683.37 1.285.37.602 0 1.02-.192 1.285-.371.13-.088.247-.192.35-.31l.007-.008a.75.75 0 111.222.87l-.614-.431c.614.43.614.431.613.431v.001l-.001.002-.002.003-.005.007-.014.019a1.984 1.984 0 01-.184.213c-.16.166-.338.316-.53.445-.63.418-1.37.638-2.127.629-.946 0-1.652-.308-2.126-.63a3.32 3.32 0 01-.715-.657l-.014-.02-.005-.006-.002-.003v-.002h-.001l.613-.432-.614.43a.75.75 0 01.183-1.044h.001z"></path>
      </svg>
      <span class="set-status">Set Status</span>
    </span>
  `

  userImageContainerElement.innerHTML =  `
    <img src="${profileInfo.avatarUrl}" height="260" width="260" alt="${profileInfo.name}">
  `
  userImageContainerElement.insertAdjacentElement('beforeend', userStatusElement)

  userFullNameElement.innerHTML = profileInfo.name
  userBioElement.innerHTML = profileInfo.bio

  // update username
  userNameElements.forEach((element) => element.innerHTML = profileInfo.login)
}

function displayUserAvatar(profileImage, userName) {
  const userAvatarElement = document.querySelector('.user__avatar')

  userAvatarElement.innerHTML =  `
    <img src="${profileImage}" height="20" width="20" alt="${userName}">
  `
}

function appendRepoCount(totalCount) {
  const repoCountContainer = document.querySelector('#repo-count')
  repoCountContainer.innerHTML = totalCount
}

function displayRepositories(repositories) {
  console.log('repositories: ', repositories)
  const { totalCount, nodes } = repositories
  const repositoriesElement = document.querySelector('#repositories')
  const resultContainer = document.querySelector('#result')

  resultContainer.innerHTML = `
    <b>${totalCount}</b> results for <b>public</b> repositories
  `

  nodes.forEach((node) => {
    const nodeElement = createRepositoryElement(node)
    repositoriesElement.appendChild(nodeElement)
  })
}

async function init () {
  try {
    const { data } = await fetchUserData();
    const totalRepositoryCount = await fetchTotalRepositoryCount()
    const { repositories, ...profileInfo } = data.viewer

    appendRepoCount(totalRepositoryCount)
    displayUserAvatar(profileInfo.avatarUrl, profileInfo.login)
    displayProfileSummary(profileInfo)
    displayRepositories(repositories)
  } catch (error) {
    console.log('error occurred: ', error)
  }
}

function handleMenuClick(event) {
  const headerElement = document.querySelector('.header')

  headerElement.classList.toggle('menu-show')
}

function loadEventListeners() {
  const menuButton = document.querySelector('#menu')

  menuButton.addEventListener('click', handleMenuClick)
}

window.onload = function () {
  init()
  loadEventListeners()
}
