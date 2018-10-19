<template>
  <!-- root node required -->
  <div>
    <q-modal ref="locationModal" :content-css="{padding: '20px', minWidth: '75vw', maxWidth: '75vw'}">
      <h5 class="text-center">Wind speed</h5>
      <canvas id="chart" height="200" width="600"></canvas>
      <h5 class="text-center">Wind direction</h5>
      <div class="text-center" v-if="feature">
        <span v-for="(direction, i) in feature.properties.windDirection">
            <span style="font-size: 0.5em;">
              <span class="vertical-text">{{ formatDateTime(feature.forecastTime[i]) }}</span>
            </span>
            <span style="font-size: 1.5em;">
              <i :style="`transform: rotateZ(${direction}deg);`">arrow_downward</i>
              <q-tooltip anchor="bottom middle" self="top middle">{{ feature.properties.windDirection[i] }}</q-tooltip>
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
  methods: {
    formatDateTime (time) {
      return moment.utc(time).format('MM/DD HH:mm')
    },
    setupGraph () {
      // Destroy previous graph if any
      if (this.chart) this.chart.destroy()
      const color = Chart.helpers.color
      const config = {
        type: 'line',
        data: {
          labels: this.feature.forecastTime.map(time => new Date(time)),
          datasets: [{
            label: 'Wind gust',
            backgroundColor: color('rgb(255, 99, 132)').alpha(0.5).rgbString(),
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            data: this.feature.properties.gust
          }, {
            label: 'Wind speed',
            backgroundColor: color('rgb(255, 159, 64)').alpha(0.5).rgbString(),
            borderColor: 'rgb(255, 159, 64)',
            fill: false,
            data: this.feature.properties.windSpeed
          }]
        },
        options: {
          title: {
            text: 'Local conditions'
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
                tooltipFormat: 'MM/DD HH:mm'
              },
              scaleLabel: {
                display: false,
                labelString: 'Date'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: '(m/s)'
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
