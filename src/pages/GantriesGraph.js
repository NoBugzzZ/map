import React, { useState, useEffect } from "react";
import { Map, Markers, Polyline } from 'react-amap'
import { getNodes, getEdges } from "../requests/graph";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

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
        const [longitude, latitude] = graphNodes[i]
        if (isValid({ longitude, latitude })) {
          newGraph[i] = { position: { longitude, latitude }, targets: [] }
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
      console.log(newGraph)
      setGraph(newGraph)
    }
  }, [graphNodes, graphEdges])

  useEffect(() => {
    if (graph) {
      let newGraph = _.cloneDeep(graph)
      let newNodes = []
      let newEdges = []
      let newBackEdges = []
      const keys = Object.keys(newGraph)
      keys.forEach(key => {
        const { position, targets } = newGraph[key]
        newNodes.push({ position, label: key })
        targets.forEach((target, index) => {
          const { target: targetNode, edgeWeight } = target
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
        })
      })
      console.log(newNodes)
      console.log(newEdges, newBackEdges)
      setNodes(newNodes)
      setEdges(newEdges.map(edge => {
        const { path, edgeWeight } = edge
        return (
          <Polyline
            path={path}
            showDir={true}
            style={{ strokeWeight: 3, strokeOpacity: edgeWeight }}
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
            style={{ strokeWeight: 3, strokeOpacity: edgeWeight }}
          />
        )
      }))
    }
  }, [graph])

  const handleImportButton = (weight) => {
    setGraphNodes(null)
    setGraphEdges(null)
    setGraph(null)
    setNodes([])
    setEdges(null)
    setBackEdges(null)

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
            console.log(extData)
          }
        }}
      />
      {edges}
      {backEdges}

      <div className="customLayer" style={{ position: 'absolute', right: '100px', bottom: '30px', width: '200px' }}>
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={2}>
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
                  console.log(weight)
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