import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Editor from '@monaco-editor/react';

export default function QueryFilter({ handleQueryFilter }) {
  const [open, setOpen] = React.useState(false)

  const [queryType, setQueryType] = React.useState('vehicle');

  const [queryFilter, setQueryFilter] = React.useState({});
  const editorRef = React.useRef(null);

  const handleQueryTypeChange = (event) => {
    const value = event.target.value
    setQueryType(value);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open)
  };

  return (
    <React.Fragment key={'left'}>
      <Button fullWidth variant="contained" color="primary" onClick={toggleDrawer(true)}>查找</Button>
      <Drawer
        anchor='left'
        open={open}
        onClose={toggleDrawer(false)}
      >
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={queryType}
            onChange={handleQueryTypeChange}
          >
            <MenuItem value={'vehicle'}>vehicle</MenuItem>
            <MenuItem value={'gantry'}>gantry</MenuItem>
          </Select>
        </FormControl>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <div style={{ width: '400px', height: '400px' }}>
              <Editor
                title="QueryFilter"
                language="json"
                value={JSON.stringify(queryFilter, null, 2)}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                }}
                onChange={(value, event) => { }}
              />
            </div>
          </Grid>
          <Grid item xs={6}>
            b
          </Grid>
        </Grid>
        <Button variant="contained" color="primary" onClick={() => {
          const newQueryFilter = JSON.parse(editorRef.current.getValue())
          setQueryFilter(newQueryFilter);
          handleQueryFilter({ queryType, queryFilter:newQueryFilter })
        }}>Query</Button>
      </Drawer>
    </React.Fragment>
  );
}
