import React from 'react';
import { Map, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';

import { Row, Col } from 'react-flexbox-grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/lab/Slider';
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

    ACTIVE_COLOR = "#00BFA5";
    INACTIVE_COLOR = "#006064";

    OPTIONS = {
      OP1: "Air Quality - O3",
      OP2: "Air Quality - NO2",
      OP3: "Air Quality - PM10",
      OP4: "Touristic Homes",
      OP5: "Rental Mean Price",
      OP6: "Trees"
    }
    OPTIONS_POINTS = {
      OP1: -10,
      OP2: -10,
      OP3: -10,
      OP4: -10,
      OP5: -10,
      OP6: -10
    }
    OPTIONS_COLORS = {
      OP1: this.INACTIVE_COLOR,
      OP2: this.INACTIVE_COLOR,
      OP3: this.INACTIVE_COLOR,
      OP4: this.INACTIVE_COLOR,
      OP5: this.INACTIVE_COLOR,
      OP6: this.INACTIVE_COLOR
    }

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
      colors: this.OPTIONS_COLORS,
      punctuation: this.OPTIONS_POINTS,
      valueSlider: 0
    };
    ponderationSelected = 1;
    selectedKPIs = [];
    loadedKPIs = [];
    loadedData = [];
    numClicksKPI = [];

    rows = [
      {id: "O3",        punctuation: this.OPTIONS_POINTS.OP1, mean: 0},
      {id: "NO2",       punctuation: this.OPTIONS_POINTS.OP2, mean: 0},
      {id: "PM10",      punctuation: this.OPTIONS_POINTS.OP3, mean: 0},
      {id: "Tourists",  punctuation: this.OPTIONS_POINTS.OP4, mean: 0},
      {id: "Rent",      punctuation: this.OPTIONS_POINTS.OP5, mean: 0},
      {id: "Trees",     punctuation: this.OPTIONS_POINTS.OP6, mean: 0}
    ];

    // gradient of heatmap (value to color matching)
    COLORS = {
      RED: "#C62828",
      ORANGE: "#FF9800",
      YELLOW: "#FAF3A5",
      GREEN: "#82CEB6",
      LIGHT_BLUE: "#96E3E6",
      BLUE: "#89BDE0"
    };
    GRADIENT_BAD = {
      0: this.COLORS.YELLOW, 0.5: this.COLORS.ORANGE, 1.0: this.COLORS.RED
    };
    GRADIENT_GOOD = {
      0: this.COLORS.BLUE, 0.5: this.COLORS.LIGHT_BLUE, 1.0: this.COLORS.GREEN
    };
    GRADIENT_POINTS = {
      0: this.COLORS.RED, 0.5: this.COLORS.LIGHT_BLUE, 1.0: this.COLORS.GREEN
    }

    clearPoints() {
      this.setState({
        points: []
      });
    }

    updatePoints(kpiData) {
      this.setState({
        points: kpiData.points,
        min: kpiData.scale.min,
        max: kpiData.scale.max
      });
    }

    updateColor(kpi, isActive) {
      var color = this.INACTIVE_COLOR;
      if (isActive) color = this.ACTIVE_COLOR;
      this.setColor(kpi, color);
    }

    updateGradient(isAggregate, actKPI) {
      var gradient = this.GRADIENT_GOOD;
      if (isAggregate) gradient = this.GRADIENT_POINTS;
      else if ([this.OPTIONS.OP1, this.OPTIONS.OP2, this.OPTIONS.OP3, this.OPTIONS.OP4, this.OPTIONS.OP5].includes(actKPI)) gradient = this.GRADIENT_BAD;
      this.setState({gradient: gradient});
    }

    removeSelected(kpi) {
      const ind = this.selectedKPIs.indexOf(kpi);
      this.selectedKPIs.splice(ind, 1);
    }

    addSelected(kpi) {
      this.selectedKPIs = Array.from(new Set(this.selectedKPIs.concat([kpi])));
    }

    setPoints(kpi) {
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) {
        //console.log("Data for " + kpi + " already requested");
        const ind = this.loadedKPIs.indexOf(kpi);
        const kpiData = this.loadedData[ind];
        //console.log(kpiData);

        var previousSelected = this.numClicksKPI.reduce((a, b) => a + b, 0);

        this.numClicksKPI[ind] = (this.numClicksKPI[ind] + 1)%2;
        const numClicks = this.numClicksKPI[ind];
        this.updateColor(kpi, numClicks == 1);

        var actualSelected = this.numClicksKPI.reduce((a, b) => a + b, 0);
        this.ponderationSelected = -1;
        if (actualSelected == 0) {
          this.clearPoints();
          this.removeSelected(kpi);
          this.updateGradient(false, kpi);
        }
        else if (actualSelected == 1) {
          if (numClicks == 1) {
            // current clicked is the only active
            this.addSelected(kpi);
            if (kpi === this.OPTIONS.OP4) this.ponderationSelected = 1;
            this.updateGradient(false, kpi);
          }
          else {
            // current clicked was deselected and the current active is another
            this.removeSelected(kpi);
            if (this.selectedKPIs[0] === this.OPTIONS.OP4) this.ponderationSelected = 1;

            // find current active
            ind = this.loadedKPIs.indexOf(this.selectedKPIs[0]);
            kpiData = this.loadedData[ind];
            this.updateGradient(false, this.selectedKPIs[0]);
          }
          this.updatePoints(kpiData);
        }
        else {
          // aggregate results by punctuation
          if (actualSelected > previousSelected) this.addSelected(kpi);
          else this.removeSelected(kpi);
          //this.clearPoints();

          kpiData = {points: [], scale: {min: 0, max: 1}};
          for (var i = 0; i < this.selectedKPIs.length; ++i) {
            var selected = this.selectedKPIs[i];
            ind = this.loadedKPIs.indexOf(selected);
            var data = this.loadedData[ind];

            var punctuation = -1;
            if (selected == this.OPTIONS.OP1) punctuation = this.state.punctuation.OP1;
            else if (selected == this.OPTIONS.OP2) punctuation = this.state.punctuation.OP2;
            else if (selected == this.OPTIONS.OP3) punctuation = this.state.punctuation.OP3;
            else if (selected == this.OPTIONS.OP4) punctuation = this.state.punctuation.OP4 / 2;
            else if (selected == this.OPTIONS.OP5) punctuation = this.state.punctuation.OP5 / 2;
            else if (selected == this.OPTIONS.OP65) punctuation = this.state.punctuation.OP6;

            var points = JSON.parse(JSON.stringify(data.points))
            var min = data.scale.min;
            var max = data.scale.max;
            for (var j = 0; j < points.length; ++j) {
              points[j].val = (points[j].val - min)/(max-min) * punctuation;
            }

            if (punctuation < 0) kpiData.scale.min = kpiData.scale.min + punctuation;
            else kpiData.scale.max = kpiData.scale.max + punctuation;

            kpiData.points = kpiData.points.concat(points);
            this.updatePoints(kpiData);
            this.updateGradient(true, kpi);
          }
        }
      }
      else  {
        //console.log("Request data for " + kpi);
        this.updateColor(kpi, true);
        this.requestData(kpi);
      }
    }

    

    setPoints2(kpi) {
      const ind = this.loadedKPIs.indexOf(kpi);
      const kpiData = this.loadedData[ind];

      var actualSelected = this.numClicksKPI.reduce((a, b) => a + b, 0);
      const numClicks = this.numClicksKPI[ind];
      
      if (actualSelected >= 2) {
        // aggregate results by punctuation
        kpiData = {points: [], scale: {min: 0, max: 1}};
        for (var i = 0; i < this.selectedKPIs.length; ++i) {
          var selected = this.selectedKPIs[i];
          ind = this.loadedKPIs.indexOf(selected);
          var data = this.loadedData[ind];

          var punctuation = -1;
          if (selected == this.OPTIONS.OP1) punctuation = this.state.punctuation.OP1;
          else if (selected == this.OPTIONS.OP2) punctuation = this.state.punctuation.OP2;
          else if (selected == this.OPTIONS.OP3) punctuation = this.state.punctuation.OP3;
          else if (selected == this.OPTIONS.OP4) punctuation = this.state.punctuation.OP4 / 5;
          else if (selected == this.OPTIONS.OP5) punctuation = this.state.punctuation.OP5 / 5;
          else if (selected == this.OPTIONS.OP6) punctuation = this.state.punctuation.OP6;

          var points = JSON.parse(JSON.stringify(data.points))
          var min = data.scale.min;
          var max = data.scale.max;
          for (var j = 0; j < points.length; ++j) {
            points[j].val = (points[j].val - min)/(max-min) * punctuation;
          }

          if (punctuation < 0) kpiData.scale.min = kpiData.scale.min + punctuation;
          else kpiData.scale.max = kpiData.scale.max + punctuation;

          kpiData.points = kpiData.points.concat(points);
          this.updatePoints(kpiData);
          this.updateGradient(true, kpi);
        }
      }
    }

    setImportance(valueSlider, value) {
      this.setState({
        valueSlider: value
      });
    };

    handleDragStop = (e, value) => { this.setPoints(this.OPTIONS.OP1) };

    handleChangeOP1 = (e, value) => {
      this.updateSlider(0, value);
      var kpi = this.OPTIONS.OP1;
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) this.setPoints2(kpi);
    };
    handleChangeOP2 = (e, value) => {
      this.updateSlider(1, value);
      var kpi = this.OPTIONS.OP2;
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) this.setPoints2(kpi);
    };
    handleChangeOP3 = (e, value) => {
      this.updateSlider(2, value);
      var kpi = this.OPTIONS.OP3;
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) this.setPoints2(kpi);
    };
    handleChangeOP4 = (e, value) => {
      this.updateSlider(3, value);
      var kpi = this.OPTIONS.OP4;
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) this.setPoints2(kpi);
    };
    handleChangeOP5 = (e, value) => {
      this.updateSlider(4, value);
      var kpi = this.OPTIONS.OP5;
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) this.setPoints2(kpi);
    };
    handleChangeOP6 = (e, value) => {
      this.updateSlider(5, value);
      var kpi = this.OPTIONS.OP6;
      const isLoadedKPI = this.loadedKPIs.includes(kpi);
      if (isLoadedKPI) this.setPoints2(kpi);
    };
    updateSlider(id, value) {
      var points = this.state.punctuation;
      if (id == 0) points.OP1 = value;
      else if (id == 1) points.OP2 = value;
      else if (id == 2) points.OP3 = value;
      else if (id == 3) points.OP4 = value;
      else if (id == 4) points.OP5 = value;
      else if (id == 5) points.OP6 = value;
      this.setState({punctuation: points});
      this.rows[id].punctuation = Math.round(value);
    }

    requestData(kpi) {
      axios({
        method: 'post',
        url: 'https://cxi66ge4ng.execute-api.us-east-1.amazonaws.com/prod/',
        data: {
          "httpMethod":"GET",
          "queryStringParameters":{},
          "filter": kpi
        }
      })
      .then(function (response) {
        var data = response.data.body[0];

        if (data !== null) {
          var sum = 0;
          //var pond = 200;
          //var pond = 1;
          var max = Math.max.apply(Math, data.values.map(function(o) { return o.val; }))
          for (var i = 0; i < data.values.length; ++i) {
            sum = sum + data.values[i].val;
            data.values[i].lon = data.values[i].lon.replace(",",".");
            data.values[i].lat = data.values[i].lat.replace(",",".");
            //if (kpi === this.OPTIONS.OP4) pond = 0.5;
            //data.values[i].value = data.values[i].val*pond;
            data.values[i].val = (data.values[i].val - data.range.min)/(max-data.range.min);
            data.values[i].val = data.values[i].val*10;
          }
          data.range.min = 0;
          data.range.max = 1;
          var ind = -1;
          if (kpi === this.OPTIONS.OP1) ind = 0;
          else if (kpi === this.OPTIONS.OP2) ind = 1;
          else if (kpi === this.OPTIONS.OP3) ind = 2;
          else if (kpi === this.OPTIONS.OP4) ind = 3;
          else if (kpi === this.OPTIONS.OP5) ind = 4;
          else if (kpi === this.OPTIONS.OP6) ind = 5;
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
      var pond = 2;
      if (this.ponderationSelected > 0) pond = 1;
      var radius = this.state.radius * Math.pow(2, currentZoom - 12)*pond;
      //console.log("R - " + currentZoom + " ---- " + radius);
      return (radius);
    }

    getBlur() {
      var currentZoom = this.state.zoom;
      var pond = 3;
      if (this.ponderationSelected > 0) pond = 2;
      var blur = this.state.blur * Math.pow(2, currentZoom - 12)*pond;
      return (blur);
    }

    setColor(option, newColor) {
      var color = null;
      if (option == this.OPTIONS.OP1) this.OPTIONS_COLORS.OP1 = newColor;
      else if (option == this.OPTIONS.OP2) this.OPTIONS_COLORS.OP2 = newColor;
      else if (option == this.OPTIONS.OP3) this.OPTIONS_COLORS.OP3 = newColor;
      else if (option == this.OPTIONS.OP4) this.OPTIONS_COLORS.OP4 = newColor;
      else if (option == this.OPTIONS.OP5) this.OPTIONS_COLORS.OP5 = newColor;
      else if (option == this.OPTIONS.OP6) this.OPTIONS_COLORS.OP6 = newColor;
      this.setState({colors: this.OPTIONS_COLORS});
    }

    render() {
      return (
        <div>
          <Row>
            <Col xs={12} sm={6} md={3} lg={3}>
            <div style={{margin: "10px", width: "90%", marginLeft: "20px"}}>
                <Paper className="paper" id="block" elevation={1} style={{paddingTop: "5px", paddingBottom: "10px"}}>
                  <Typography variant="h5" component="h3">
                    KPIs Filter
                  </Typography>

                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors.OP1}}
                      onClick={() => this.setPoints(this.OPTIONS.OP1)}>
                      {this.OPTIONS.OP1}
                    </Button>
                  </div>
                  <div style={{marginLeft: "25px", width: "82%"}}>
                    <Slider
                      style={{padding: '10px 0px'}}
                      min={-10} max={10}
                      value={this.state.punctuation.OP1}
                      aria-labelledby="label"
                      onChange={this.handleChangeOP1}
                      onDragOver={this.handleDragStop}
                    />
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors.OP2}}
                      onClick={() => this.setPoints(this.OPTIONS.OP2)}>
                      {this.OPTIONS.OP2}
                    </Button>
                  </div>
                  <div style={{marginLeft: "25px", width: "82%"}}>
                    <Slider
                      style={{padding: '10px 0px'}}
                      min={-10} max={10}
                      value={this.state.punctuation.OP2}
                      aria-labelledby="label"
                      onChange={this.handleChangeOP2}
                    />
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors.OP3}}
                      onClick={() => this.setPoints(this.OPTIONS.OP3)}>
                      {this.OPTIONS.OP3}
                    </Button>
                  </div>
                  <div style={{marginLeft: "25px", width: "82%"}}>
                    <Slider
                      style={{padding: '10px 0px'}}
                      min={-10} max={10}
                      value={this.state.punctuation.OP3}
                      aria-labelledby="label"
                      onChange={this.handleChangeOP3}
                    />
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors.OP4}}
                      onClick={() => this.setPoints(this.OPTIONS.OP4)}>
                      {this.OPTIONS.OP4}
                    </Button>
                  </div>
                  <div style={{marginLeft: "25px", width: "82%"}}>
                    <Slider
                      style={{padding: '10px 0px'}}
                      min={-10} max={10}
                      value={this.state.punctuation.OP4}
                      aria-labelledby="label"
                      onChange={this.handleChangeOP4}
                    />
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors.OP5}}
                      onClick={() => this.setPoints(this.OPTIONS.OP5)}>
                      {this.OPTIONS.OP5}
                    </Button>
                  </div>
                  <div style={{marginLeft: "25px", width: "82%"}}>
                    <Slider
                      style={{padding: '10px 0px'}}
                      min={-10} max={10}
                      value={this.state.punctuation.OP5}
                      aria-labelledby="label"
                      onChange={this.handleChangeOP5}
                    />
                  </div>
                  <div style={{margin: "10px", width: "92%"}}>
                    <Button variant="contained" color="primary" id="block" style={{backgroundColor: this.state.colors.OP6}}
                      onClick={() => this.setPoints(this.OPTIONS.OP6)}>
                      {this.OPTIONS.OP6}
                    </Button>
                  </div>
                  <div style={{marginLeft: "25px", width: "82%"}}>
                    <Slider
                      style={{padding: '10px 0px'}}
                      min={-10} max={10}
                      value={this.state.punctuation.OP6}
                      aria-labelledby="label"
                      onChange={this.handleChangeOP6}
                    />
                  </div>
                </Paper>
              </div>
              <div style={{margin: "10px", width: "90%", marginLeft: "20px"}}>
                <Paper className="paper" id="block" elevation={1} style={{paddingTop: "5px", paddingBottom: "10px"}}>
                  <Typography variant="h5" component="h3">
                    Overall
                  </Typography>

                  <Table className="table">
                    <TableHead>
                      <TableRow>
                        <TableCell>KPI</TableCell>
                        <TableCell numeric>Punctuation</TableCell>
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
                      longitudeExtractor={m => parseFloat(m.lon)}
                      latitudeExtractor={m => parseFloat(m.lat)}
                      gradient={this.state.gradient}
                      intensityExtractor={m => parseFloat(m.val)}
                      scaleRadius={this.state.scaleRadius}
                      radius={this.getRadius()}
                      blur={this.getBlur()}
                      min={Number.parseFloat(this.state.min)}
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
