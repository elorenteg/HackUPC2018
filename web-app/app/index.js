import React from 'react';
import { render } from 'react-dom';

import MapExample from "../src/MapExample";
import MyHeatmap from "../src/MyHeatmap";

render(
  <MyHeatmap />,
  document.getElementById('app')
);
