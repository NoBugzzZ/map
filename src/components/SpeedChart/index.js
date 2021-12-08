import { useState, useEffect } from 'react';
import { LineChart,XAxis,Tooltip,CartesianGrid,Line,YAxis } from 'recharts';

export default function ({ infoWindow }) {

  const [data, setData] = useState([])

  useEffect(() => {
    if (infoWindow.visible) {
      const content = JSON.parse(infoWindow.content)
      const value = content['CURRENTSPEEDLIST']
      if (value) {
        const newData=value.map(v=>{
          return{
            speed:v
          }
        })
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
      <XAxis />
      <YAxis />
      <Tooltip />
      <CartesianGrid stroke="#f5f5f5" />
      <Line type="linear" dataKey="speed" stroke="#ff7300" yAxisId={0} />
    </LineChart>
  )
}