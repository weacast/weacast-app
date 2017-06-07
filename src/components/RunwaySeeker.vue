<template>
  <!-- root node required -->
  <div>
    <q-modal ref="searchModal" :content-css="{padding: '20px', minWidth: '50vw'}">
      <div class="list">
        <q-collapsible opened icon="location_searching" label="Select flight test zone" group="group">
          <div class="row items-center justify-around">
            <div>
              <p class="caption">Departure airport ICAO</p>
              <q-dialog-select
                type="radio"
                v-model="departureICAO"
                :options="airports"
                ok-label="OK"
                cancel-label="Cancel"
                title="Departure airport"
              ></q-dialog-select>
            </div>
            <div>
              <p class="caption">Maximum test airport distance (Kms)</p>
              <q-range v-model="maxDistance" :min="100" :max="10000" :step="100" label-always></q-range>
            </div>
          </div>
        </q-collapsible>
        <q-collapsible icon="fingerprint" label="Select weather conditions" group="group">
          <div class="row items-center justify-around">
            <div>
              <p class="caption">Wind speed range (kt/s)</p>
              <q-double-range v-model="windSpeed" :min="0" :max="100" :step="1" label-always></q-double-range>
            </div>
            <div>
              <p class="caption">Wind direction (°)</p>
              <q-knob v-model="windDirection" :placeholder="windDirection + '°'" :min="0" :max="360"></q-knob>
            </div>
            <div>
              <p class="caption">Tolerance margin (°)</p>
              <q-numeric v-model="windDirectionMargin" :min="1" :max="90" :step="1"></q-numeric>
            </div>
          </div>
        </q-collapsible>
        <q-collapsible icon="tune" label="Select runway properties" group="group">
          <div class="row items-center justify-around">
            <div>
              <p class="caption">Minimum runway length (ft)</p>
              <q-range v-model="minRunwayLength" :min="3000" :max="20000" :step="1000" label-always></q-range>
            </div>
            <div>
              <p class="caption">Minimum runway width (ft)</p>
              <q-range v-model="minRunwayWidth" :min="50" :max="300" :step="10" label-always></q-range>
            </div>
          </div>
        </q-collapsible>
      </div>
      <div class="row float-right">
        <button class="primary clear" @click="searchRunways">Search runways</button>
        <button class="orange clear" @click="$refs.searchModal.close()">Close</button>
      </div>
    </q-modal>
    <q-modal ref="tableModal" :content-css="{padding: '20px', minWidth: '50vw'}">
      <q-data-table :columns="tableColumns" :data="runways" :config="tableConfig">
        <template slot="selection" scope="selection">
          <button class="primary clear" @click="locateRunway(selection.rows[0].data)">Locate</button>
        </template>
      </q-data-table>
      <button class="primary clear float-right" @click="$refs.tableModal.close()">Close</button>
    </q-modal>
    <q-modal ref="timelineModal" :content-css="{padding: '20px', minWidth: '50vw'}">
      <div class="timeline primary">
        <div v-for="(dayDate, index) in runwaysDays">
          <div class="timeline-label">
            <h4 class="bg-white text-italic">
              {{getCalendarDay(dayDate)}}
            </h4>
          </div>
          <div v-for="runway in runwaysByDay[index]" class="timeline-item">
            <a class="timeline-badge faded" @click="locateRunway(runway)">
              <i>place</i>
            </a>
            <div class="timeline-title">
              {{runway.forecastTime.format('h:mm:ss a')}}</br>{{runway.Ident}} - {{runway.Airport}}
            </div>
            <div class="timeline-date text-italic">
              {{runway.windSpeed.toFixed(2)}} kt/s - {{runway.windBearingDirection.toFixed(2)}}°</br>
              {{runway.Length.toFixed(2)}} ft X {{runway.Width.toFixed(2)}} ft
            </div>
          </div>
        </div>
      </div>
      <button class="primary clear float-right" @click="$refs.timelineModal.close()">Close</button>
    </q-modal>
    <q-fab id="fab" v-if="probe" icon="flight_takeoff" classNames="white" class="absolute-bottom-right" style="margin-bottom: 6em; margin-right: 1em" direction="left">
      <q-small-fab v-if="runways.length > 0" class="white" @click.native="setMapMode(mapMode === 'instant' ? 'cumulative' : 'instant')" icon="timelapse">
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, -10]">
        {{mapMode === 'instant' ? 'Switch to cumulative map mode' : 'Switch to instant map mode'}}</q-tooltip>
      </q-small-fab>
      <q-small-fab v-if="runways.length > 0" class="white" @click.native="$refs.timelineModal.open" icon="access_time">
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, -10]">View runways as timeline</q-tooltip>
      </q-small-fab>
      <q-small-fab v-if="runways.length > 0" class="white" @click.native="$refs.tableModal.open" icon="view_column">
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, -10]">View runways as table</q-tooltip>
      </q-small-fab>
      <q-small-fab class="white" @click.native="$refs.searchModal.open" icon="search">
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, -10]">Search for runways</q-tooltip>
      </q-small-fab>
    </q-fab>
  </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import L from 'leaflet'
import distance from 'turf-distance'
import { Dialog } from 'quasar'
import api from 'src/api'

const MAX_RUNWAYS = 100

// Convert from knots to meters
function knots2Meters (knots) {
  return 0.514 * knots
}
// Convert from meters to knots
function meters2Knots (meters) {
  return meters / 0.514
}
// Convert from feet to meters
/*
function feet2Meters (feet) {
  return 0.3048 * feet
}
// Convert from meters to feet
function meters2Feet (meters) {
  return meters / 0.3048
}
*/
// Convert from kilometers to meters
function kilometers2Meters (meters) {
  return 1000 * meters
}

export default {
  props: ['probe', 'currentTime'],
  data () {
    return {
      airports: [],
      runways: [],
      runwaysDays: [],
      runwaysByDay: [],
      mapMode: 'instant',
      departureICAO: 'LFBO',
      maxDistance: 2000,
      windDirection: 0.0,
      windDirectionMargin: 1.0,
      windSpeed: { min: 15, max: 30 },
      minRunwayLength: 5000,
      minRunwayWidth: 100,
      tableColumns: [
        {
          label: 'Runway',
          field: 'Ident',
          width: '120px',
          filter: true,
          sort: true
        },
        {
          label: 'Airport',
          field: 'Airport',
          width: '120px',
          filter: true,
          sort: true
        },
        {
          label: 'Distance (kms)',
          field: 'distance',
          width: '120px',
          filter: true,
          sort: true,
          format (value) {
            return value.toFixed(0)
          }
        },
        {
          label: 'Time',
          field: 'forecastTime',
          width: '120px',
          filter: true,
          sort: 'date',
          format (value) {
            return moment.utc(value).format()
          }
        },
        {
          label: 'Wind speed (kt/s)',
          field: 'windSpeed',
          width: '120px',
          filter: true,
          sort: true,
          format (value) {
            return value.toFixed(2)
          }
        },
        {
          label: 'Wind gust (kt/s)',
          field: 'gust',
          width: '120px',
          filter: true,
          sort: true,
          format (value) {
            return value ? value.toFixed(2) : ''
          }
        },
        {
          label: 'Wind direction (°)',
          field: 'windBearingDirection',
          width: '120px',
          filter: true,
          sort: true,
          format (value) {
            return value.toFixed(2)
          }
        },
        {
          label: 'Length (ft)',
          field: 'Length',
          width: '120px',
          filter: true,
          sort: true,
          format (value) {
            return value.toFixed(2)
          }
        },
        {
          label: 'Width (ft)',
          field: 'Width',
          width: '120px',
          filter: true,
          sort: true,
          format (value) {
            return value.toFixed(2)
          }
        }
      ],
      tableConfig: {
        title: 'Matching runways',
        rowHeight: '50px',
        columnPicker: true,
        responsive: true,
        pagination: {
          rowsPerPage: 10,
          options: [5, 10, 15, 30, 50]
        },
        selection: 'single',
        messages: {
          noData: '<i>warning</i> No runway to show.',
          noDataAfterFiltering: '<i>warning</i> No runway. Please refine your search terms.'
        }
      }
    }
  },
  watch: {
    probe: function (probe) {
      this.buildAirportList()
    }
  },
  methods: {
    buildAirportList () {
      // Create the airport list from the runway list by avoinding doublons
      if (this.probe && this.probe.features && this.probe.features.length > 0) {
        this.airports =
        _.uniqBy(this.probe.features.map(runway => runway.properties.Airport))
        .map(airportCode => ({
          label: airportCode,
          value: airportCode
        }))
      }
    },
    buildQuery () {
      let query = {
        probeId: this.probe._id,
        $limit: MAX_RUNWAYS
      }
      query.geometry = {
        $near: {
          $geometry: this.departureAirport.geometry,
          $maxDistance: kilometers2Meters(this.maxDistance)
        }
      }
      query['properties.windSpeed'] = {
        $gte: knots2Meters(this.windSpeed.min),
        $lte: knots2Meters(this.windSpeed.max)
      }
      query['properties.Length'] = {
        $gte: this.minRunwayLength
      }
      query['properties.Width'] = {
        $gte: this.minRunwayWidth
      }
      let crossZero = false
      let minDirection = this.windDirection - this.windDirectionMargin
      if (minDirection < 0) {
        minDirection += 360.0
        crossZero = true
      }
      let maxDirection = this.windDirection + this.windDirectionMargin
      if (maxDirection > 360) {
        minDirection -= 360.0
        crossZero = true
      }
      if (!crossZero) {
        query['properties.windBearingDirection'] = {
          $gte: minDirection,
          $lte: maxDirection
        }
      }
      else {
        query.$or = [ {}, {} ]
        query.$or[0]['properties.windBearingDirection'] = {
          $gte: minDirection,
          $lte: 360
        }
        query.$or[1]['properties.windBearingDirection'] = {
          $gte: 0,
          $lte: maxDirection
        }
      }

      return { query }
    },
    processRunways (runways) {
      runways.forEach(runway => {
        // Handle types
        runway.properties.Length = _.toNumber(runway.properties.Length)
        runway.properties.Width = _.toNumber(runway.properties.Width)
        runway.properties.gust = meters2Knots(_.toNumber(runway.properties.gust))
        runway.properties.windSpeed = meters2Knots(_.toNumber(runway.properties.windSpeed))
        runway.properties.windDirection = _.toNumber(runway.properties.windDirection)
        runway.properties.windBearingDirection = _.toNumber(runway.properties.windBearingDirection)
        runway.forecastTime = moment.utc(runway.forecastTime)
        // Quasar table does not support nested fields like 'properties.Length' so we flatten properties
        Object.assign(runway, runway.properties)
        // Compute distance from departure airport
        runway.distance = distance(this.departureAirport, runway)
        // Time alias for layer visualization
        runway.properties.time = runway.forecastTime.valueOf()
      })

      this.runways = runways
      // Compute as well some global informations
      let runwaysMinDay = moment.min(runways.map(runway => runway.forecastTime)).clone().startOf('day')
      let runwaysMaxDay = moment.max(runways.map(runway => runway.forecastTime)).clone().startOf('day')
      // Iterate over min/max date/time to get the list of days
      let currentDate = runwaysMinDay
      this.runwaysDays = [ currentDate.clone() ]
      this.runwaysByDay = [ this.getRunwaysForDay(currentDate) ]
      while (currentDate.isBefore(runwaysMaxDay)) {
        currentDate.add(1, 'days')
        let runwaysForDay = this.getRunwaysForDay(currentDate)
        if (runwaysForDay.length > 0) {
          this.runwaysDays.push(currentDate.clone())
          this.runwaysByDay.push(runwaysForDay)
        }
      }

      return runways
    },
    setMapMode (mode) {
      this.mapMode = mode
      // Need to recreate layer
      this.destroyRunwaysLayer()
      this.createRunwaysLayer(false)
    },
    destroyRunwaysLayer () {
      this.$parent.removeLayer(this.runwaysLayer)
      this.runwaysLayer = null
    },
    // Create a layer to view runways on map depending on current map mode: could be 'instant' or 'cumulative'
    // 'instant' = only runways for the current time are visible
    // 'cumulative' = runways until the current time are visible
    createRunwaysLayer (update) {
      if (!this.runways) return
      this.runwaysLayer = this.$parent.addTimedGeoJson({
        type: 'FeatureCollection',
        features: this.runways
      }, {
        updateTimeDimension: update,
        updateTimeDimensionMode: 'replace',
        // For instant visualization make features alive only 1s after their time
        // Otherwise ensure they are alive at least the max number of days in data
        duration: this.mapMode === 'instant' ? 'PT1S' : 'P5D'
      })
    },
    destroyAirportMarker () {
      this.$parent.removeLayer(this.departureAirportMarker)
      this.departureAirportMarker = null
    },
    createAirportMarker () {
      if (!this.departureAirport) return
      let marker = L.marker([
        this.departureAirport.geometry.coordinates[1],
        this.departureAirport.geometry.coordinates[0]
      ])
      marker.bindPopup('Departure airport (' + this.departureAirport.properties.Airport + ')')
      this.departureAirportMarker = this.$parent.addLayer(marker)
    },
    searchRunways () {
      // Chaining modal close and dialog open requires the use of callback
      this.$refs.searchModal.close(async _ => {
        // Remove previous data
        this.runways = []
        this.destroyRunwaysLayer()
        this.destroyAirportMarker()
        /*
        let progressDialog = await Dialog.create({
          title: 'Please wait',
          message: 'Processing forecast data...',
          progress: { indeterminate: true },
          buttons: [],
          noBackdropDismiss: true,
          noEscDismiss: true
        })
        */
        // Because of the required precision simply take the first runway location as departure airport location
        this.departureAirport = this.probe.features.find(runway => runway.properties.Airport === this.departureICAO)
        let response = await api.probeResults.find(this.buildQuery())
        // await progressDialog.close()
        this.runways = this.processRunways(response.data)
        // When initializing a new search filter all forecast times by those with results only
        this.createRunwaysLayer(true)
        this.createAirportMarker()
        this.$parent.center(this.departureAirport.geometry.coordinates[0], this.departureAirport.geometry.coordinates[1], 5)

        if (response.total > 0) {
          Dialog.create({
            title: response.total + ' matching results found',
            message: response.total > MAX_RUNWAYS
              ? 'Found more than ' + MAX_RUNWAYS + ' runways, you can now browse matching runways but please consider refining your search parameters.'
              : 'You can now browse matching runways',
            buttons: [
              {
                label: 'View as table',
                handler: () => {
                  this.$refs.tableModal.open()
                }
              },
              {
                label: 'View as timeline',
                handler: () => {
                  this.$refs.timelineModal.open()
                }
              },
              'Close'
            ]
          })
        }
        else {
          Dialog.create({
            title: 'Alert',
            message: 'No matching runway found for your input, please consider changing search parameters.'
          })
        }
      })
    },
    getCalendarDay (dayDate) {
      return dayDate.calendar().split(' at')[0]
    },
    getRunwaysForDay (startDate) {
      const endDate = startDate.clone().add(1, 'days')
      // First filter runways belonging to given day
      let runways = this.runways.filter(runway => runway.forecastTime.isBetween(startDate, endDate, null, '[)'))
      // Then sort by time
      runways.sort((runway1, runway2) => runway1.forecastTime.isBefore(runway2.forecastTime) ? -1 : (runway2.forecastTime.isBefore(runway1.forecastTime) ? 1 : 0))
      // Then agregate when
      return runways
    },
    locateRunway (runway) {
      this.$refs.tableModal.close()
      this.$refs.timelineModal.close()
      this.$parent.center(runway.geometry.coordinates[0], runway.geometry.coordinates[1], 12)
      this.$parent.setCurrentTime(runway.forecastTime)
    }
  },
  mounted () {
    this.buildAirportList()
  }
}
</script>

<style>
.q-range {
  height: 75px;
}
.q-range-label {
  font-size: 16px;
  top: -30px;
  left: -75%;
}
.q-range-label::before {
  width: 50px;
  height: 50px;
  top: -15px;
}
</style>
