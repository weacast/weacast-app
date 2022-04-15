import L from 'leaflet'
import chroma from 'chroma-js'
import * as PIXI from 'pixi.js'
import 'leaflet-pixi-overlay'
import { ForecastLayer } from './forecast-layer'
import { Grid } from '../grid'
import { GridViewer } from '../grid-viewer'

window.chroma = chroma
// WebGL limit
const VERTEX_BUFFER_MAX_SIZE = 65536

function buildMesh (gridView, colorMap, utils, container, opacity) {
  if ((gridView.size[0] * gridView.size[1]) > VERTEX_BUFFER_MAX_SIZE) {
    let subgridViews = gridView.cut()
    subgridViews.forEach(subgridView => buildMesh(subgridView, colorMap, utils, container, opacity))
  } else {
    let vertices = []
    let colors = []
    let indices = []
    let width = gridView.size[0] + (gridView.sew ? 1 : 0)
    let height = gridView.size[1]
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        let x = gridView.grid.origin[0] + ((gridView.origin[0] + i) * gridView.grid.resolution[0]) + gridView.offset
        let y = gridView.grid.origin[1] - ((gridView.origin[1] + j) * gridView.grid.resolution[1])
        let pos = utils.latLngToLayerPoint([y, x])
        vertices.push(pos.x)
        vertices.push(pos.y)
        let cellValue = gridView.getValue(i, j)
        let rgb = PIXI.utils.hex2rgb(colorMap(cellValue).num())
        colors.push(rgb[0])
        colors.push(rgb[1])
        colors.push(rgb[2])
        if (i < (width - 1) && j < (height - 1)) {
          let index00 = (j * width) + i
          let index01 = index00 + 1
          let index10 = index00 + width
          let index11 = index10 + 1
          indices.push(index00)
          indices.push(index10)
          indices.push(index01)
          indices.push(index01)
          indices.push(index10)
          indices.push(index11)
        }
      }
    }
    let mesh = new PIXI.mesh.Mesh(null, new Float32Array(vertices), null, new Uint16Array(indices), PIXI.mesh.Mesh.DRAW_MODES.TRIANGLES)
    mesh.colors = new Float32Array(colors)
    mesh.alpha = opacity
    container.addChild(mesh)
  }
}

function buildCells (gridView, colorMap, utils, container, opacity) {
  for (let j = 0; j < gridView.size[1]; j++) {
    for (let i = 0; i < gridView.size[0]; i++) {
      let x = gridView.grid.origin[0] + ((gridView.origin[0] + i) * gridView.grid.resolution[0]) + gridView.offset
      let y = gridView.grid.origin[1] - ((gridView.origin[1] + j) * gridView.grid.resolution[1])
      let xCell = x - (gridView.grid.resolution[0] / 2)
      let yCell = y - (gridView.grid.resolution[1] / 2)
      let minCell = utils.latLngToLayerPoint([yCell, xCell])
      let maxCell = utils.latLngToLayerPoint([yCell + gridView.grid.resolution[0], xCell + gridView.grid.resolution[1]])
      let cellValue = gridView.getValue(i, j)
      let cell = new PIXI.Graphics()
      cell.beginFill(colorMap(cellValue).num(), opacity)
      cell.drawRect(minCell.x, minCell.y, maxCell.x - minCell.x, maxCell.y - minCell.y)
      cell.endFill()
      container.addChild(cell)
    }
  }
}

let ScalarLayer = ForecastLayer.extend({

  initialize (api, options) {
    // Merge options with default for undefined ones
    this.options = Object.assign({
      interpolate: true,
      colorMap: 'OrRd',
      opacity: 0.25,
      mesh: true
    }, options)
    // Create empty PIXI container
    if (this.options.mesh) {
      var _pixiGlCore2 = PIXI.glCore
      PIXI.mesh.MeshRenderer.prototype.onContextChange = function onContextChange () {
        var gl = this.renderer.gl
        this.shader = new PIXI.Shader(gl,
          'attribute vec2 aVertexPosition;\n' +
          'attribute vec3 aVertexColor;\n' +
          'uniform mat3 projectionMatrix;\n' +
          'uniform mat3 translationMatrix;\n' +
          'varying vec3 vColor;\n' +
          'void main(void)\n{\n' +
          '  vColor = aVertexColor;\n' +
          '  gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n' +
          '}\n',
          'precision mediump float;' +
          'varying vec3 vColor;\n' +
          'uniform float alpha;\n' +
          'void main(void)\n{\n' +
          '  gl_FragColor.rgb = vec3(vColor[0]*alpha, vColor[1]*alpha, vColor[2]*alpha);\n' +
          '  gl_FragColor.a = alpha;\n' +
          '}\n'
        )
      }
      PIXI.mesh.MeshRenderer.prototype.render = function render (mesh) {
        var renderer = this.renderer
        var gl = renderer.gl
        var glData = mesh._glDatas[renderer.CONTEXT_UID]
        if (!glData) {
          renderer.bindVao(null)
          glData = {
            shader: this.shader,
            vertexBuffer: _pixiGlCore2.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
            colorBuffer: _pixiGlCore2.GLBuffer.createVertexBuffer(gl, mesh.colors, gl.STREAM_DRAW),
            indexBuffer: _pixiGlCore2.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW)
          }
          // build the vao object that will render..
          glData.vao = new _pixiGlCore2.VertexArrayObject(gl)
            .addIndex(glData.indexBuffer)
            .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 4 * 2, 0)
            .addAttribute(glData.colorBuffer, glData.shader.attributes.aVertexColor, gl.FLOAT, false, 4 * 3, 0)
          mesh._glDatas[renderer.CONTEXT_UID] = glData
        }
        renderer.bindVao(glData.vao)
        renderer.bindShader(glData.shader)
        glData.shader.uniforms.alpha = mesh.alpha
        glData.shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true)
        glData.vao.draw(gl.TRIANGLES, mesh.indices.length, 0)
      }
    }
    this.pixiContainer = new PIXI.Container()
    // Create the PIXI overlay
    let layer = L.pixiOverlay(utils => this.render(utils), this.pixiContainer, {
      autoPreventDefault: false
    })
    ForecastLayer.prototype.initialize.call(this, api, layer, options)
  },

  render (utils) {
    // If no data return
    if (!this.grid.data) return
    // Retrive utils objects
    let renderer = utils.getRenderer()
    let container = this.pixiContainer
    // It the PIXI container is null then build the grid
    if (this.pixiContainer.children.length === 0) {
      if (this.options.mesh) {
        renderer.gl.blendFunc(renderer.gl.ONE, renderer.gl.ZERO)
        this.viewer.getViews().forEach(view => buildMesh(view, this.colorMap, utils, container, this.options.opacity))
      } else {
        this.viewer.getViews().forEach(view => buildCells(view, this.colorMap, utils, container, this.options.opacity))
      }
    }
    renderer.render(container)
  },

  getColorMap () {
    let colorMap = []
    let colors = chroma.brewer[this.options.colorMap]
    for (let i = 0; i < colors.length; i++) {
      colorMap.push({
        value: this.minValue + i * (this.maxValue - this.minValue) / colors.length,
        color: colors[i]
      })
    }
    return colorMap
  },

  setData (data) {
    this.minValue = data[0].minValue
    this.maxValue = data[0].maxValue
    this.colorMap = chroma.scale(this.options.colorMap).domain([this.minValue, this.maxValue])
    if (this.options.colorClasses) this.colorMap.classes(this.options.colorClasses)
    this.grid.data = data[0].data
    this.pixiContainer.removeChildren()
    this._baseLayer.redraw()
    ForecastLayer.prototype.setData.call(this, data)
  },

  setForecastModel (model) {
    this.grid = new Grid(model)
    this.viewer = new GridViewer(this.grid)
    ForecastLayer.prototype.setForecastModel.call(this, model)
  }
})

L.Weacast.ScalarLayer = ScalarLayer
export { ScalarLayer }
