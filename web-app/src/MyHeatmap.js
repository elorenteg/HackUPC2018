import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';

import { points, points2, points3 } from "./data/data.js";

import { Grid, Row, Col } from 'react-flexbox-grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import axios from 'axios'

import "./app.css"

class MyHeatmap extends React.Component {

    map = null;

    // map properties
    state = {
      mapHidden: false,
      layerHidden: false,
      points: [],
      zoom: 13,
      radius: 10,
      blur: 20,
      min: 0,
      max: 10,
      center: [41.390744, 2.163583],
      selectedKPI: [],
      loadedKPIs: [],
      loadedData: [],
      checked: [0]
    };

    loadedKPIs = [];
    loadedData = [];
    numClicksKPI = [];

    // gradient of heatmap (value to color matching)
    gradient = {
      0.1: '#89BDE0', 0.2: '#96E3E6', 0.4: '#82CEB6',
      0.6: '#FAF3A5', 0.8: '#F5D98B', 1.0: '#DE9A96'
    };

    handleToggle = value => () => {
      const { checked } = this.state;
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      this.setState({
        checked: newChecked,
      });
    };

    setPoints(kpi) {
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) {
        console.log("Data for " + kpi + " already requested");
        const ind = this.loadedKPIs.indexOf(kpi);
        const kpiData = this.loadedData[ind];

        this.numClicksKPI[ind] = (this.numClicksKPI[ind] + 1)%2;
        const numClicks = this.numClicksKPI[ind];
        console.log(numClicks);

        if (numClicks == 0) {
          this.setState({
            points: []
          });
        }
        else {
          this.setState({
            points: kpiData.points,
            min: kpiData.scale.min,
            max: kpiData.scale.max,
            selectedKPI: kpi
          });
        }
      }
      else  {
        console.log("Request data for " + kpi);
        this.requestData(kpi);
      }
    }

    requestData(kpi) {
      /*
      axios.get('https://correuv2.upc.edu/SOGo/')
        .then(response => {
          
        })
        */

      const response = null;
      if (kpi == "contenidors") response = points;
      else if (kpi == "verds") response = points2;
      else if (kpi == "contaminacio") {
        response = points3;
        for (var i = 0; i < response.points.length; ++i) {
          response.points[i].longitude = response.points[i].longitude.replace(",",".");
          response.points[i].latitude = response.points[i].latitude.replace(",",".");
          response.points[i].value = response.points[i].value*1000;
        }
      }
      else response = [];
      this.loadedData = this.loadedData.concat([response]);
      this.loadedKPIs = this.loadedKPIs.concat([kpi]);
      this.numClicksKPI = this.numClicksKPI.concat([0]);
      this.setPoints(kpi);
    }

    handleZoomEnd = () => {
      this.setState({zoom: this.map.leafletElement.getZoom()});
    }

    getRadius() {
      var currentZoom = this.state.zoom;
      var radius = this.state.radius * Math.pow(2, currentZoom - 12);
      //console.log("R - " + currentZoom + " ---- " + radius);
      return (radius);
    }

    getBlur() {
      var currentZoom = this.state.zoom;
      var blur = this.state.blur * Math.pow(2, currentZoom - 12);
      //console.log("Z - " + currentZoom + " ---- " + blur);
      return (blur);
    }
  
    render() {
      return (
        <div>
          <Row>
            <Col xs={12} sm={6} md={3} lg={3}>
              <div style={{margin: "10px", width: "90%", marginLeft: "20px"}}>
                <Paper className="paper" id="block" elevation={1} style={{paddingBottom: "10px"}}>
                  <Typography variant="h5" component="h3">
                    Options
                  </Typography>
                  
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" onClick={() => this.setPoints("contenidors")}>
                      Contenidors
                    </Button>
                  </div>

                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" onClick={() => this.setPoints("verds")}>
                      Espais verds
                    </Button>
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" onClick={() => this.setPoints("contaminacio")}>
                      Contaminació
                    </Button>
                  </div>

                </Paper>


                
              </div>
              <p>Selected KPI = {this.state.selectedKPI}</p>
              <p>Loaded KPIs = {this.loadedKPIs}</p>
            </Col>
            <Col xs={6} sm={6} md={8} lg={9}>
                <Map center={this.state.center} zoom={this.state.zoom} maxZoom={16} ref={(ref) => { this.map = ref; }} onZoomEnd={this.handleZoomEnd}>
                {!this.state.layerHidden &&
                    <HeatmapLayer
                      //fitBoundsOnLoad
                      //fitBoundsOnUpdate
                      points={this.state.points}
                      longitudeExtractor={m => parseFloat(m.longitude)}
                      latitudeExtractor={m => parseFloat(m.latitude)}
                      gradient={this.gradient}
                      intensityExtractor={m => parseFloat(m.value)}
                      scaleRadius={this.state.scaleRadius}
                      radius={this.getRadius()}
                      blur={this.getBlur()}
                      max={Number.parseFloat(this.state.max)}
                    />
                  }
                <TileLayer
                  url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                />
              </Map>
            </Col>
          </Row>
        </div>
      );
    }
  
  }

export default MyHeatmap;