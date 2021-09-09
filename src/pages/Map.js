import React from 'react'
import { Map, Markers, InfoWindow,Polyline,Circle } from 'react-amap'
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
  const [checked, setChecked] = React.useState([])
  const [selectAll, setSelectAll] = React.useState(false)
  const [selectRow,setSelectRow] = React.useState(null)
  const [selectRows,setSelectRows] = React.useState([])
  const [message,setMessage] = React.useState(null)

  const [map,setMap] = React.useState(null)
  const [zoom,setZoom] = React.useState(1)
  const [infoWindow,setInfoWindow] = React.useState({visible: false, position: { longitude:120, latitude:30 }, content: 'content' });

  const [directions,setDirections] = React.useState([])
  const [direction,setDirection] = React.useState(null)
  
  React.useEffect(()=>{
    CarReq.getAllId().then(data=>{
      const {items}=data
      const newRows=items.map(item=>{
        const {thingId}=item
        return {id:thingId.replace('ics.rodaki:vehicle-',''),...item}
      })
      setRows(newRows)
    })
  },[])

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
      const position={longitude:parseFloat(LngLat[0]),latitude:parseFloat(LngLat[1])}
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
            direction:[]
          })
        }else{
          if(newDirections.findIndex(element=>element.id===sr.id)===-1){
            for(let i=0;i<len-1;i++){
              getDirection({id:sr.id,color:sr.color},sr.path[i],sr.path[i+1],i)
            }
          }else{
            getDirection({id:sr.id,color:sr.color},sr.path[len-2],sr.path[len-1],len-2)
          }
        }
      }
      
    }
  },[selectRows])

  React.useEffect(()=>{
    if(direction){
      const newDirections=[...directions]
      const currentIndex=newDirections.findIndex(element=>element.id===direction.id)
      if(currentIndex===-1){
        newDirections.push(direction)
      }else{
        newDirections[currentIndex].direction={...newDirections[currentIndex].direction,...direction.direction}
      }
      setDirections(newDirections)
    }
  },[direction])

  const getDirection = (context,origin,destination,index) => {
    CarReq.direction(origin,destination).then(data=>{
      if(data.status==='1'){
        let d=[]
        const {steps}=data.route.paths[0]
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
      if(p!='null'){
        const LngLat=p.split(';')
        res.push({longitude:parseFloat(LngLat[0]),latitude:parseFloat(LngLat[1])})
      }
    }
    return res
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
            size={{width:500,height:150}}
            isCustom={false}
            offset={[2,-35]}
            events={{
              close:(e)=>{
                setInfoWindow({ ...infoWindow, visible: false })
              }
            }}
          />
          <Markers
            markers={selectRows}
            useCluster={true}
            events={{
              click: (e, marker) => {
                const extData = marker.getExtData()
                const { lng: longitude, lat: latitude } = marker.getPosition()
                setInfoWindow({ ...infoWindow, visible: true, position: { longitude, latitude }, content: JSON.stringify(rows.find(row=>row.id===extData.id)) })
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
          >
          </Markers>
          {/* {selectRows.length>0?selectRows.map(r=>{
            return(
            <Polyline
              path={r.path}
              visible={true}
              style={{strokeColor:r.color}}
            >
            </Polyline>
            )
          })
          :null} */}
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
              >
              </Polyline>
            )
          }):null}
          {selectRows.length>0?selectRows.map(sr=>{
            return sr.path.map(s=>{
              return(
                <Circle
                  center={s}
                  radius={20000/zoom}
                  style={{fillColor:sr.color,strokeColor:sr.color}}
                ></Circle>
              )
            })
          }):null}
        </Map>
      </Grid>
    </Grid>
   
  )
}