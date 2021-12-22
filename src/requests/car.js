import axios from "axios";
import { API_URL } from "../config";

const backendApi = API_URL.BACKEND

export async function getVehicles(limit = 10, skip = 0, query = {}) {
  var url = backendApi + '/api/vehicles'
  url += `?skip=${skip}&limit=${limit}`
  const { data } = await axios.request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      query
    },
  })
  return data
}
export async function getGantries(limit = 10, skip = 0, query = {}) {
  var url = backendApi + '/api/gantries'
  url += `?skip=${skip}&limit=${limit}`
  const { data } = await axios.request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      query
    },
  })
  return data
}

export async function getTrafficTransactions(limit = 10, skip = 0, query = {}) {
  var url = backendApi + '/api/traffictransactions'
  url += `?skip=${skip}&limit=${limit}`
  const { data } = await axios.request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      query
    },
  })
  return data
}


export async function direction(origin, destination) {
  const url = `https://restapi.amap.com/v3/direction/driving?key=f4833b485afbe530c057be70b1893ed5&destination=` + destination.longitude + `,` + destination.latitude + `&origin=` + origin.longitude + `,` + origin.latitude
  const { data } = await axios.request({
    url,
    method: 'GET',
  })
  return data
}
