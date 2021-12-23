import { CarReq } from '../requests';
import moment from 'moment';

const getPredictPosition = (t, d) => {
  if (Object.size(d.direction) > 0) {
    const { path } = d
    for (let i = 0; i < path.length - 1; i++) {
      const stime = moment(path[i].timestamp).unix()
      const etime = moment(path[i + 1].timestamp).unix()
      if (t >= stime && t <= etime) {
        const v = d.amap[i].distance / (etime - stime)
        const len = Math.floor(v * (t - stime))
        let sPath = 0
        let ePath = 0
        const { steps } = d.amap[i]
        if (!steps || typeof (steps) === 'undefined') return null
        for (let step of steps) {
          sPath = ePath
          ePath += parseInt(step.distance)
          if (len >= sPath && len <= ePath) {
            ePath = sPath
            for (let tmc of step.tmcs) {
              sPath = ePath
              ePath += parseInt(tmc.distance)
              if (len >= sPath && len <= ePath) {
                const pp = tmc.polyline.split(';')[0].split(',')
                return ({ position: { longitude: parseFloat(pp[0]), latitude: parseFloat(pp[1]) }, id: d.id, offset: { x: -7, y: -7 } })
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

const getStartAndEndTime = (timeForselectVehicleRows) => {
  let res = {
    start: moment().unix(),
    end: moment('0000-01-01T00:00:00z').unix()
  }
  for (let timeForSelectRow of timeForselectVehicleRows) {
    const { path } = timeForSelectRow
    for (let p of path) {
      const { timestamp } = p
      const time = moment(timestamp).unix()
      if (time < res.start) res.start = time
      if (time > res.end) res.end = time
    }
  }
  if (res.start > res.end) return null
  return {
    start: moment.unix(res.start).toISOString(),
    end: moment.unix(res.end).toISOString()
  }
}

const getDirection = (context, origin, destination, index, callback) => {
  CarReq.direction(origin, destination).then(data => {
    let dir = {
      ...context,
      direction: {
        [index]: [
          { ...origin },
          { ...destination }
        ]
      },
      amap: {
        [index]: {}
      }
    }
    if (data.status === '1') {
      let d = []
      const path = data.route.paths[0]
      if (path) {
        const { steps } = path
        steps.forEach((stepValue, stepIndex) => {
          const { polyline: stepPolyline } = stepValue
          const stepLngLats = stepPolyline.split(';')
          stepLngLats.forEach((stepLngLatValue) => {
            const lnglat = stepLngLatValue.split(',')
            d.push({ longitude: parseFloat(lnglat[0]), latitude: parseFloat(lnglat[1]) })
          })
        })
        dir = {
          ...context,
          direction: {
            [index]: d
          },
          amap: {
            [index]: path
          }
        }
      }
    }
    callback(prev => {
      const newDirections = [...prev]
      const currentIndex = newDirections.findIndex(element => element.id === dir.id)
      if (currentIndex === -1) {
        newDirections.push(dir)
      } else {
        newDirections[currentIndex].direction = { ...newDirections[currentIndex].direction, ...dir.direction }
        newDirections[currentIndex].amap = { ...newDirections[currentIndex].amap, ...dir.amap }
      }
      return newDirections
    })
  })
}

export { getPredictPosition, getStartAndEndTime, getDirection }