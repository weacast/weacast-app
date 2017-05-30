<template>
  <!-- root node required -->
  <div>
    <q-modal ref="windModal" @close="searchWindConditions()" :content-css="{padding: '20px', minWidth: '30vw'}">
      <h5>Wind conditions</h5>
      <div>
        <div class="row justify-around">
          <div>
            <p class="caption">Wind speed (m/s)</p>
            <q-range v-model="windSpeed" :min="0" :max="20" :step="0.5" label></q-range>
          </div>
          <div>
            <p class="caption">Wind direction (°)</p>
            <q-knob v-model="windDirection" :placeholder="windDirection+'°'" :min="0" :max="360"></q-knob>
          </div>
        </div>
        <div class="row justify-around">
          <div>
            <p class="caption">Label property</p>
            <q-dialog-select
              type="radio"
              v-model="labelProperty"
              :options="getProbePropertyList()"
              ok-label="OK"
              cancel-label="Cancel"
              title="Label property"
            ></q-dialog-select>
          </div>
          <div>
            <p class="caption">Direction property</p>
            <q-dialog-select
              type="radio"
              v-model="windProperty"
              :options="getProbePropertyList()"
              ok-label="OK"
              cancel-label="Cancel"
              title="Direction property"
            ></q-dialog-select>
          </div>
        </div>
      </div>
      <button class="orange" @click="$refs.windModal.close()">Search</button>
    </q-modal>
    <button v-if="probe" class="white circular absolute-bottom-right" style="margin-bottom: 6em; margin-right: 1em" @click="$refs.windModal.open()">
      <i>search</i>
    </button>
  </div>
</template>

<script>
import { Dialog } from 'quasar'
import api from 'src/api'

export default {
  props: ['probe', 'currentTime'],
  data () {
    return {
      windDirection: 0.0,
      windSpeed: 10,
      windProperty: '',
      labelProperty: ''
    }
  },
  methods: {
    getProbePropertyList () {
      if (!this.probe || !this.probe.features || this.probe.features.length === 0) return []
        // We assume the same properties for all features
      return Object.keys(this.probe.features[0].properties).map(property => {
        return {
          label: property,
          value: property
        }
      })
    },
    async searchWindConditions () {
      let locations = null
      // Check if probe is streamed so we need to retrieve results first
      if (this.probe._id) {
        locations = await api.probeResults.find({
          query: {
            forecastTime: this.currentTime.toISOString(),
            probeId: this.probe._id,
            $paginate: false
          }
        })
      }
      else {
        locations = this.probe.features
      }

      let bestLocation, bestDirection, bestSpeed
      let minDelta = 999
      locations.forEach(location => {
        let windDirection = location.properties['windDirection']
        let windSpeed = location.properties['windSpeed']
        // It might happen values are missing if location is outside forecast model bounds
        if (windDirection && windSpeed) {
          let targetDirection = this.windDirection
          if (this.windProperty) {
            targetDirection += parseFloat(location.properties[this.windProperty])
            if (targetDirection > 360) targetDirection -= 360
          }
          let directionDelta = Math.abs(windDirection - targetDirection)
          let speedDelta = Math.abs(windSpeed - this.windSpeed)
          let delta = 0.5 * directionDelta / 360 + 0.5 * speedDelta / 50
          if (delta < minDelta) {
            minDelta = delta
            bestDirection = windDirection
            bestSpeed = windSpeed
            bestLocation = location
          }
        }
      })
      if (bestLocation) {
        Dialog.create({
          title: 'Results',
          message: (this.labelProperty ? bestLocation.properties[this.labelProperty] : 'Location ') + ' with ' + bestDirection.toFixed(2) + '° and ' + bestSpeed.toFixed(2) + ' m/s',
          buttons: [
            {
              label: 'LOCATE',
              handler: () => {
                this.$emit('center', bestLocation.geometry.coordinates[0], bestLocation.geometry.coordinates[1], 12)
              }
            }
          ]
        })
      }
      else {
        Dialog.create({
          title: 'Alert',
          message: 'No matching airport found for your input.'
        })
      }
    }
  }
}
</script>

<style>
</style>
