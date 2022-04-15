export class GridView {
  constructor (options) {
    Object.assign(this, options)
  }

  getValue (i, j) {
    let iGrid = this.origin[0] + i
    let jGrid = this.origin[1] + j
    if (iGrid >= this.grid.size[0]) iGrid = iGrid % this.grid.size[0]
    if (jGrid >= this.grid.size[1]) jGrid = jGrid % this.grid.size[1]
    return this.grid.getValue(iGrid, jGrid)
  }

  cut () {
    let views = []
    if (this.size[0] >= this.size[1]) {
      views.push(new GridView({
        grid: this.grid,
        origin: this.origin,
        size: [Math.trunc(this.size[0] / 2) + 1, this.size[1]],
        offset: this.offset,
        sew: this.sew
      }))
      views.push(new GridView({
        grid: this.grid,
        origin: [this.origin[0] + Math.trunc(this.size[0] / 2), this.origin[1]],
        size: [Math.trunc(this.size[0] / 2) + (this.size[0] % 2), this.size[1]],
        offset: this.offset,
        sew: this.sew
      }))
    } else {
      views.push(new GridView({
        grid: this.grid,
        origin: this.origin,
        size: [this.size[0], Math.trunc(this.size[1] / 2) + 1],
        offset: this.offset,
        sew: this.sew
      }))
      views.push(new GridView({
        grid: this.grid,
        origin: [this.origin[0], this.origin[1] + Math.trunc(this.size[1] / 2)],
        size: [this.size[0], Math.trunc(this.size[1] / 2) + (this.size[1] % 2)],
        offset: this.offset,
        sew: this.sew
      }))
    }
    return views
  }
}

export class GridViewer {
  constructor (grid) {
    this.grid = grid
    this.sew = (grid.bounds[2] - grid.bounds[0]) === 360
  }

  getViews () {
    let views = []
    if (this.grid.bounds[2] > 180) {
      let westSize = (this.grid.bounds[2] - 180) / this.grid.resolution[0]
      let eastSize = this.grid.size[0] - westSize
      views.push(new GridView({
        grid: this.grid,
        origin: [0, 0],
        size: [westSize, this.grid.size[1]],
        offset: 0,
        sew: this.sew
      }))
      views.push(new GridView({
        grid: this.grid,
        origin: [westSize, 0],
        size: [eastSize, this.grid.size[1]],
        offset: -360,
        sew: this.sew
      }))
    } else {
      views.push(new GridView({
        grid: this.grid,
        origin: [0, 0],
        size: this.grid.size,
        offset: 0,
        sew: this.sew
      }))
    }
    return views
  }
}
