import axios from "axios";
import { API_URL } from "../config";

const backendApi=API_URL.BACKEND

export async function getVehicles(cursor) {
  var url = backendApi+'/api/vehicle'
  if (cursor!=='') {
    url += `?size=${cursor}`
  }
  const { data } = await axios.request({
    url,
    method: 'GET'
  })
  return data
}
export async function getGantries(cursor) {
  var url =  backendApi+'/api/gantry'
  if (cursor!=='') {
    url += `?size=${cursor}`
  }
  const { data } = await axios.request({
    url,
    method: 'GET'
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
