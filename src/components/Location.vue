<template>
  <!-- root node required -->
  <div>
    <q-modal ref="locationModal" :content-css="{padding: '20px', minWidth: '75vw', maxWidth: '75vw'}">
      <h5 class="text-center">Timeseries at {{location}}</h5>
      <canvas id="chart" height="200" width="600"></canvas>
      <h5 class="text-center">Wind direction</h5>
      <div class="text-center" v-if="feature">
        <span v-for="(direction, i) in feature.properties.windDirection">
            <span style="font-size: 0.5em;">
              <span class="vertical-text">{{ formatDateTime(feature.forecastTime.windDirection[i]) }}</span>
            </span>
            <span style="font-size: 1.5em;">
              <i :style="`transform: rotateZ(${direction}deg);`">arrow_downward</i>
              <q-tooltip anchor="bottom middle" self="top middle">{{ feature.properties.windDirection[i].toFixed(2) }}°</q-tooltip>
            </span>
        </span>
      </div>
      </br>
      </br>
      </br>
      <div class="row float-right">
        <button class="orange clear" @click="$refs.locationModal.close()">Close</button>
      </div>
    </q-modal>
    <button v-show="feature" class="white circular absolute-bottom-right" style="margin-bottom: 12em; margin-right: 1em" @click="$refs.locationModal.open()">
      <i>timeline</i>
    </button>
  </div>
</template>

<script>

import _ from 'lodash'
import moment from 'moment'
import Chart from 'chart.js'

export default {
  props: ['feature'],
  data () {
    return {}
  },
  watch: {
    feature: function (feature) {
      this.setupGraph()
    }
  },
  computed: {
    location: function () {
      if (!this.feature) return ''
      else {
        return this.feature.properties.iata_code
        ? this.feature.properties.iata_code
        : this.feature.geometry.coordinates[0].toFixed(2) + '°, ' + this.feature.geometry.coordinates[1].toFixed(2) + '°'
      }
    }
  },
  methods: {
    formatDateTime (time) {
      return moment.utc(time).format('MM/DD HH:mm')
    },
    setupGraph () {
      // Destroy previous graph if any
      if (this.chart) this.chart.destroy()
      const color = Chart.helpers.color
      const forecastTime = this.feature.forecastTime
      const properties = this.feature.properties
      // Make union of all available times for x-axis
      let times = _.union(forecastTime.gust, forecastTime.windSpeed, forecastTime.precipitations)
        .map(time => moment.utc(time))
        .sort((a, b) => a - b)

      const config = {
        type: 'line',
        data: {
          labels: times,
          datasets: [{
            label: 'Wind gust',
            backgroundColor: color('rgb(255, 99, 132)').alpha(0.5).rgbString(),
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            data: properties.gust.map((value, index) => ({ x: new Date(forecastTime.gust[index]), y: value })),
            yAxisID: 'speed'
          }, {
            label: 'Wind speed',
            backgroundColor: color('rgb(255, 159, 64)').alpha(0.5).rgbString(),
            borderColor: 'rgb(255, 159, 64)',
            fill: false,
            data: properties.windSpeed.map((value, index) => ({ x: new Date(forecastTime.windSpeed[index]), y: value })),
            yAxisID: 'speed'
          }, {
            label: 'Precipitations',
            backgroundColor: color('rgb(54, 162, 235)').alpha(0.5).rgbString(),
            borderColor: 'rgb(54, 162, 235)',
            fill: false,
            data: properties.precipitations.map((value, index) => ({ x: new Date(forecastTime.precipitations[index]), y: value })),
            yAxisID: 'precipitations'
          }]
        },
        options: {
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => {
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel.toFixed(2)
              }
            }
          },
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: 'hour',
                stepSize: 3,
                displayFormats: {
                  hour: 'MM/DD HH:mm'
                },
                tooltipFormat: 'MM/DD HH:mm',
                parser: (date) => moment.utc(typeof date === 'number' ? date : date.toISOString())
              },
              scaleLabel: {
                display: false,
                labelString: 'Date'
              }
            }],
            yAxes: [{
              id: 'speed',
              position: 'left',
              scaleLabel: {
                display: true,
                labelString: 'm/s'
              }
            }, {
              id: 'precipitations',
              position: 'right',
              scaleLabel: {
                display: true,
                labelString: 'mm (last 3h)'
              }
            }]
          }
        }
      }
      this.chart = new Chart('chart', config)
    }
  }
}
</script>

<style>
.vertical-text {
    writing-mode: vertical-rl;
    transform: rotate(-120deg);
    transform-origin: 150% 110%;
}
</style>
