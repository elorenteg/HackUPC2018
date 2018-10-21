import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';

import { Row, Col } from 'react-flexbox-grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import axios from 'axios'

import "./app.css"

class MyHeatmap extends React.Component {

    map = null;
    
    ACTIVE_COLOR = "#3D5AFE";
    INACTIVE_COLOR = "#283593";

    OPTIONS = {
      OP1: "Air Quality - O3",
      OP2: "Air Quality - NO2",
      OP3: "Air Quality - PM10",
      OP4: "Touristic Homes"
    }
    OPTIONS_POINTS = {
      OP1: -10,
      OP2: -10,
      OP3: -10,
      OP4: -10
    }
    rows = [
      {id: "O3",    punctuation: this.OPTIONS_POINTS.OP1, mean: 0},
      {id: "NO2",   punctuation: this.OPTIONS_POINTS.OP2, mean: 0},
      {id: "PM10",  punctuation: this.OPTIONS_POINTS.OP3, mean: 0},
      {id: "Tourists",  punctuation: this.OPTIONS_POINTS.OP4, mean: 0}
    ];

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
      checked: [0],
      colors: {contaminacio: this.INACTIVE_COLOR, verds: this.INACTIVE_COLOR, contenidors: this.INACTIVE_COLOR}
    };
    selectedKPIs = [];
    loadedKPIs = [];
    loadedData = [];
    numClicksKPI = [];

    // gradient of heatmap (value to color matching)
    COLORS = {
      RED: "#DE9A96",
      ORANGE: "#F5D98B",
      YELLOW: "#FAF3A5",
      GREEN: "#82CEB6",
      LIGHT_BLUE: "#96E3E6",
      BLUE: "#89BDE0"
    };
    GRADIENT_1_BAD = {
      0: this.COLORS.YELLOW, 0.5: this.COLORS.ORANGE, 1.0: this.COLORS.RED
    };
    GRADIENT_1_GOOD = {
      0: this.COLORS.BLUE, 0.5: this.COLORS.LIGHT_BLUE, 1.0: this.COLORS.GREEN
    }

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
    }

    setPoints(kpi) {
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) {
        //console.log("Data for " + kpi + " already requested");
        const ind = this.loadedKPIs.indexOf(kpi);
        const kpiData = this.loadedData[ind];
        //console.log(kpiData);
        
        this.numClicksKPI[ind] = (this.numClicksKPI[ind] + 1)%2;
        const numClicks = this.numClicksKPI[ind];
        var colors = this.state.colors;
        if (numClicks == 1) colors[kpi] = this.ACTIVE_COLOR;
        else colors[kpi] = this.INACTIVE_COLOR;
        this.setState({ colors: colors });

        var numSelected = this.numClicksKPI.reduce((a, b) => a + b, 0);
        if (numSelected == 0) {
          this.setState({
            points: []
          });
          const indaux = this.selectedKPIs.indexOf(kpi);
          this.selectedKPIs.splice(indaux, 1);
        }
        else if (numSelected == 1) {
          this.setState({
            points: kpiData.points,
            min: kpiData.scale.min,
            max: kpiData.scale.max
          });
          //this.selectedKPIs.concat([kpi]);
          if (numClicks == 1) this.selectedKPIs = Array.from(new Set(this.selectedKPIs.concat([kpi])));
          else {
            const indaux = this.selectedKPIs.indexOf(kpi);
            this.selectedKPIs.splice(indaux, 1);
          }
        }
        else {
          // aggregate results by punctuation
          this.selectedKPIs = Array.from(new Set(this.selectedKPIs.concat([kpi])));

          this.setState({
            points: []
          });
        }
      }
      else  {
        //console.log("Request data for " + kpi);
        var colors = this.state.colors;
        colors[kpi] = this.ACTIVE_COLOR;
        this.setState({ colors: colors });
        this.requestData(kpi);
      }
      var gradient = this.GRADIENT_1_GOOD;
      if ([this.OPTIONS.OP1, this.OPTIONS.OP2, this.OPTIONS.OP3, this.OPTIONS.OP4].includes(kpi)) gradient = this.GRADIENT_1_BAD;
      this.setState({gradient: gradient});

      console.log(this.selectedKPIs);
    }

    requestData(kpi) {
      axios({
        method: 'post',
        url: 'https://cxi66ge4ng.execute-api.us-east-1.amazonaws.com/prod/',
        data: {
          "httpMethod":"GET",
          "queryStringParameters":{}
        }
      })
      .then(function (response) {
        var data = null;
        var ind = -1;
        if (kpi === this.OPTIONS.OP1) ind = 0;
        else if (kpi === this.OPTIONS.OP2) ind = 1;
        else if (kpi === this.OPTIONS.OP3) ind = 3;
        else if (kpi === this.OPTIONS.OP4) ind = 2;
        data = response.data.body.Items[ind];
        console.log(data);

        if (data !== null) {
          var sum = 0;
          var pond = 200;
          for (var i = 0; i < data.values.length; ++i) {
            sum = sum + data.values[i].val;
            data.values[i].longitude = data.values[i].lon.replace(",",".");
            data.values[i].latitude = data.values[i].lat.replace(",",".");
            if (kpi === this.OPTIONS.OP4) pond = 20;
            data.values[i].value = data.values[i].val*pond;
          }
          var ind = -1;
          if (kpi === this.OPTIONS.OP1) ind = 0;
          else if (kpi === this.OPTIONS.OP2) ind = 1;
          else if (kpi === this.OPTIONS.OP3) ind = 2;
          else if (kpi === this.OPTIONS.OP4) ind = 3;
          this.rows[ind].mean = Math.round(sum / data.values.length * 100) / 100;
          var newData = {
            points: data.values,
            scale: {
              min: parseFloat(data.range.min),
              max: parseFloat(data.range.max)
            }
          };
          this.loadedData = this.loadedData.concat([newData]);
          this.loadedKPIs = this.loadedKPIs.concat([kpi]);
          this.numClicksKPI = this.numClicksKPI.concat([0]);
          this.setPoints(kpi);
        }
        else {
          console.log("ERROR");
        }
      }.bind(this));
    }

    handleZoomEnd = () => {
      this.setState({zoom: this.map.leafletElement.getZoom()});
    }

    getRadius() {
      var currentZoom = this.state.zoom;
      var radius = this.state.radius * Math.pow(2, currentZoom - 12)*2;
      //console.log("R - " + currentZoom + " ---- " + radius);
      return (radius);
    }

    getBlur() {
      var currentZoom = this.state.zoom;
      var blur = this.state.blur * Math.pow(2, currentZoom - 12)*3;
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
                    KPIs Filter
                  </Typography>
                
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors[this.OPTIONS.OP1]}} 
                      onClick={() => this.setPoints(this.OPTIONS.OP1)}>
                      {this.OPTIONS.OP1}
                    </Button>
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors[this.OPTIONS.OP2]}}
                      onClick={() => this.setPoints(this.OPTIONS.OP2)}>
                      {this.OPTIONS.OP2}
                    </Button>
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors[this.OPTIONS.OP3]}}
                      onClick={() => this.setPoints(this.OPTIONS.OP3)}>
                      {this.OPTIONS.OP3}
                    </Button>
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors[this.OPTIONS.OP4]}}
                      onClick={() => this.setPoints(this.OPTIONS.OP4)}>
                      {this.OPTIONS.OP4}
                    </Button>
                  </div>
                </Paper>
              </div>
              <div style={{margin: "10px", width: "90%", marginLeft: "20px"}}>
                <Paper className="paper" id="block" elevation={1} style={{paddingBottom: "10px"}}>
                  <Typography variant="h5" component="h3">
                    Overall
                  </Typography>

                  <Table className="table">
                    <TableHead>
                      <TableRow>
                        <TableCell>KPI</TableCell>
                        <TableCell numeric>Punctuation</TableCell>
                        <TableCell numeric>Mean</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.rows.map(row => {
                        return (
                          <TableRow key={row.id}>
                            <TableCell>
                              {row.id}
                            </TableCell>
                            <TableCell numeric>{row.punctuation}</TableCell>
                            <TableCell numeric>{row.mean}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>
              </div>
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
                      gradient={this.state.gradient}
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