import React from 'react';
import { render } from 'react-dom';
import { Map, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import { addressPoints } from './data/realworld.10000.js';

import { points, points2 } from "./data/data.js";

import axios from 'axios'

import "./app.css"

class MyHeatmap extends React.Component {

    // map properties
    state = {
      mapHidden: false,
      layerHidden: false,
      points: [],
      radius: 10,
      blur: 4,
      min: 0,
      max: 10,
      center: [41.390744, 2.163583],
      selectedKPI: [],
      loadedKPIs: [],
      loadedData: []
    };

    // gradient of heatmap (value to color matching)
    gradient = {
      0.1: '#89BDE0', 0.2: '#96E3E6', 0.4: '#82CEB6',
      0.6: '#FAF3A5', 0.8: '#F5D98B', 1.0: '#DE9A96'
    };

    dataLoaded = [];

    
  
    /**
     * Toggle limiting the address points to test behavior with refocusing/zooming when data points change
     */
    toggleLimitedAddressPoints() {
      if (this.state.limitAddressPoints) {
        this.setState({ addressPoints: addressPoints.slice(500, 1000), limitAddressPoints: false });
      } else {
        this.setState({ addressPoints, limitAddressPoints: true });
      }
    }

    setPoints(kpi) {
      const isLoadedKPI = this.state.loadedKPIs.includes(kpi);
      if (isLoadedKPI) {
        console.log("Data for " + kpi + " already requested");
        const ind = this.state.loadedKPIs.indexOf(kpi);
        const kpiData = this.state.loadedData[ind];

        this.setState({
          points: kpiData.points,
          min: kpiData.scale.min,
          max: kpiData.scale.max,
          selectedKPI: kpi
        });
      }
      else  {
        console.log("Request data for " + kpi);
        this.requestData(kpi);
      }
    }

    requestData(kpi) {
      axios.get('https://api.github.com/users/maecapozzi')
        .then(response => {
          if (kpi == "contenidors") response = points;
          else if (kpi == "verds") response = points2;
          else response = [];
          this.setState({loadedData: this.state.loadedData.concat([response])})
          this.setState({loadedKPIs: this.state.loadedKPIs.concat([kpi])})
          this.setPoints(kpi);
        })
    }
  
    render() {
      return (
        <div>
          <Map center={this.state.center} zoom={13}>
            {!this.state.layerHidden &&
                <HeatmapLayer
                  fitBoundsOnLoad
                  fitBoundsOnUpdate
                  points={this.state.points}
                  longitudeExtractor={m => m.longitude}
                  latitudeExtractor={m => m.latitude}
                  gradient={this.gradient}
                  intensityExtractor={m => parseFloat(m.value)}
                  radius={Number(this.state.radius)}
                  blur={Number(this.state.blur)}
                  max={Number.parseFloat(this.state.max)}
                />
              }
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            />
          </Map>

          <p>Selected KPI = {this.state.selectedKPI}</p>
          <p>Loaded KPIs = {this.state.loadedKPIs}</p>

          <div>
            <input
              type="button"
              value="Contenidors"
              onClick={() => this.setPoints("contenidors")}
            />
            <input
              type="button"
              value="Espais verds"
              onClick={() => this.setPoints("verds")}
            />
          </div>
            <input
              type="button"
              value="Call API"
              onClick={() => this.callApi()}
            />
        </div>
      );
    }
  
  }

export default MyHeatmap;