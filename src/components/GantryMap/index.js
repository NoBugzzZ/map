import React, { useState, useEffect } from "react";
import { Map, Markers, Polyline, InfoWindow } from 'react-amap'
import { getNodes, getEdges, getSimplepair } from "../../requests/graph";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { makeStyles } from '@mui/styles';
import Editor from "@monaco-editor/react";
import FlowChart from '../FlowChart';

var _ = require('lodash')

const useStyle = makeStyles({
  gridcontainer: {
  },
  griditem: {
    padding: '20px',
  }
})

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

export default function GantriesGraph({ selectedGantries, clearAllTypeSelectedRows }) {

  const classes = useStyle()
  const [infoWindow, setInfoWindow] = React.useState({ visible: false, position: { longitude: 120, latitude: 30 }, content: 'content', size: { width: 500, height: 150 }, offset: [2, -35] });

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
  const [edgesDisplayFlag, setEdgesDisplayFlag] = useState(false)

  const [HEXID, setHEXID] = useState('')
  const [centerAndZoom, setCenterAndZoom] = useState({ center: { longitude: 120, latitude: 37 }, zoom: 5 })

  const [simplepairs, setSimplepairs] = useState(null)
  const [simplepairsGraph, setSimplepairsGraph] = useState(null)
  const [displaySimplepairsGraph, setDisplaySimplepairsGraph] = useState(null)
  const [simplepairsEdges, setSimplepairsEdges] = useState(null)
  const [simplepairsBackEdges, setSimplepairsBackEdges] = useState(null)
  const [simplepairsDisplayFlag, setSimplepairsDisplayFlag] = useState(false)

  useEffect(() => {
    if (selectedGantries.length > 0) {
      setGraphNodes(null)
      setGraphEdges(null)
      setGraph(null)
      setNodes([])
      setEdges(null)
      setBackEdges(null)
      setDisplayGraph(null)

      setSimplepairs(null)
      setSimplepairsGraph(null)
      setDisplaySimplepairsGraph(null)
      setSimplepairsEdges(null)
      setSimplepairsBackEdges(null)

      const lastIndex = selectedGantries.length - 1
      const { position } = selectedGantries[lastIndex]
      setCenterAndZoom({ center: { ...position }, zoom: 8 })
    }
  }, [selectedGantries])

  useEffect(() => {
    if (graphNodes && graphEdges) {
      let newGraph = {}
      let keys = Object.keys(graphNodes)
      for (let i in graphNodes) {
        const [longitude, latitude, type] = graphNodes[i]
        if (isValid({ longitude, latitude })) {
          newGraph[i] = { position: { longitude, latitude }, targets: [], type }
        } else {
          console.log(`${i}的longitude=${longitude},latitude=${latitude}不合法`)
          const findIndex = keys.findIndex(k => k === i)
          keys.splice(findIndex, 1)
        }
      }
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
    if (graphNodes && simplepairs) {
      let newGraph = {}
      let keys = Object.keys(graphNodes)
      for (let i in graphNodes) {
        const [longitude, latitude, type] = graphNodes[i]
        if (isValid({ longitude, latitude })) {
          newGraph[i] = { position: { longitude, latitude }, targets: [], type }
        } else {
          console.log(`${i}的longitude=${longitude},latitude=${latitude}不合法`)
          const findIndex = keys.findIndex(k => k === i)
          keys.splice(findIndex, 1)
        }
      }
      simplepairs.forEach((graphEdge, index) => {
        const { source, target } = graphEdge
        const findSource = keys.find(k => k === source)
        const findTarget = keys.find(k => k === target)
        if (findSource && findTarget) {
          if (findSource !== findTarget) {
            newGraph[source].targets.push({ target })
          } else {
            console.log(`${source}->${target},自旋`)
          }
        } else {
          console.log(`${source}或${target}的点不存在`)
        }
      })
      setSimplepairsGraph(newGraph)
    }
  }, [graphNodes, simplepairs])

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
    if (simplepairsGraph) {
      let newDisplayGraph = {}
      if (isDisplayPhysicalGantry) {
        for (let key in simplepairsGraph) {
          if (simplepairsGraph[key].type === 0) {
            newDisplayGraph[key] = simplepairsGraph[key]
          }
        }
      }
      if (isDisplayVirtualGantry) {
        for (let key in simplepairsGraph) {
          if (simplepairsGraph[key].type === 1) {
            newDisplayGraph[key] = simplepairsGraph[key]
          }
        }
      }
      setDisplaySimplepairsGraph(newDisplayGraph)
    }
  }, [simplepairsGraph, isDisplayPhysicalGantry, isDisplayVirtualGantry])

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

  useEffect(() => {
    if (displaySimplepairsGraph) {
      let newGraph = _.cloneDeep(displaySimplepairsGraph)
      let newNodes = []
      let newEdges = []
      let newBackEdges = []
      const keys = Object.keys(newGraph)
      keys.forEach(key => {
        const { position, targets, type } = newGraph[key]
        newNodes.push({ position, label: key, type })
        targets.forEach((target, index) => {
          const { target: targetNode } = target
          if (newGraph.hasOwnProperty(targetNode)) {
            let { position: targetPosition, targets: targetTargets } = newGraph[targetNode]
            let context = {
              path: [{ ...position }, { ...targetPosition }],
            }
            const findIndex = targetTargets.findIndex(t => t.target === key)
            if (findIndex !== -1) {
              newBackEdges.push({
                path: [{ ...targetPosition }, { ...position }]
              })
              targetTargets.splice(findIndex, 1)
              newGraph[targetNode].targets = _.cloneDeep(targetTargets)
            }
            newEdges.push({ ...context })
          }
        })
      })
      setNodes(newNodes)
      setSimplepairsEdges(newEdges.map(edge => {
        const { path } = edge
        return (
          <Polyline
            path={path}
            showDir={true}
            style={{ strokeColor: 'red', strokeWeight: 5, strokeOpacity: 0.8 }}
            events={{
              click: () => {
              }
            }}
            draggable={true}
          />
        )
      }))
      setSimplepairsBackEdges(newBackEdges.map(backEdge => {
        const { path } = backEdge
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
            style={{ strokeColor: 'red', strokeWeight: 5, strokeOpacity: 0.8 }}
            events={{
              click: () => {
              }
            }}
            draggable={true}
          />
        )
      }))
    }
  }, [displaySimplepairsGraph])

  const handleImportButton = () => {
    clearAllTypeSelectedRows()

    setGraphEdges(null)
    setGraph(null)
    setEdges(null)
    setBackEdges(null)
    setDisplayGraph(null)

    if (graphNodes === null) {
      getNodes().then(data => setGraphNodes(data))
    }
    getEdges(weight).then(data => setGraphEdges(data))
  }

  const handleSimplepairImportButton = () => {
    clearAllTypeSelectedRows()

    if (graphNodes === null) {
      getNodes().then(data => setGraphNodes(data))
    }
    if (simplepairs === null) {
      getSimplepair().then(data => {
        setSimplepairs(data)
      })
    }
  }

  const findPosition = () => {
    let newCenterAndZoom = {}
    const find = nodes.find(node => node.label === HEXID)
    if (find) {
      const { position } = find
      newCenterAndZoom['center'] = position
      newCenterAndZoom['zoom'] = 18
      setCenterAndZoom(newCenterAndZoom)
    }
  }


  const getInfoWindow = () => {
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
          <FlowChart infoWindow={infoWindow} />
        </Grid>
      </Grid>
    )
  }


  return (
    <Map
      amapkey={'c4682e400c06b2b8be5e65b99c6404f5'}
      zoom={centerAndZoom.zoom}
      center={centerAndZoom.center}
      events={{
        created: (ins) => {
          // setMapInstance(ins)
        },
        zoomchange: () => {
          // const newZoom = mapInstance.getZoom()
          // setZoom(newZoom)
        },
        moveend: () => {
          // const { R: longitude, Q: latitude } = mapInstance.getCenter()
          // setCenter({ longitude, latitude })
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
            const { label, position: { longitude, latitude } } = extData
            alert(label)
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
      {edgesDisplayFlag ? edges : null}
      {edgesDisplayFlag ? backEdges : null}

      {simplepairsDisplayFlag ? simplepairsEdges : null}
      {simplepairsDisplayFlag ? simplepairsBackEdges : null}

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
        markers={selectedGantries}
        useCluster={true}
        zIndex={10}
        events={{
          click: (e, marker) => {
            const extData = marker.getExtData()
            const { position: { longitude, latitude } } = extData
            setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(extData.info, null, 2), size: { width: 1000, height: 500 }, offset: [0, -35] })
          }
        }}
        render={extData => {
          return (
            <div
              style={{
                background: `url(https://img.icons8.com/ios-filled/30/000000/overhead-crane.png)`,
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

      <div className="customLayer" style={{ position: 'absolute', right: '30px', bottom: '30px', width: '400px' }}>
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
                    id="physicalswitch"
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
                    id="virtualswitch"
                  />
                }
                label="Virtual"
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                onClick={() => {
                  handleSimplepairImportButton()
                }}
                id="querybutton"
              >导入真实连通关系</Button>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={simplepairsDisplayFlag}
                    onChange={(event) => {
                      setSimplepairsDisplayFlag(event.target.checked)
                    }}
                    id="simplepairsDisplayFlagSwitch"
                  />
                }
                label="是否显示"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Min"
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

            <Grid item xs={2}>
              <TextField
                label="Max"
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
            <Grid item xs={3}>
              <Button
                variant="contained"
                onClick={() => {
                  handleImportButton()
                }}
                id="importbutton"
              >导入</Button>
            </Grid>
            <Grid item xs={5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={edgesDisplayFlag}
                    onChange={(event) => {
                      setEdgesDisplayFlag(event.target.checked)
                    }}
                    id="edgesDisplayFlagSwitch"
                  />
                }
                label="是否显示"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="HEX_ID"
                variant="standard"
                value={HEXID}
                onChange={(e) => {
                  setHEXID(e.target.value)
                }}
                id="hexidtextfield"
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                onClick={() => {
                  findPosition()
                }}
                id="querybutton"
              >查询</Button>
            </Grid>
          </Grid>
        </Box>
      </div>
    </Map>
  )
}