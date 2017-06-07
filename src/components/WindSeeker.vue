<template>
  <!-- root node required -->
  <div>
    <q-modal ref="windModal" :content-css="{padding: '20px', minWidth: '30vw'}">
      <h5>Wind conditions</h5>
      <div>
        <div class="row items-center justify-around">
          <div>
            <p class="caption">Wind speed (m/s)</p>
            <q-range v-model="windSpeed" :min="0" :max="20" :step="0.5" label></q-range>
          </div>
          <div>
            <p class="caption">Wind direction (°)</p>
            <q-knob v-model="windDirection" :placeholder="windDirection+'°'" :min="0" :max="360"></q-knob>
          </div>
        </div>
        <div class="row items-center justify-around">
          <div>
            <p class="caption">Label property</p>
            <q-dialog-select
              type="radio"
              v-model="labelProperty"
              :options="probePropertyList"
              ok-label="OK"
              cancel-label="Cancel"
              title="Label property"
            ></q-dialog-select>
          </div>
          <div v-if="isUserProbe">
            <p class="caption">Direction property</p>
            <q-dialog-select
              type="radio"
              v-model="windProperty"
              :options="probePropertyList"
              ok-label="OK"
              cancel-label="Cancel"
              title="Direction property"
            ></q-dialog-select>
          </div>
        </div>
      </div>
      <div class="row float-right">
        <button class="primary clear" @click="searchWindConditions()">Search</button>
        <button class="orange clear" @click="$refs.windModal.close()">Close</button>
      </div>
    </q-modal>
    <button v-if="hasProbe" class="white circular absolute-bottom-right" style="margin-bottom: 6em; margin-right: 1em" @click="$refs.windModal.open()">
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
  computed: {
    hasProbe () {
      return this.probe !== null
    },
    isUserProbe () {
      return this.hasProbe && !this.probe._id
    },
    probePropertyList () {
      if (!this.probe || !this.probe.features || this.probe.features.length === 0) return []
        // We assume the same properties for all features
      return Object.keys(this.probe.features[0].properties).map(property => {
        return {
          label: property,
          value: property
        }
      })
    }
  },
  methods: {
    searchWindConditions () {
      // Chaining modal close and dialog open requires the use of callback
      this.$refs.windModal.close(async _ => {
        let locations
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
          // Direction is expressed in meteorological convention, i.e. angle from which the flow comes
          // we need to convert it to geographical convention, i.e. angle toward which the element goes
          let windDirection = location.properties['windDirection']
          windDirection += 180
          if (windDirection >= 360) windDirection -= 360
          let windSpeed = location.properties['windSpeed']
          // It might happen values are missing if location is outside forecast model bounds
          if (windDirection && windSpeed) {
            let targetDirection = this.windDirection
            // Compute bearing relatively to a bearing property if given
            if (this.windProperty) {
              // Take care that bearing uses the geographical convention, i.e. angle toward which the element goes,
              // we need to convert it to meteorological convention, i.e. angle from which the flow comes
              let bearing = parseFloat(location.properties[this.windProperty])
              targetDirection += bearing
            }
            let directionDelta = Math.abs(windDirection - targetDirection)
            let speedDelta = Math.abs(windSpeed - this.windSpeed)
            let delta = 0.5 * directionDelta / 360.0 + 0.5 * speedDelta / 50.0
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
                  this.$parent.center(bestLocation.geometry.coordinates[0], bestLocation.geometry.coordinates[1], 12)
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
      })
    }
  }
}
</script>

<style>
</style>
