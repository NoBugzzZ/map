import { useState, useEffect } from 'react';
import { LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis } from 'recharts';
import moment from 'moment';

export default function ({ infoWindow }) {

  const [data, setData] = useState([])

  useEffect(() => {
    if (infoWindow.visible) {
      const content = JSON.parse(infoWindow.content)
      const value = content['TRAFFICFLOWHISTORY']
      if (value) {
        const newData = value.map(v => {
          const [flow,timestamp]=v
          const time=moment.unix(timestamp/1000).format()
          return {
            flow,
            time
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
      <XAxis dataKey="time"/>
      <YAxis dataKey="flow"/>
      <Tooltip />
      <CartesianGrid stroke="#f5f5f5" />
      <Line type="linear" dataKey="flow" stroke="#ff7300" yAxisId={0} />
    </LineChart>
  )
}