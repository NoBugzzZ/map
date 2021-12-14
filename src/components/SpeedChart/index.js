import { useState, useEffect } from 'react';
import { LineChart,XAxis,Tooltip,CartesianGrid,Line,YAxis } from 'recharts';
import moment from 'moment';

export default function ({ infoWindow }) {

  const [data, setData] = useState([])

  useEffect(() => {
    if (infoWindow.visible) {
      const content = JSON.parse(infoWindow.content)
      const value = content['CURRENTSPEEDLIST']
      if (value) {
        const newData=value.map(v=>{
          const[speed,timestamp]=v
          const time=moment.unix(timestamp/1000).toISOString()
          return{
            speed,
            time
          }
        })
        console.log(newData)
        setData(newData)
      }
    }
  }, [infoWindow])
  return (
    <LineChart
      width={400}
      height={400}
      data={data}
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <XAxis dataKey="time"/>
      <YAxis dataKey="speed"/>
      <Tooltip />
      <CartesianGrid stroke="#f5f5f5" />
      <Line type="linear" dataKey="speed" stroke="#ff7300"/>
    </LineChart>
  )
}