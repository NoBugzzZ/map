import React from 'react'
// import Grid from '@material-ui/core/Grid';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import { CarReq } from '../requests';
import { List, Map } from '../components';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import moment from 'moment';
import Button from '@mui/material/Button';
import QueryFilter from '../components/QueryFilter/QueryFilter';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>
          <Typography component={'span'} height={'100%'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


const useStyle = makeStyles({
  container: {
    height: '100%',
  },
  list: {
    height: '100%',
  },
  tabpanel: {
    height: '88%'
  },

})

const NUMBER_PER_PAGE = 12

export default function MapPage() {
  const classes = useStyle();
  const [vehicles, setVehicles] = React.useState([])
  const [gantries, setGantries] = React.useState([])

  const [selectVehicleRows, setSelectVehicleRows] = React.useState([])

  const [selectGantryRows, setSelectGantryRows] = React.useState([])

  const [value, setValue] = React.useState(0);

  const [vehicleCheckedStatus, setVehicleCheckedStatus] = React.useState({ checked: [] })
  const [gantryCheckedStatus, setGantryCheckedStatus] = React.useState({ checked: [] })

  const [vehiclePageCount, setVehiclePageCount] = React.useState(0)
  const [gantryPageCount, setGantryPageCount] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  Object.size = function (obj) {
    var size = 0,
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };

  const getVehicles = (limit, skip, query) => {
    CarReq.getVehicles(limit, skip, query).then(data => {
      const { items, skip, count } = data
      const newRows = items.map(item => {
        const { _id } = item
        return {
          id: _id,
          info: item
        }
      })
      setVehicles(newRows)
      var pageCount = NUMBER_PER_PAGE > 0 ? Math.ceil(count / NUMBER_PER_PAGE) : count
      setVehiclePageCount(pageCount)
    })
  }

  const getGantries = (limit, skip, query) => {
    CarReq.getGantries(limit, skip, query).then(data => {
      let { items, skip, count } = data
      const newRows = items.map(item => {
        const { _id } = item
        return {
          id: _id,
          position: {
            longitude: parseFloat(item['LONGITUDE']['$numberDecimal']),
            latitude: parseFloat(item['LATITUDE']['$numberDecimal'])
          },
          info: item
        }
      })
      setGantries(newRows)
      var pageCount = NUMBER_PER_PAGE > 0 ? Math.ceil(count / NUMBER_PER_PAGE) : count
      setGantryPageCount(pageCount)
    })
  }

  React.useEffect(() => {
    getVehicles(NUMBER_PER_PAGE)
    getGantries(NUMBER_PER_PAGE)
  }, [])

  const isValidForLongitude = (longitude) => {
    if (longitude <= 180 && longitude > 0) return true
    return false
  }

  const isValidForLatitude = (latitude) => {
    if (latitude <= 90 && latitude > 0) return true
    return false
  }

  const getPositions = (value) => {
    if (typeof value === 'undefined') return []
    const res = []
    value.forEach((v) => {
      let { LONGITUDE: { $numberDecimal: longitude }, LATITUDE: { $numberDecimal: latitude }, TIME: timestamp, ...context } = v
      longitude = parseFloat(longitude)
      latitude = parseFloat(latitude)
      var {ORIGINALFLAG}=context
      ORIGINALFLAG=parseInt(ORIGINALFLAG)
      if(ORIGINALFLAG===186||ORIGINALFLAG===154){

      }else{
        if (isValidForLatitude(latitude) && isValidForLongitude(longitude)) {
          res.push({
            longitude,
            latitude,
            timestamp: moment.unix(timestamp / 1000).toISOString(),
            context,
          })
        }
      }
    })
    return res
  }

  const handleVehiclePageChange = (value) => {
    setVehicles([])
    getVehicles(NUMBER_PER_PAGE, (value - 1) * NUMBER_PER_PAGE)
  }

  const handleGantryPageChange = (value) => {
    setGantries([])
    getGantries(NUMBER_PER_PAGE, (value - 1) * NUMBER_PER_PAGE)
  }

  const handleVehicleButtonClick = (checked) => {
    const newselectVehicleRows = [...selectVehicleRows]
    for (const selectVehicleRow of selectVehicleRows) {
      if (checked.indexOf(selectVehicleRow.id) === -1) {
        const currentIndex = newselectVehicleRows.findIndex(element => element.id === selectVehicleRow.id)
        newselectVehicleRows.splice(currentIndex, 1)
      }
    }
    setSelectVehicleRows(newselectVehicleRows)
    if (newselectVehicleRows.length < checked.length) {
      var newSelectVehicleRows=[]
      for (const ckd of checked) {
        if (newselectVehicleRows.findIndex(element => element.id === ckd) === -1) {
          const row = vehicles.find(element => element.id === ckd)
          var positions = getPositions(row.info['PASSSTATION'])
          const currentIndex = positions.length - 1
          newSelectVehicleRows.push({
            id: ckd,
            position: currentIndex >= 0 ? positions[currentIndex] : {},
            path: positions,
            color: 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')',
            info: row.info
          })
        }
      }
      setSelectVehicleRows(prev=>{
        return[
          ...prev,
          ...newSelectVehicleRows
        ]
      })
    }
  }

  const handleGantryButtonClick = (checked) => {
    const newselectGantryRows = [...selectGantryRows]
    for (const selectGantryRow of selectGantryRows) {
      if (checked.indexOf(selectGantryRow.id) === -1) {
        const currentIndex = newselectGantryRows.findIndex(element => element.id === selectGantryRow.id)
        newselectGantryRows.splice(currentIndex, 1)
      }
    }
    if (newselectGantryRows.length < checked.length) {
      for (const ckd of checked) {
        if (newselectGantryRows.findIndex(element => element.id === ckd) === -1) {
          newselectGantryRows.push(gantries.find(g => g.id === ckd))
        }
      }
    }
    setSelectGantryRows(newselectGantryRows)
  }

  const handleQueryFilter = ({ queryType, queryFilter }) => {
    if (queryType === 'gantry') {
      CarReq.getGantries(10, 0, queryFilter).then(data => {
        let { items } = data
        const newSelectGantryRows = items.map(item => {
          const { _id } = item
          return {
            id: _id,
            position: {
              longitude: parseFloat(item['LONGITUDE']['$numberDecimal']),
              latitude: parseFloat(item['LATITUDE']['$numberDecimal'])
            },
            info: item
          }
        })
        setSelectGantryRows(prev=>{
          return[
            ...prev,
            ...newSelectGantryRows,
          ]
        })
      })
    } else if (queryType === 'vehicle') {
      CarReq.getVehicles(10, 0, queryFilter).then(data => {
        const { items } = data
        const newSelectVehicleRows = items.map(item => {
          var positions = getPositions(item['PASSSTATION'])
          const currentIndex = positions.length - 1
          return{
            id:item['_id'],
            position: currentIndex >= 0 ? positions[currentIndex] : {},
            path: positions,
            color: 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')',
            info: item
          }
        })
        setSelectVehicleRows(prev=>{
          return[
            ...prev,
            ...newSelectVehicleRows
          ]
        })
      })
    }
  }

  return (
    <Grid container spacing={2} className={classes.container}>
      <Grid item xs={3} className={classes.container}>
        <Box sx={{ width: '100%', height: '8%' }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <QueryFilter handleQueryFilter={handleQueryFilter} />
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={() => {
                  setSelectVehicleRows([])
                  setSelectGantryRows([])
                  setVehicleCheckedStatus({ checked: [] })
                  setGantryCheckedStatus({ checked: [] })
                }}
              >
                清除
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ width: '100%', height: '92%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered >
              <Tab label="车辆" {...a11yProps(0)} />
              <Tab label="门架" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0} className={classes.tabpanel}>
            <List
              title='车辆'
              rows={vehicles}
              handleButtonClick={handleVehicleButtonClick}
              checkedStatus={vehicleCheckedStatus}
              setCheckedStatus={setVehicleCheckedStatus}
              pageCount={vehiclePageCount}
              handlePageChange={handleVehiclePageChange}
            />

          </TabPanel>
          <TabPanel value={value} index={1} className={classes.tabpanel}>
            <List
              title='门架'
              rows={gantries}
              handleButtonClick={handleGantryButtonClick}
              checkedStatus={gantryCheckedStatus}
              setCheckedStatus={setGantryCheckedStatus}
              pageCount={gantryPageCount}
              handlePageChange={handleGantryPageChange}
            />
          </TabPanel>
        </Box>
      </Grid>
      <Grid item xs={9} className={classes.container}>
        <Map selectVehicleRows={selectVehicleRows} selectGantryRows={selectGantryRows} />
      </Grid>
    </Grid>

  )
}