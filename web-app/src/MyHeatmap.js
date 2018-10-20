import React from 'react';
import { render } from 'react-dom';
import { Map, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import { addressPoints } from './data/realworld.10000.js';

import { points, points2 } from "./data/data.js";

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
      center: [41.390744, 2.163583]
    };

    // gradient of heatmap (value to color matching)
    gradient = {
      0.1: '#89BDE0', 0.2: '#96E3E6', 0.4: '#82CEB6',
      0.6: '#FAF3A5', 0.8: '#F5D98B', 1.0: '#DE9A96'
    };

    
  
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
      if (kpi == "contenidors") {
        this.setState({
          points: points.points,
          min: points.scale.min,
          max: points.scale.max
        });
      }
      else if (kpi == "verds") {
        this.setState({
          points: points2.points,
          min: points2.scale.min,
          max: points2.scale.max
        });
      }
      else {
        this.setState({
          points: [],
          min: 0,
          max: 1
        });
      }
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
            <input
              type="button"
              value="Res"
              onClick={() => this.setPoints()}
            />
          </div>
        </div>
      );
    }
  
  }

export default MyHeatmap;