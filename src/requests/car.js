import axios from "axios";

const api='http://localhost:10087/apis/ListHistoricalLocation'

export default{
  async get(id){
    let body = new FormData();
    body.append('id',id)
    body.append('startTime','2020-06-16T13:02:00')
    const {data} = await axios.request({
      url:api,
      data:body,
      method:'POST',
    })
    return data
  },
  async getAllId(){
    const {data} = await axios.request({
      url:'http://localhost:8081/api/2/search/things?filter=eq(definition,"ics.rodaki:vehicle:1.0")&option=size(200)',
      method:'GET',
      auth:{
        username: 'ditto',
        password: 'ditto'
      }
    })
    return data
  },
}