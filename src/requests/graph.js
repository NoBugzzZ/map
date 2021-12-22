import axios from "axios";
import { API_URL } from "../config";

const backendApi = API_URL.BACKEND

export async function getNodes() {
  let url = backendApi + '/api/graph/nodes'
  const { data } = await axios.request({
    url,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  return data
}

export async function getEdges(weight) {
  let url = backendApi + '/api/graph/edges'
  const { data } = await axios.request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data:{
      weight
    }
  })
  return data
}