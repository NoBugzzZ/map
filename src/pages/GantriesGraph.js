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
  const [weight, setWeight] = useState(0.1)
  const [graphNodes, setGraphNodes] = useState(null)
  const [graphEdges, setGraphEdges] = useState(null)
  const [graph, setGraph] = useState(null)

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState(null)
  const [backEdges, setBackEdges] = useState(null)

  const [isDisplayPhysicalGantry, setIsDisplayPhysicalGantry] = useState(false)
  const [isDisplayVirtualGantry, setIsDisplayVirtualGantry] = useState(false)
  const [displayGraph, setDisplayGraph] = useState(null)

  useEffect(() => {
    if (weight) {
      getNodes().then(data => setGraphNodes(data))
      getEdges(weight).then(data => setGraphEdges(data))
    }
  }, [weight])

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
        const { source, target, edgeWeight } = graphEdge
        const findSource = keys.find(k => k === source)
        const findTarget = keys.find(k => k === target)
        if (findSource && findTarget) {
          if (findSource !== findTarget) {
            newGraph[source].targets.push({ target, edgeWeight })
          } else {
            // console.log(`${source}->${target},自旋`)
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
      let newGraph = _.cloneDeep(displayGraph)
      let newNodes = []
      let newEdges = []
      let newBackEdges = []
      const keys = Object.keys(newGraph)
      keys.forEach(key => {
        const { position, targets, type } = newGraph[key]
        newNodes.push({ position, label: key, type })
        targets.forEach((target, index) => {
          const { target: targetNode, edgeWeight } = target
          if (newGraph.hasOwnProperty(targetNode)) {
            let { position: targetPosition, targets: targetTargets } = newGraph[targetNode]
            let context = {
              path: [{ ...position }, { ...targetPosition }],
              edgeWeight
            }
            const findIndex = targetTargets.findIndex(t => t.target === key)
            if (findIndex !== -1) {
              newBackEdges.push({
                path: [{ ...targetPosition }, { ...position }],
                edgeWeight: targetTargets[findIndex].edgeWeight
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
        const { path, edgeWeight } = edge
        return (
          <Polyline
            path={path}
            showDir={true}
            style={{ strokeWeight: 5, strokeOpacity: edgeWeight }}
          />
        )
      }))
      setBackEdges(newBackEdges.map(backEdge => {
        const { path, edgeWeight } = backEdge
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
            style={{ strokeWeight: 5, strokeOpacity: edgeWeight }}
          />
        )
      }))
    }
  }, [displayGraph])

  const handleImportButton = (weight) => {
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

  return (
    <Map
      amapkey={'c4682e400c06b2b8be5e65b99c6404f5'}
      zoom={5}
      center={{ longitude: 120, latitude: 37 }}
      events={{
        created: (ins) => {
          // setMap(ins)
        },
        zoomchange: (e) => {
        }
      }}
    >
      <Markers
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
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  width: '30px',
                  height: '40px',
                  color: '#000',
                  textAlign: 'center',
                  lineHeight: '40px'
                }}
              ></div>
            )
          }else{
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
            <Grid item xs={8}>
              <TextField
                id="outlined-basic"
                label="weight"
                variant="outlined"
                value={weight}
                onChange={(e) => {
                  const newWeight = parseFloat(e.target.value)
                  if (newWeight <= 1 && newWeight >= 0) {
                    setWeight(newWeight)
                  }
                }}
                type="number"
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                onClick={() => {
                  handleImportButton(weight)
                }}
              >导入</Button>
            </Grid>
          </Grid>
        </Box>
      </div>
    </Map>
  )
}