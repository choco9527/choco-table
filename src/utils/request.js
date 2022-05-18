import axios from 'axios'

// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API,
  timeout: 15000 // request timeout
})

export default service
