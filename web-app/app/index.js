import React from 'react';
import { render } from 'react-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import MapExample from "../src/MapExample";
import MyHeatmap from "../src/MyHeatmap";

render(
  <div>
    <div className="app-bar">
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton className="app-bar-button" color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit">
            City Analysis
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
    <MyHeatmap />
  </div>,
  document.getElementById('app')
);
