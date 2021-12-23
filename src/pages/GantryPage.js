import React from 'react'
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import { CarReq } from '../requests';
import { List, GantryMap } from '../components';
import Box from '@mui/material/Box';
import moment from 'moment';
import Button from '@mui/material/Button';
import QueryFilter from '../components/QueryFilter/QueryFilter';

var _ = require('lodash')

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
  box: {
    marginTop: '10px'
  }
})

const NUMBER_PER_PAGE = 13

export default function GantryPage() {
  const classes = useStyle();

  const [gantries, setGantries] = React.useState([])
  const [selectGantryRows, setSelectGantryRows] = React.useState([])
  const [gantryCheckedStatus, setGantryCheckedStatus] = React.useState({ checked: [] })
  const [gantryPageCount, setGantryPageCount] = React.useState(0)

  React.useEffect(() => {
    getGantries(NUMBER_PER_PAGE)
  }, [])

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

  const handleGantryButtonClick = (checked) => {
    const newselectGantryRows = []
    if (newselectGantryRows.length < checked.length) {
      for (const ckd of checked) {
        if (newselectGantryRows.findIndex(element => element.id === ckd) === -1) {
          const row = gantries.find(g => g.id === ckd)
          if (row) {
            newselectGantryRows.push(row)
          }
        }
      }
    }
    setSelectGantryRows(newselectGantryRows)
  }


  const handleGantryPageChange = (value) => {
    setGantries([])
    getGantries(NUMBER_PER_PAGE, (value - 1) * NUMBER_PER_PAGE)
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
        setSelectGantryRows(prev => {
          return [
            ...prev,
            ...newSelectGantryRows,
          ]
        })
      })
    }
  }

  const clearAllTypeSelectedRows = () => {
    setSelectGantryRows([])
    setGantryCheckedStatus({ checked: [] })
  }

  return (
    <Grid container spacing={2} className={classes.container}>
      <Grid item xs={2} className={classes.container}>
        <Box sx={{ width: '100%', height: '8%' }} className={classes.box}>
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
                  clearAllTypeSelectedRows()
                }}
              >
                清除
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ width: '100%', height: '92%' }} className={classes.box}>
          <List
            title='门架'
            rows={gantries}
            handleButtonClick={handleGantryButtonClick}
            checkedStatus={gantryCheckedStatus}
            setCheckedStatus={setGantryCheckedStatus}
            pageCount={gantryPageCount}
            handlePageChange={handleGantryPageChange}
          />
        </Box>
      </Grid>
      <Grid item xs={10} className={classes.container}>
        <GantryMap selectedGantries={selectGantryRows} clearAllTypeSelectedRows={clearAllTypeSelectedRows} />
      </Grid>
    </Grid>

  )
}