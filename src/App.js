import React, { Component } from 'react'
import './App.css'
import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'

const randomFromArray = function (arr) {
  return arr[Math.floor((Math.random()*arr.length))]
}

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      backgroundColor: '#f5f5f5',
      displayColorPickers: true,
      outerColor: '#FFADAD',
      tipColor: '#333',
      innerColor: 'red',
      dimension: 5,
      padding: 50,
      width: 500,
      height: 500,
      running: false,
      spacing: 0.2,
      factor: 1.7
    }
  }

  between (min, max) {
    return Math.random()*(max-min+1.) + min;
  }

  bound (value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  actualHeight () {
    return this.state.height-2*this.state.padding
  }

  actualWidth () {
    return this.state.width-2*this.state.padding
  }

  decrementDimension () {
    this.setState({dimension: Math.max(1, this.state.dimension - 1) })
  }

  incrementDimension () {
    this.setState({dimension: Math.min(30, this.state.dimension + 1) })
  }

  incrementFactor () {
    this.setState({factor: Math.min(this.state.factor + 0.1, 5) })
  }

  incrementSpacing () {
    this.setState({spacing: Math.min(this.state.spacing + 0.1, 5) })
  }

  decrementSpacing () {
    this.setState({spacing: Math.max(this.state.spacing - 0.1, 0) })
  }

  decrementFactor () {
    this.setState({factor: Math.max(this.state.factor - 0.1, 1.1) })
  }

  toggleRun() {
    this.setState({running: !this.state.running})
  }

  tick () {
    if (this.state.running) {
      this.forceUpdate()
    }
  }

  componentWillMount () {
    this.updateDimensions()
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    const dim = Math.min(width, height)
    const settings = { width: dim , height: dim }

    if (settings.width >= 500) {
      settings.padding = 50
    } else {
      settings.padding = 0
    }

    this.setState(settings)
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
    window.clearInterval(this.interval)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)
    this.interval = window.setInterval(this.tick.bind(this), 400)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    mc.on("swipedown", ev => this.decrementDimension())
      .on("swipeup", ev => this.incrementDimension())
      .on("swipeleft", ev => this.decrementFactor())
      .on("swiperight", ev => this.incrementFactor())
      .on("pinchin", ev => this.incrementDimension())
      .on("pinchout", ev => this.decrementDimension())
   }

   handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 80 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.togglePaper()
    } else if (ev.which === 84) {
      ev.preventDefault()
      this.toggleRun()
    } else if (ev.which === 40) {
      ev.preventDefault()
      if ((ev.metaKey || ev.ctrlKey)) {
        this.incrementSpacing()
      } else {
        this.decrementDimension()
      }
      
    } else if (ev.which === 38) {
      ev.preventDefault()
      if ((ev.metaKey || ev.ctrlKey)) {
        this.decrementSpacing()
      } else {
        this.incrementDimension()
      }
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.incrementFactor()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.decrementFactor()
    }
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `eyes.svg`)
    link.click()
  }

  modelIsFull(model) {
    for (let r = 0; r < this.state.dimension; r++) {
      for (let c = 0; c < this.state.dimension; c++) {
        if (model[r][c]) {
          return false
        }
      }
    }
    return true
  }

  copyModel (model) {
    const newModel = Array(model.length).fill([]).map(x => Array(model[0].length).fill(true))
    for (let r = 0; r < model.length; r++) {
      for (let c = 0; c < model[0].length; c++) {
        newModel[r][c] = model[r][c]
      }
    }
    return newModel
  }

  modelOptionsForEyeSize (model, eyeSize) {
    const options = []

    return options
  }

  partOptionsForEyeSizeWithModel(model, eyeSize) {
    const options = []

    for (let r=0; r <= model.length - eyeSize; r ++) {
      for (let c=0; c <= model[0].length - eyeSize; c++) {

        let valid = true

        for (let rInner = r; rInner < r + eyeSize; rInner++) {
          for (let cInner = c; cInner < c + eyeSize; cInner++) {
            if(!model[rInner][cInner]) {
              valid = false
              break
            }
          }

          if (!valid) {
            break
          }
        }

        if (valid) {
          options.push({dimension: eyeSize, startRow: r, startCol: c})
        }

      }
    }
    return options
  }

  updateModelWithPart (model, part) {

    const lowerX = part.startCol
    const lowerY = part.startRow
    const upperX = part.startCol + part.dimension
    const upperY = part.startRow + part.dimension

    for (let r = lowerY; r < upperY; r++) {
      for (let c = lowerX; c < upperX; c++) {
        model[r][c] = false
      }
    }
  }

  generateEyes () {
    //const actualHeight = this.actualHeight()
    const actualWidth = this.actualWidth()

    const unitSize = actualWidth/this.state.dimension

    const model = Array(this.state.dimension).fill([]).map(x => Array(this.state.dimension).fill(true))

    const eyes = []
    const parts = []

    let currentEyeSize = Math.max(Math.floor(this.state.dimension * 2/3), 1);

    if (this.state.dimension >= 1) {

      while (currentEyeSize > 1) {

        const partOptions = this.partOptionsForEyeSizeWithModel(model, currentEyeSize)
        
        if (partOptions.length) {
          
          let part = randomFromArray(partOptions)
        
          parts.push(part)
          
          this.updateModelWithPart(model, part)

        } else {
          currentEyeSize--
        }

      }

    }

    for (let partI = 0; partI < parts.length; partI++){
      const p = parts[partI]

      eyes.push(
          <Eye key={`${p.startCol}-${p.startRow}-${p.dimension}`} startRow={p.startRow} startCol={p.startCol}
                unitSize={unitSize} dimension={p.dimension}
                tipColor={this.state.tipColor} outerColor={this.state.outerColor} innerColor={this.state.innerColor}
                spacing={this.state.spacing} factor={this.state.factor} rotation={randomFromArray([0, 90, 180, 270])} />
        )
    }



    for (let r = 0; r < this.state.dimension; r++) {
      for (let c = 0; c < this.state.dimension; c++) {

        if (model[r][c]) {

          eyes.push(
            <Eye key={`${c}-${r}-${1}`} unitSize={unitSize} startRow={r} startCol={c} dimension={1}
              tipColor={this.state.tipColor} outerColor={this.state.outerColor} innerColor={this.state.innerColor}
              spacing={this.state.spacing} factor={this.state.factor} rotation={randomFromArray([0, 90, 180, 270])} />
          )
        }
      }
    }


    return eyes
  }

  render() {
    const actualHeight = this.actualHeight()
    const actualWidth = this.actualWidth()

    return (
      <div className="App">
        { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.tipColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({tipColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.outerColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({outerColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.innerColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({innerColor: color.hex}) } />
            </div> : null
        }
        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight} style={{ overflow: 'none' }}>
            <rect width={"100%"} height={"100%"}  fill={this.state.backgroundColor} />
            <g>
              {this.generateEyes()}
            </g>
          </svg>
        </div> 
      </div>
    )
  }
}

class Eye extends React.Component {
  render () {
    const props = this.props

    const cellSize = props.unitSize * props.dimension

    const middleX = props.startCol*props.unitSize + cellSize/2
    const middleY = props.startRow*props.unitSize + cellSize/2

    const rectSize = cellSize/(2 + props.spacing)
    const outerRadius = rectSize
    const innerRadius = outerRadius/props.factor 

    return (
      <g transform={`rotate(${props.rotation} ${middleX} ${middleY})`}>
        <rect fill={props.tipColor} x={middleX} y={middleY}
          width={rectSize} height={rectSize} />
        <circle cx={middleX} cy={middleY} r={outerRadius} fill={props.outerColor} />
        <circle cx={middleX} cy={middleY} r={innerRadius} fill={props.innerColor} />
      </g>
    )
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha,
      useHue: props.useHue
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose } />
            <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
          </div> : null }
      </div>
    )
  }
}

export default App
