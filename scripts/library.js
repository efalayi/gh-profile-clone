const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/**
 * @function httpRequest
 * @summary executes an HTTP request
 * @param {Array} fetch API function parameters
 * @returns {Promise}
 */
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

/**
 * @function formatDate
 * @summary formats a date string
 * @param {String} dateString
 * @returns {String} formattedDate
 */
export function formatDate(dateString) {
  const currentDate = Date.now()
  const dateObject = new Date(dateString)

  const monthIndex = dateObject.getMonth()
  const day = dateObject.getDate()
  const month = MONTHS[monthIndex].slice(0, 3)

  return `${day} ${month}`
} 