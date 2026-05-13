import axios from 'axios'

export async function fetchNepseData() {
  try {
    const { data } = await axios.get(
      'https://merolagani.com/handlers/webrequesthandler.ashx?type=stock_live_data',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )
    return data
  } catch (error) {
    console.error('Scrape failed:', error.message)
    return null
  }
}