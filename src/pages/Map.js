import React from 'react'
import { Map, Markers, InfoWindow, Polyline, Circle, Marker } from 'react-amap'
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { CarReq, subcribe } from '../requests';
// import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';

const useStyle = makeStyles({
  container:{
    height:'100%',
  },
  list:{
    height:'92%',
    overflow:'scroll'
  }
})

export default function(){
  const classes = useStyle();
  const [rows,setRows] = React.useState([])
  const [rowsCallback,setRowsCallback] = React.useState(null)
  const [gantries,setGantries] = React.useState([])
  const [gantriesCallback,setGantriesCallback] = React.useState(null)

  const [checked, setChecked] = React.useState([])
  const [selectAll, setSelectAll] = React.useState(false)
  const [selectRow,setSelectRow] = React.useState(null)
  const [selectRows,setSelectRows] = React.useState([])
  const [message,setMessage] = React.useState(null)
  const [historyPositions,setHistoryPositions] = React.useState([])

  const [map,setMap] = React.useState(null)
  const [zoom,setZoom] = React.useState(5)
  const [infoWindow,setInfoWindow] = React.useState({visible: false, position: { longitude:120, latitude:30 }, content: 'content' ,size:{width:500,height:150},offset:[2,-35]});

  const [directions,setDirections] = React.useState([])
  const [direction,setDirection] = React.useState(null)

  const [startAndEndTime,setStartAndEndTime] = React.useState(null)
  const [predictTime,setPredictTime] = React.useState('')
  const [predictPositions,setPredictPositions] = React.useState([])

  Object.size = function(obj) {
    var size = 0,
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };

const getPredictPosition = (t,d) => {
    if(Object.size(d.direction)>0){
      const {path}=d
      for(let i=0;i<path.length-1;i++){
        const stime=new Date(path[i].timestamp).getTime()
        const etime=new Date(path[i+1].timestamp).getTime()
        if(t>=stime&&t<=etime){
          const v=Math.floor(d.amap[i].distance/((etime-stime)/1000))
          const len=v*((t-stime)/1000)
          let sPath=0
          let ePath=0
          for(let step of d.amap[i].steps){
            sPath=ePath
            ePath+=parseInt(step.distance)
            if(len>=sPath&&len<=ePath){
              ePath=sPath
              for(let tmc of step.tmcs){
                sPath=ePath
                ePath+=parseInt(tmc.distance)
                if(len>=sPath&&len<=ePath){
                  const pp=tmc.polyline.split(';')[0].split(',')
                  return({position:{longitude:parseFloat(pp[0]),latitude:parseFloat(pp[1])},id:d.id,offset:{x:-7,y:-7}})
                  break;
                }
              }
              break;
            }
          }
          break;
        }
      }
    }
    return null
}

  React.useEffect(()=>{
    const newPredictPositions=[]
    if(predictTime!==''){
      const currentPredictTime=new Date(predictTime).getTime()
      for(let d of directions){
        if(d.path.length<2) continue

        const currentStartTime=new Date(d.path[0].timestamp).getTime()
        const currentEndTime=new Date(d.path[d.path.length-1].timestamp).getTime()
        if(currentPredictTime<currentStartTime||currentPredictTime>currentEndTime) continue

        const newPredictPosition=getPredictPosition(currentPredictTime,d)
        if(newPredictPosition){
          newPredictPositions.push(newPredictPosition)
        }
      }
    }
    setPredictPositions(newPredictPositions)
  },[predictTime])

  const getVehicles = (cursor,callback) => {
    CarReq.getVehicles(cursor).then(data=>{
      const {items,cursor}=data
      const newRows=items.map(item=>{
        const {thingId}=item
        return {id:thingId.replace('ics.rodaki:vehicle-',''),...item}
      })
      callback(newRows)
      // getVehicles(cursor,callback)
    })
  }

  React.useEffect(()=>{
    getVehicles('',setRowsCallback)
  },[])

  React.useEffect(()=>{
    if(rowsCallback){
      setRows([...rows,...rowsCallback])
    }
  },[rowsCallback])

  const getGantries = (cursor,callback) => {
    CarReq.getGantries(cursor).then(data=>{
      let {items,cursor} = data
      for(const index in items){
        const {attributes:{longtitude:longitude,latitude}}=items[index]
        items[index].position={longitude,latitude}
      }
      callback(items)
      // getGantries(cursor,callback)
    })
  }

  React.useEffect(()=>{
    getGantries('',setGantriesCallback)
  },[])

  React.useEffect(()=>{
    if(gantriesCallback){
      setGantries([...gantries,...gantriesCallback])
    }
  },[gantriesCallback])

  React.useEffect(()=>{
    if(selectRow){
      setSelectRows([...selectRows,selectRow])
    }
  },[selectRow])

  React.useEffect(()=>{
    if(message){
      const {thingId,features:{location:{properties:{value}}}}=JSON.parse(message)
      let newSelectRows=[...selectRows]
      const currentIndex=newSelectRows.findIndex(element=>element.thingId===thingId)
      const LngLat=value.split(';')
      const position={longitude:parseFloat(LngLat[0]),latitude:parseFloat(LngLat[1]),timestamp:new Date(Date.now()).toISOString()}
      newSelectRows[currentIndex].position=position
      newSelectRows[currentIndex].path=[...newSelectRows[currentIndex].path,position]
      setSelectRows(newSelectRows)
    }
  },[message])

  React.useEffect(()=>{
    if(selectRows){
      const newDirections=[...directions]
      for(const dir of directions){
        if(selectRows.findIndex(element=>element.id===dir.id)===-1){
          const currentIndex=newDirections.findIndex(element=>element.id===dir.id)
          newDirections.splice(currentIndex,1)
        }
      }
      setDirections(newDirections)
      for(const sr of selectRows){
        const len=sr.path.length
        if(len===0||len===1){
          setDirection({
            id:sr.id,
            color:sr.color,
            direction:[],
            amap:{},
            path:sr.path
          })
        }else{
          if(newDirections.findIndex(element=>element.id===sr.id)===-1){
            for(let i=0;i<len-1;i++){
              getDirection({id:sr.id,color:sr.color,path:sr.path},sr.path[i],sr.path[i+1],i)
            }
          }else{
            getDirection({id:sr.id,color:sr.color,path:sr.path},sr.path[len-2],sr.path[len-1],len-2)
          }
        }
      }
    }
  },[selectRows])

  React.useEffect(()=>{
    setPredictTime('')
    setPredictPositions([])
    setStartAndEndTime(getStartAndEndTime(selectRows))
  },[selectRows])

  React.useEffect(()=>{
    const newHistoryPositions=[]
    if(selectRows){
      for(let sr of selectRows){
        const maxIndex=sr.path.length-1
        for(let i=0;i<maxIndex;i++){
          const{longitude,latitude,timestamp}=sr.path[i]
          newHistoryPositions.push({id:sr.id,position:{longitude,latitude},timestamp,offset:{x:-7,y:-7}})
        }
      }
      
    }
    setHistoryPositions(newHistoryPositions)
  },[selectRows])

  React.useEffect(()=>{
    if(direction){
      const newDirections=[...directions]
      const currentIndex=newDirections.findIndex(element=>element.id===direction.id)
      if(currentIndex===-1){
        newDirections.push(direction)
      }else{
        newDirections[currentIndex].direction={...newDirections[currentIndex].direction,...direction.direction}
        newDirections[currentIndex].amap={...newDirections[currentIndex].amap,...direction.amap}
      }
      setDirections(newDirections)
    }
  },[direction])

  const getDirection = (context,origin,destination,index) => {
    CarReq.direction(origin,destination).then(data=>{
      if(data.status==='1'){
        let d=[]
        const path=data.route.paths[0]
        const {steps}=path
        steps.forEach((stepValue,stepIndex)=>{
          const {polyline:stepPolyline}=stepValue
          const stepLngLats=stepPolyline.split(';')
          stepLngLats.forEach((stepLngLatValue)=>{
            const lnglat=stepLngLatValue.split(',')
            d.push({longitude:parseFloat(lnglat[0]),latitude:parseFloat(lnglat[1])})
          })

        })
        setDirection({
          ...context,
          direction:{
            [index]:d
          },
          amap:{
            [index]:path
          }
        })
      }else{
        setDirection({
          ...context,
          direction:{
            [index]:[
              {...origin},
              {...destination}
              ]
          },
          amap:{
            [index]:{}
          }
        })
      }
    })
  }

  const handleListItemClick = (row) => {
    const currentTarget = checked.indexOf(row.id)
    const newChecked = [...checked]
    if( currentTarget === -1){
      newChecked.push(row.id)
    }else{
      newChecked.splice(currentTarget,1)
    }
    setChecked(newChecked)
  }
  const handleSelectAll = () => {
    if(selectAll){
      setChecked([])
    }else{
      const newChecked = []
      for(let row of rows){
        newChecked.push(row.id)
      }
      setChecked(newChecked)
    }
    setSelectAll(!selectAll)
  }

  const handleButtonClick = () => {
    const newSelectRows=[...selectRows]
    for(const selectRow of selectRows){
      if(checked.indexOf(selectRow.id)===-1){
        const currentIndex = newSelectRows.findIndex(element=>element.id===selectRow.id)
        selectRow.sse.close()
        newSelectRows.splice(currentIndex,1)
      }
    }
    setSelectRows(newSelectRows)
    if(newSelectRows.length<checked.length){
      for(const ckd of checked){
        if(newSelectRows.findIndex(element=>element.id===ckd)===-1){
          CarReq.get(ckd).then(data=>{
            const positions=transformFormat(data)
            const currentIndex=positions.length-1
            const row=rows.find(element=>element.id===ckd)
            setSelectRow({
              id:ckd,
              thingId:row.thingId,
              position:currentIndex>=0?positions[currentIndex]:{},
              path:positions,
              color:'rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')',
              sse:subcribe(row.thingId,(mes)=>{
                setMessage(mes)
              })
            })
          })
        }
      }
    }
  }

  const transformFormat = (positions) => {
    const res=[]
    for(let p of positions){
      if(p[1]!='null'){
        const LngLat=p[1].split(';')
        res.push({longitude:parseFloat(LngLat[0]),latitude:parseFloat(LngLat[1]),timestamp:p[0]})
      }
    }
    return res
  }

  const getStartAndEndTime=(timeForSelectRows)=>{
    let res={
      start:new Date(Date.now()).getTime(),
      end:new Date('0000-01-01T00:00:00z').getTime()
    }
    for(let timeForSelectRow of timeForSelectRows){
      const {path}=timeForSelectRow
      for(let p of path){
        const {timestamp}=p
        const time=new Date(timestamp).getTime()
        if(time<res.start) res.start=time
        if(time>res.end) res.end=time
      }
    }
    if(res.start>res.end) return null
    return {
      start:new Date(res.start).toISOString(),
      end:new Date(res.end).toISOString()
    }
  } 

  return(
    <Grid container spacing={2} className={classes.container}>
      <Grid item xs={2} className={classes.container}>
        <Grid container xs={12}>
          <Grid item xs={6}>
            <FormControlLabel
              control={<Checkbox checked={selectAll} onClick={handleSelectAll}/>}
              label="全选"
            />
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained" 
              color="primary"
              onClick={handleButtonClick}
            >
              导入
            </Button>
          </Grid>
        </Grid>
        <List dense className={classes.list}>
            {rows.map(row=>{
              return(
                <ListItem key={row.id} button onClick={()=>handleListItemClick(row)}>
                  <ListItemIcon>
                    <Checkbox
                      checked={checked.indexOf(row.id)!==-1}
                    />
                  </ListItemIcon>
                  <ListItemText primary={row.id}/>
                </ListItem>
              )
            })}
        </List>
      </Grid>
      <Grid item xs={10} className={classes.container}>
        <Map 
          amapkey={'c4682e400c06b2b8be5e65b99c6404f5'}
          zoom={5}
          events={{
            created:(ins)=>{
              setMap(ins)
            },
            zoomchange:(e)=>{
              setZoom(map.getZoom())
            }
          }}
        >
          <InfoWindow
            position={infoWindow.position}
            content={infoWindow.content}
            visible={infoWindow.visible}
            size={infoWindow.size}
            isCustom={false}
            offset={infoWindow.offset}
            events={{
              close:(e)=>{
                setInfoWindow({ ...infoWindow, visible: false })
              }
            }}
          />
          <Markers
            markers={selectRows}
            useCluster={true}
            zIndex={10}
            events={{
              click: (e, marker) => {
                const extData = marker.getExtData()
                const { lng: longitude, lat: latitude } = marker.getPosition()
                setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(rows.find(row=>row.id===extData.id),null,2),size:{width:500,height:150}, offset:[0,-35]})
              },
              mouseover: (e, marker) => {
                const extData = marker.getExtData()
                // const { lng: longitude, lat: latitude } = marker.getPosition()
                // setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(rows.find(row=>row.id===extData.id)) })
              },
              mouseout: (e, marker) => {
                const extData = marker.getExtData()
                // setInfoWindow({ ...infoWindow, visible: false })
              },
            }}
            render={extData => {
              return (
                <div
                  style={{
                    background: `url(https://img.icons8.com/fluency/48/000000/car.png`,
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


          {directions.length>0?directions.map(dir=>{
            let path=[]
            for(const i in dir.direction){
              path=[...path,...dir.direction[i]]
            }
            return(
              <Polyline
                path={path}
                visible={true}
                style={{strokeColor:dir.color}}
                zIndex={9}
              >
              </Polyline>
            )
          }):null}


          <Markers
            markers={historyPositions}
            useCluster={false}
            zIndex={10}
            events={{
              click: (e, marker) => {
                const extData = marker.getExtData()
                const {id,position:{longitude,latitude},timestamp}=extData
                setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify({id,timestamp},null,2),size:{width:200,height:50}, offset:[0,-35]})
              }
            }}
            render={extData => {
              return (
                <div
                  style={{
                    background: `url(https://img.icons8.com/office/30/000000/car.png`,
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
                    background: `url(https://img.icons8.com/material-sharp/24/000000/car.png`,
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
            markers={gantries}
            useCluster={true}
            zIndex={10}
            events={{
              click: (e, marker) => {
                const extData = marker.getExtData()
                const {position:{longitude,latitude}}=extData
                setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(extData,null,2),size:{width:500,height:120}, offset:[0,-35]})
              }
            }}
            render={extData => {
              return (
                <div
                  style={{
                    background: `url(https://img.icons8.com/office/30/000000/overhead-crane.png`,
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

          <div className="customLayer" style={{ position: 'absolute', right: '100px', bottom: '30px' }}>
            <Box sx={{ width: 200 }}>
              <Slider min={0} max={1000} valueLabelDisplay='auto' defaultValue={0}  aria-label="slider" 
                valueLabelFormat={(x)=>{
                  var start=0
                  var end=0
                  if(startAndEndTime){
                    start=new Date(startAndEndTime.start).getTime()
                    end=new Date(startAndEndTime.end).getTime()
                  }
                  const t=(end-start)*x/1000
                  return new Date(start+t).toISOString()
                }}
                onChange={(event,value,activeThumb)=>{
                  
                }}
                onChangeCommitted={(event,value)=>{
                  if(startAndEndTime){
                    const start=new Date(startAndEndTime.start).getTime()
                    const end=new Date(startAndEndTime.end).getTime()
                    const t=(end-start)*value/1000
                    setPredictTime(new Date(start+t).toISOString())
                  }
                }}
              />
            </Box>
          </div>

        </Map>
      </Grid>
    </Grid>
   
  )
}