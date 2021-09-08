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
import { CarReq } from '../requests';


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
  const [infoWindow,setInfoWindow] = React.useState({visible: false, position: { longitude:120, latitude:30 }, content: 'content' });

  const [checked, setChecked] = React.useState([])
  const [selectAll, setSelectAll] = React.useState(false)
  const [cars, setCars] = React.useState([])
  const [car,setCar]=React.useState(null)
  const [map,setMap]=React.useState(null)
  const [zoom,setZoom]=React.useState(1)

  const handleClick = (row) => {
    const currentTarget = checked.indexOf(row.id)
    const newChecked = [...checked]
    if( currentTarget === -1){
      newChecked.push(row.id)
    }else{
      newChecked.splice(currentTarget,1)
    }
    setChecked(newChecked)
  }

  React.useEffect(()=>{
    if(car){
      setCars([...cars,car])
    }
  },[car])

  const handleSelectAll = () => {
    if(selectAll){
      setChecked([])
    }else{
      const newChecked = [...checked]
      for(let row of rows){
        if(newChecked.indexOf(row.id)===-1){
          newChecked.push(row.id)
        }
      }
      setChecked(newChecked)
    }
    setSelectAll(!selectAll)
  }

  const handleButtonClick = () => {
    const newCars=[...cars]
    for(let cc of cars){
      const index = newCars.findIndex(element=>element.id===cc.id)
      if(checked.indexOf(cc.id)===-1){
        newCars.splice(index,1)
      }
    }
    setCars(newCars)

    const newChecked=[]
    for(let ckd of checked){
      if(newCars.findIndex(element=>element.id===ckd)===-1){
        newChecked.push(ckd)
      }
    }

    for(let ckd of newChecked){
      CarReq.get(ckd).then(data=>{
        let positions=[]
        for(let d of data){
          if(d!='null'){
            const LngLat=d.split(';')
            positions=[...positions,{longitude:parseFloat(LngLat[0]),latitude:parseFloat(LngLat[1])}]
          }
        }
        const index=positions.length-1
        setCar({
          id:ckd,
          position:positions[index],
          path:positions,
          color:'rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')',
        })
      })
    }
    
  }


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

  const displayCircle = () => {
    if(cars.length>0){
      let circle=[]
      for(const cc of cars){
        for(const pos of cc.path){
          circle.push(
          <Circle
            center={pos}
            radius={10000/zoom}
            style={{fillColor:cc.color,strokeColor:cc.color}}
          ></Circle>)
        }
      }
      return circle
    }
    return null
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
                <ListItem key={row.id} button onClick={()=>handleClick(row)}>
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
            markers={cars}
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
          {cars.length>0?cars.map(cc=>{
            return(
            <Polyline
              path={cc.path}
              visible={true}
              style={{strokeColor:cc.color}}
            >
            </Polyline>
            )
          })
          :null}
          {displayCircle()}
        </Map>
      </Grid>
    </Grid>
   
  )
}