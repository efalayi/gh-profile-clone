const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export async function httpRequest(...args) {
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


export function formatDate(dateString) {
  const currentDate = Date.now()
  const dateObject = new Date(dateString)

  // const dateDiff = dateObject - currentDate

  // console.log('dateDiff: ', dateDiff)

  const monthIndex = dateObject.getMonth()
  const day = dateObject.getDate()
  const month = MONTHS[monthIndex].slice(0, 3)

  return `${day} ${month}`
} 