import React from 'react'
import { Map, Markers, InfoWindow, Polyline } from 'react-amap'
import moment from 'moment';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Editor from "@monaco-editor/react";
import Grid from '@mui/material/Grid';
import FlowChart from '../FlowChart';
import SpeedChart from '../SpeedChart';
import { makeStyles } from '@mui/styles';
import { getPredictPosition, getStartAndEndTime, getDirection } from '../../utils';

const useStyle = makeStyles({
  gridcontainer: {
  },
  griditem: {
    padding: '20px',
  }
})


export default function CustomMap({ selectVehicleRows, selectTrafficTransactionsRows }) {

  const classes = useStyle()
  const [infoWindow, setInfoWindow] = React.useState({ visible: false, position: { longitude: 120, latitude: 30 }, content: 'content', size: { width: 500, height: 250 }, offset: [2, -35], type: 0 });

  const [directions, setDirections] = React.useState([])

  const [historyPositions, setHistoryPositions] = React.useState([])

  const [startAndEndTime, setStartAndEndTime] = React.useState(null)
  const [predictTime, setPredictTime] = React.useState('')
  const [predictPositions, setPredictPositions] = React.useState([])

  const [zoom, setZoom] = React.useState(5)
  const [center, setCenter] = React.useState({ longitude: 120, latitude: 37 })

  const [trafficTransactionsDirections, setTrafficTransactionsDirections] = React.useState([])
  const [trafficTransactionsPositions, setTrafficTransactionsPositions] = React.useState([])

  React.useEffect(() => {
    const newDirections = [...directions]
    for (const dir of directions) {
      if (selectVehicleRows.findIndex(element => element.id === dir.id) === -1) {
        const currentIndex = newDirections.findIndex(element => element.id === dir.id)
        newDirections.splice(currentIndex, 1)
      }
    }
    setDirections(newDirections)
    for (const sr of selectVehicleRows) {
      const len = sr.path.length
      if (len >= 2) {
        if (newDirections.findIndex(element => element.id === sr.id) === -1) {
          for (let i = 0; i < len - 1; i++) {
            getDirection({ id: sr.id, color: sr.color, path: sr.path }, sr.path[i], sr.path[i + 1], i, setDirections)
          }
        }
      }
    }
  }, [selectVehicleRows])

  React.useEffect(() => {
    const newDirections = [...trafficTransactionsDirections]
    for (const dir of trafficTransactionsDirections) {
      if (selectTrafficTransactionsRows.findIndex(element => element.id === dir.id) === -1) {
        const currentIndex = newDirections.findIndex(element => element.id === dir.id)
        newDirections.splice(currentIndex, 1)
      }
    }
    setTrafficTransactionsDirections(newDirections)
    for (const sr of selectTrafficTransactionsRows) {
      const len = sr.path.length
      if (len >= 2) {
        if (newDirections.findIndex(element => element.id === sr.id) === -1) {
          for (let i = 0; i < len - 1; i++) {
            getDirection({ id: sr.id, color: sr.color, path: sr.path }, sr.path[i], sr.path[i + 1], i, setTrafficTransactionsDirections)
          }
        }
      }
    }

  }, [selectTrafficTransactionsRows])

  React.useEffect(() => {
    const newHistoryPositions = []
    if (selectVehicleRows) {
      for (let sr of selectVehicleRows) {
        const maxIndex = sr.path.length - 1
        for (let i = 0; i < maxIndex; i++) {
          const { longitude, latitude, timestamp, context } = sr.path[i]
          newHistoryPositions.push({ id: sr.id, position: { longitude, latitude }, context: { ...context, longitude, latitude, timestamp }, offset: { x: -7, y: -7 } })
        }
      }
    }
    setHistoryPositions(newHistoryPositions)
  }, [selectVehicleRows])

  React.useEffect(() => {
    const newPositions = []
    if (selectTrafficTransactionsRows) {
      for (let sr of selectTrafficTransactionsRows) {
        for (let i = 0; i < sr.path.length; i++) {
          const { longitude, latitude, timestamp, context } = sr.path[i]
          newPositions.push({ id: sr.id, position: { longitude, latitude }, context: { ...context, longitude, latitude, timestamp }, offset: { x: -7, y: -7 } })
        }
      }
    }
    setTrafficTransactionsPositions(newPositions)
  }, [selectTrafficTransactionsRows])

  React.useEffect(() => {
    setPredictTime('')
    setPredictPositions([])
    setStartAndEndTime(getStartAndEndTime(selectVehicleRows))

    const lastIndex = selectVehicleRows.length - 1
    if (lastIndex >= 0) {
      const { position } = selectVehicleRows[lastIndex]
      setZoom(8)
      setCenter(position)
    }
  }, [selectVehicleRows])

  React.useEffect(() => {
    const lastIndex = selectTrafficTransactionsRows.length - 1
    if (lastIndex >= 0) {
      const { path } = selectTrafficTransactionsRows[lastIndex]
      if (path.length > 0) {
        setZoom(8)
        const { longitude, latitude } = path[0]
        setCenter({ longitude, latitude })
      }
    }
  }, [selectTrafficTransactionsRows])

  React.useEffect(() => {
    const newPredictPositions = []
    if (predictTime) {
      const currentPredictTime = moment(predictTime).unix()
      for (let d of directions) {
        if (d.path.length < 2) continue

        const currentStartTime = moment(d.path[0].timestamp).unix()
        const currentEndTime = moment(d.path[d.path.length - 1].timestamp).unix()
        if (currentPredictTime < currentStartTime || currentPredictTime > currentEndTime) continue

        const newPredictPosition = getPredictPosition(currentPredictTime, d)
        if (newPredictPosition) {
          newPredictPositions.push(newPredictPosition)
        }
      }
    }
    setPredictPositions(newPredictPositions)
  }, [predictTime])


  const getInfoWindow = () => {
    const { type } = infoWindow
    if (type === 0) {
      return (
        <Editor
          height={infoWindow.size.height - 20}
          language="json"
          value={infoWindow.content}
        />
      )
    } else if (type === 2) {
      return (
        <Grid container spacing={0} className={classes.gridcontainer}>
          <Grid item xs={6}>
            <Editor
              height={infoWindow.size.height - 20}
              language="json"
              value={infoWindow.content}
            />
          </Grid>
          <Grid item xs={6} className={classes.griditem}>
            <SpeedChart infoWindow={infoWindow} />
          </Grid>
        </Grid>
      )
    }
    return null
  }

  return (
    <Map
      amapkey={'c4682e400c06b2b8be5e65b99c6404f5'}
      zoom={zoom}
      center={center}
      events={{
        created: (ins) => {
          // setMap(ins)
        },
        zoomchange: (e) => {
        }
      }}
    >
      <InfoWindow
        position={infoWindow.position}
        // content={infoWindow.content}
        visible={infoWindow.visible}
        size={infoWindow.size}
        isCustom={false}
        offset={infoWindow.offset}
        events={{
          close: (e) => {
            setInfoWindow({ ...infoWindow, visible: false })
          }
        }}
      >
        {getInfoWindow()}
      </InfoWindow>

      <Markers
        markers={selectVehicleRows}
        useCluster={true}
        zIndex={10}
        events={{
          click: (e, marker) => {
            const extData = marker.getExtData()
            const { lng: longitude, lat: latitude } = marker.getPosition()
            setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(extData.info, null, 2), size: { width: 1000, height: 500 }, offset: [0, -35], type: 2 })
          },
          mouseover: (e, marker) => {
            // const extData = marker.getExtData()
            // const { lng: longitude, lat: latitude } = marker.getPosition()
            // setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(rows.find(row=>row.id===extData.id)) })
          },
          mouseout: (e, marker) => {
            // const extData = marker.getExtData()
            // setInfoWindow({ ...infoWindow, visible: false })
          },
        }}
        render={extData => {
          return (
            <div
              style={{
                background: `url(https://img.icons8.com/fluency/48/000000/car.png)`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '48px',
                height: '48px',
              }}
            ></div>
          )
        }}
      >
      </Markers>

      {directions.length >= 0 ? directions.map(dir => {
        let path = []
        for (const i in dir.direction) {
          path = [...path, ...dir.direction[i]]
        }
        return (
          <Polyline
            path={path}
            visible={true}
            style={{ strokeColor: dir.color }}
            zIndex={9}
          >
          </Polyline>
        )
      }) : null}

      {trafficTransactionsDirections.length >= 0 ? trafficTransactionsDirections.map(dir => {
        let path = []
        for (const i in dir.direction) {
          path = [...path, ...dir.direction[i]]
        }
        return (
          <Polyline
            path={path}
            visible={true}
            style={{ strokeColor: dir.color }}
            zIndex={9}
          >
          </Polyline>
        )
      }) : null}

      <Markers
        markers={historyPositions}
        useCluster={true}
        zIndex={10}
        events={{
          click: (e, marker) => {
            const extData = marker.getExtData()
            const { id, position: { longitude, latitude }, context } = extData
            setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(context, null, 2), size: { width: 500, height: 250 }, offset: [0, -35], type: 0 })
          }
        }}
        render={extData => {
          const { context: { ORIGINALFLAG, SPECIALTYPE, GANTRYPOSITIONFLAG } } = extData
          var backgroundUrl = 'https://img.icons8.com/ios-filled/30/000000/overhead-crane.png'
          if (ORIGINALFLAG === "2" || SPECIALTYPE === "154" || SPECIALTYPE === "186") {
            backgroundUrl = 'https://img.icons8.com/officexs/30/000000/overhead-crane.png'
          }
          if (GANTRYPOSITIONFLAG === '省界入口' || GANTRYPOSITIONFLAG === '省界出口') {
            backgroundUrl = 'https://img.icons8.com/ultraviolet/30/000000/overhead-crane.png'
          }
          return (
            <div
              style={{
                background: `url(${backgroundUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '30px',
                height: '30px',
              }}
            ></div>
          )
        }}
      >
      </Markers>

      {/**预测车辆位置 */}
      <Markers
        markers={predictPositions}
        useCluster={false}
        zIndex={11}
        events={{
          click: (e, marker) => {
            // const extData = marker.getExtData()
            // const {position:{longitude,latitude},id}=extData
            // setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: id,size:{width:180,height:25}, offset:[0,-35]})
          }
        }}
        render={extData => {
          return (
            <div
              style={{
                background: `url(https://img.icons8.com/material-sharp/24/000000/car.png)`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '24px',
                height: '24px',
              }}
            ></div>
          )
        }}
      >
      </Markers>

      <Markers
        markers={trafficTransactionsPositions}
        useCluster={true}
        zIndex={10}
        events={{
          click: (e, marker) => {
            const extData = marker.getExtData()
            const { id, position: { longitude, latitude }, context } = extData
            setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(context, null, 2), size: { width: 500, height: 250 }, offset: [0, -35], type: 0 })
          }
        }}
        render={extData => {
          const { context: { ORIGINALFLAG, SPECIALTYPE, GANTRYPOSITIONFLAG } } = extData
          var backgroundUrl = 'https://img.icons8.com/ios-filled/30/000000/overhead-crane.png'
          if (ORIGINALFLAG === "2" || SPECIALTYPE === "154" || SPECIALTYPE === "186") {
            backgroundUrl = 'https://img.icons8.com/officexs/30/000000/overhead-crane.png'
          }
          if (GANTRYPOSITIONFLAG === '省界入口' || GANTRYPOSITIONFLAG === '省界出口') {
            backgroundUrl = 'https://img.icons8.com/ultraviolet/30/000000/overhead-crane.png'
          }
          return (
            <div
              style={{
                background: `url(${backgroundUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '30px',
                height: '30px',
              }}
            ></div>
          )
        }}
      >
      </Markers>

      <div className="customLayer" style={{ position: 'absolute', right: '100px', bottom: '30px', width: '80%' }}>
        <Box sx={{ width: '100%' }}>
          <Slider
            min={0}
            max={1000}
            valueLabelDisplay='auto'
            defaultValue={0}
            aria-label="slider"
            disabled={startAndEndTime ? false : true}
            valueLabelFormat={(x) => {
              var start = 0
              var end = 0
              if (startAndEndTime) {
                start = moment(startAndEndTime.start).unix()
                end = moment(startAndEndTime.end).unix()
              }
              const t = (end - start) * x / 1000
              return moment.unix(start + t).toISOString()
            }}
            onChange={(event, value, activeThumb) => {

            }}
            onChangeCommitted={(event, value) => {
              if (startAndEndTime) {
                const start = moment(startAndEndTime.start).unix()
                const end = moment(startAndEndTime.end).unix()
                const t = (end - start) * value / 1000
                setPredictTime(moment.unix(start + t).toISOString())
              }
            }}
          />
        </Box>
      </div>

    </Map>
  )
}