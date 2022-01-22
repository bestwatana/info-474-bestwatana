import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import ParentSize from '@visx/responsive/lib/components/ParentSize';


ReactDOM.render(
  <React.StrictMode>
      <ParentSize>{({ width, height }) => <App width={width} height={height} />}</ParentSize>,
  </React.StrictMode>,
  document.getElementById('root')
)
