<template>
  <!-- root node required -->
  <div>
    <q-modal ref="locationModal" :content-css="{padding: '20px', minWidth: '50vw'}">
      <h5>Location conditions</h5>
      <canvas id="chart" width="600" height="400"></canvas>
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
    setupGraph () {
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
</style>
