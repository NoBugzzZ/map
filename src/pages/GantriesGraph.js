import React, { useState, useEffect } from "react";
import { Map, Markers, Polyline } from 'react-amap'
import { getNodes, getEdges } from "../requests/graph";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

var _ = require('lodash')

const isValid = ({ longitude, latitude }) => {
  if (
    longitude >= 0 &&
    longitude <= 180 &&
    latitude >= 0 &&
    latitude <= 90
  ) {
    return true
  }
  return false
}

export default function GantriesGraph() {
  const [weight, setWeight] = useState({ min: 0.1, max: 1 })
  const [graphNodes, setGraphNodes] = useState(null)
  const [graphEdges, setGraphEdges] = useState(null)
  const [graph, setGraph] = useState(null)

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState(null)
  const [backEdges, setBackEdges] = useState(null)

  const [isDisplayPhysicalGantry, setIsDisplayPhysicalGantry] = useState(false)
  const [isDisplayVirtualGantry, setIsDisplayVirtualGantry] = useState(false)
  const [displayGraph, setDisplayGraph] = useState(null)

  const [HEXID, setHEXID] = useState('')
  const [center, setCenter] = useState({ longitude: 120, latitude: 37 })
  const [zoom, setZoom] = useState(5)
  const [mapInstance, setMapInstance] = useState(null)

  // useEffect(() => {
  //   if (weight) {
  //     getNodes().then(data => setGraphNodes(data))
  //     getEdges(weight).then(data => setGraphEdges(data))
  //   }
  // }, [weight])

  useEffect(() => {
    if (graphNodes && graphEdges) {
      // console.log(graphNodes,graphEdges)
      let newGraph = {}
      for (let i in graphNodes) {
        const [longitude, latitude, type] = graphNodes[i]
        if (isValid({ longitude, latitude })) {
          newGraph[i] = { position: { longitude, latitude }, targets: [], type }
        } else {
          console.log(`${i}的longitude=${longitude},latitude=${latitude}`)
        }
      }
      const keys = Object.keys(graphNodes)

      graphEdges.forEach((graphEdge, index) => {
        const { source, target, edgeWeight, flow } = graphEdge
        const findSource = keys.find(k => k === source)
        const findTarget = keys.find(k => k === target)
        if (findSource && findTarget) {
          if (findSource !== findTarget) {
            newGraph[source].targets.push({ target, edgeWeight, flow })
          } else {
            console.log(`${source}->${target},自旋`)
          }
        } else {
          console.log(`${source}或${target}的点不存在`)
        }
      })
      setGraph(newGraph)
    }
  }, [graphNodes, graphEdges])

  useEffect(() => {
    if (graph) {
      let newDisplayGraph = {}
      if (isDisplayPhysicalGantry) {
        for (let key in graph) {
          if (graph[key].type === 0) {
            newDisplayGraph[key] = graph[key]
          }
        }
      }
      if (isDisplayVirtualGantry) {
        for (let key in graph) {
          if (graph[key].type === 1) {
            newDisplayGraph[key] = graph[key]
          }
        }
      }
      setDisplayGraph(newDisplayGraph)
    }
  }, [graph, isDisplayPhysicalGantry, isDisplayVirtualGantry])

  useEffect(() => {
    if (displayGraph) {
      console.log(displayGraph)
      let newGraph = _.cloneDeep(displayGraph)
      let newNodes = []
      let newEdges = []
      let newBackEdges = []
      const keys = Object.keys(newGraph)
      keys.forEach(key => {
        const { position, targets, type } = newGraph[key]
        newNodes.push({ position, label: key, type })
        targets.forEach((target, index) => {
          const { target: targetNode, edgeWeight, flow } = target
          if (newGraph.hasOwnProperty(targetNode)) {
            let { position: targetPosition, targets: targetTargets } = newGraph[targetNode]
            let context = {
              path: [{ ...position }, { ...targetPosition }],
              edgeWeight,
              flow
            }
            const findIndex = targetTargets.findIndex(t => t.target === key)
            if (findIndex !== -1) {
              newBackEdges.push({
                path: [{ ...targetPosition }, { ...position }],
                edgeWeight: targetTargets[findIndex].edgeWeight,
                flow: targetTargets[findIndex].flow,
              })
              targetTargets.splice(findIndex, 1)
              newGraph[targetNode].targets = _.cloneDeep(targetTargets)
            }
            newEdges.push({ ...context })
          }
        })
      })
      setNodes(newNodes)
      setEdges(newEdges.map(edge => {
        const { path, edgeWeight, flow } = edge
        return (
          <Polyline
            path={path}
            showDir={true}
            style={{ strokeWeight: 4 + 3 * edgeWeight, strokeOpacity: 0.2 + 0.8 * edgeWeight }}
            events={{
              click: () => {
                alert(flow)
              }
            }}
            draggable={true}
          />
        )
      }))
      setBackEdges(newBackEdges.map(backEdge => {
        const { path, edgeWeight, flow } = backEdge
        let [sourcePosition, targetPosition] = path
        const { longitude: sourceLongitude, latitude: sourceLatitude } = sourcePosition
        const { longitude: targetLongitude, latitude: targetLatitude } = targetPosition
        const offset = 0.0003
        const newPath = [
          {
            longitude: sourceLongitude - offset,
            latitude: sourceLatitude - offset
          },
          {
            longitude: targetLongitude - offset,
            latitude: targetLatitude - offset
          }
        ]
        return (
          <Polyline
            path={path}
            showDir={true}
            style={{ strokeWeight: 4 + 3 * edgeWeight, strokeOpacity: 0.2 + 0.8 * edgeWeight }}
            events={{
              click: () => {
                alert(flow)
              }
            }}
            draggable={true}
          />
        )
      }))
    }
  }, [displayGraph])

  const handleImportButton = () => {
    setGraphNodes(null)
    setGraphEdges(null)
    setGraph(null)
    setNodes([])
    setEdges(null)
    setBackEdges(null)
    setDisplayGraph(null)

    getNodes().then(data => setGraphNodes(data))
    getEdges(weight).then(data => setGraphEdges(data))
  }

  const findPosition = () => {
    console.log(HEXID)
    const find = nodes.find(node => node.label === HEXID)
    if (find) {
      const { position } = find
      setCenter(position)
      setZoom(18)
    }
  }

  return (
    <Map
      amapkey={'c4682e400c06b2b8be5e65b99c6404f5'}
      zoom={zoom}
      center={center}
      events={{
        created: (ins) => {
          setMapInstance(ins)
        },
        zoomchange: () => {
          const newZoom = mapInstance.getZoom()
          setZoom(newZoom)
        },
        moveend: () => {
          const { R: longitude, Q: latitude } = mapInstance.getCenter()
          setCenter({ longitude, latitude })
        },
      }}
    >
      <Markers
        offset={(extData) => {
          const { type } = extData
          if (type === 0) {
            return [-15, -30]
          } else {
            return [-10, -34]
          }
        }}
        markers={nodes}
        useCluster={true}
        events={{
          click: (e, marker) => {
            const extData = marker.getExtData()
            alert(extData.label)
          }
        }}
        render={extData => {
          const { type } = extData
          if (type === 0) {
            return (
              <div
                style={{
                  background: `url('http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/map-marker-icon.png')`,
                  width: '30px',
                  height: '40px',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',

                }}
              ></div>
            )
          } else {
            return false
          }
        }}
      />
      {edges}
      {backEdges}

      <div className="customLayer" style={{ position: 'absolute', right: '100px', bottom: '30px', width: '250px' }}>
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDisplayPhysicalGantry}
                    onChange={(event) => {
                      setIsDisplayPhysicalGantry(event.target.checked)
                    }}
                  />
                }
                label="Physical"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDisplayVirtualGantry}
                    onChange={(event) => {
                      setIsDisplayVirtualGantry(event.target.checked)
                    }}
                  />
                }
                label="Virtual"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="MinWeight"
                variant="standard"
                value={weight ? weight.min : 0.1}
                onChange={(e) => {
                  const newMinWeight = parseFloat(e.target.value)
                  setWeight(prev => {
                    if (prev.max < newMinWeight) {
                      return {
                        ...prev,
                        min: newMinWeight,
                        max: newMinWeight,
                      }
                    } else {
                      return {
                        ...prev,
                        min: newMinWeight,
                      }
                    }
                  })
                }}
                type="number"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="MaxWeight"
                variant="standard"
                value={weight ? weight.max : 1}
                onChange={(e) => {
                  const newMaxWeight = parseFloat(e.target.value)
                  setWeight(prev => {
                    if (prev.min > newMaxWeight) {
                      return {
                        ...prev,
                        min: newMaxWeight,
                        max: newMaxWeight,
                      }
                    } else {
                      return {
                        ...prev,
                        max: newMaxWeight,
                      }
                    }
                  })
                }}
                type="number"
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                onClick={() => {
                  handleImportButton()
                }}
              >导入</Button>
            </Grid>
            <Grid item xs={8}>
              <TextField
                label="HEX_ID"
                variant="standard"
                value={HEXID}
                onChange={(e) => {
                  setHEXID(e.target.value)
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                onClick={() => {
                  findPosition()
                }}
              >查询</Button>
            </Grid>
          </Grid>
        </Box>
      </div>
    </Map>
  )
}