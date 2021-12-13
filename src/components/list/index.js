import React from 'react'
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from '@mui/styles';
import Pagination from '@mui/material/Pagination'

const useStyle = makeStyles({
  container: {
    height: '100%',
    // boxShadow:'2px 2px 2px grey',
    borderRadius: '5px',
    overflow: 'scroll',
  },
  list: {
    height: '87%',
    marginBottom: '10px'
  },
  button: {
    width: '100%'
  },
  title: {
    margin: '10px',
    fontSize: '1.3rem'
  }
})

export default function CustomList({ title, rows, handleButtonClick, checkedStatus, setCheckedStatus, pageCount, handlePageChange }) {
  const classes = useStyle();

  const [checked, setChecked] = React.useState([])

  React.useEffect(() => {
    const { checked: newChecked } = checkedStatus
    setChecked(newChecked)
  }, [checkedStatus])

  const handleListItemClick = (row) => {
    const currentTarget = checked.indexOf(row.id)
    const newChecked = [...checked]
    if (currentTarget === -1) {
      newChecked.push(row.id)
    } else {
      newChecked.splice(currentTarget, 1)
    }
    setCheckedStatus({checked:newChecked})
  }



  return (
    <div className={classes.container}>
      <Grid container>
        <Grid item xs={6}>
          {/* <FormControlLabel
            control={<Checkbox checked={selectAll} onClick={handleSelectAll} />}
            label={title}
          /> */}
          <span className={classes.title}>{title}</span>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleButtonClick(checked)}
          >
            导入
          </Button>
        </Grid>
      </Grid>
      {/* <div className={classes.list}> */}
      <List dense>
        {rows.map(row => {
          return (
            <ListItem key={row.id} button onClick={() => handleListItemClick(row)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(row.id) !== -1}
                />
              </ListItemIcon>
              <ListItemText primary={row.id} />
            </ListItem>
          )
        })}
      </List>
      <Pagination
        count={pageCount}
        color="primary"
        onChange={(e, v) => {
          handlePageChange(v)
        }}
      />
    </div>
  )
}