'use client'
import { useEffect, useRef } from 'react'

// Real Natural Earth 110m coordinates
const COORDS_TH = [[105.22,14.274],[104.28,14.416],[102.988,14.227],[102.347,13.394],[102.585,12.187],[101.688,12.646],[100.832,12.627],[100.979,13.412],[100.097,13.407],[100.018,12.307],[99.478,10.846],[99.154,9.963],[99.222,9.239],[99.874,9.208],[100.281,8.296],[100.461,7.429],[101.019,6.857],[101.624,6.74],[102.142,6.222],[101.814,5.811],[101.156,5.691],[101.076,6.205],[100.259,6.642],[100.086,6.464],[99.69,6.849],[99.521,7.343],[98.988,7.908],[98.502,8.382],[98.34,7.795],[98.15,8.35],[98.258,8.975],[98.553,9.933],[99.039,10.96],[99.586,11.892],[99.197,12.805],[99.212,13.269],[99.096,13.827],[98.43,14.623],[98.193,15.124],[98.538,15.308],[98.902,16.178],[98.495,16.838],[97.858,17.568],[97.376,18.446],[97.797,18.627],[98.254,19.709],[98.96,19.753],[99.543,20.186],[100.115,20.418],[100.547,20.11],[100.605,19.509],[101.282,19.463],[101.037,18.409],[101.058,17.512],[102.113,18.109],[102.412,17.933],[102.999,17.962],[103.2,18.309],[103.956,18.241],[104.716,17.429],[104.781,16.442],[105.587,15.57],[105.544,14.724],[105.22,14.274]]

const COORDS_LA = [[107.384,14.203],[106.498,14.57],[106.044,13.881],[105.22,14.274],[105.544,14.724],[105.587,15.57],[104.781,16.442],[104.716,17.429],[103.956,18.241],[103.2,18.309],[102.999,17.962],[102.412,17.933],[102.113,18.109],[101.058,17.512],[101.037,18.409],[101.282,19.463],[100.605,19.509],[100.547,20.11],[100.115,20.418],[100.328,20.787],[101.181,21.437],[101.271,21.202],[101.804,21.174],[101.652,22.319],[102.171,22.464],[102.754,21.675],[103.204,20.767],[104.435,20.758],[104.824,19.886],[104.183,19.624],[103.895,19.265],[105.094,18.668],[105.926,17.485],[106.556,16.605],[107.312,15.909],[107.564,15.201],[107.384,14.203]]

const COORDS_KH = [[102.585,12.187],[102.347,13.394],[102.988,14.227],[104.28,14.416],[105.22,14.274],[106.044,13.881],[106.498,14.57],[107.384,14.203],[107.614,13.536],[107.492,12.338],[105.81,11.568],[106.25,10.962],[105.198,10.889],[104.334,10.486],[103.496,10.633],[103.092,11.153],[102.585,12.187]]

const COORDS_MALAY_LOST = [[99.521,7.343],[99.69,6.849],[100.086,6.464],[100.259,6.642],[101.076,6.205],[101.156,5.691],[101.624,6.74],[101.019,6.857],[100.461,7.429],[99.874,9.208],[99.222,9.239],[99.154,9.963],[99.039,10.96],[98.553,9.933],[98.258,8.975],[98.15,8.35],[98.34,7.795],[98.502,8.382],[98.988,7.908],[99.521,7.343]]

// Historical Siam territories — using real Natural Earth coords as base
const HIST_SIAM = {
  // 1700: Ayutthaya at peak — extends into Laos, south into Malay peninsula
  1700: [...COORDS_TH.slice(0, 48), [100.5,6.5],[101,6],[102.1,6.2],[102.5,8],[103,11],[103.9,14.2],[104.7,17.4],[104.8,19.9],[104.1,21.8],[103.2,21.9],[101.8,21.2],[100.5,20.4],...COORDS_TH.slice(48)],
  // 1767: Collapsed to Chao Phraya valley only
  1767: [[99.2,12.8],[99.6,11.9],[100.8,12.6],[101.7,12.6],[103,13],[103.5,14.7],[103.2,17.9],[102.4,17.9],[102.1,18.1],[101.1,17.5],[101,18.4],[101.3,19.5],[100.6,19.5],[100.1,20.4],[99.5,20.2],[98.9,19.7],[98.3,17.6],[97.9,17.6],[97.4,16.8],[98.5,15.3],[98.9,16.2],[98.5,14.6],[99.1,13.3],[99.2,12.8]],
  // 1782: Bangkok recovery
  1782: [[99.5,7],[101,6.5],[102.1,6.2],[102.5,8],[103,11],[103.9,15],[104.7,17.4],[103.9,18.2],[103.2,18.3],[102.4,17.9],[102.1,18.1],[101.1,17.5],[101,18.4],[101.3,19.5],[100.6,19.5],[100.1,20.4],[99.5,20.2],[98.9,19.7],[97.8,18.4],[97.4,16.8],[97.6,16.1],[97.8,15],[98.9,16.2],[98.5,14.6],[99.1,13.3],[99.6,11.9],[99,10.9],[98.6,9.9],[98.5,8.4],[99.5,7]],
  // 1855: Full Bowring expansion including Malay states
  1855: [...COORDS_TH.slice(0,18), [97,7],[99,5],[101.1,5.7],[102.1,6.2],...COORDS_TH.slice(18,48),[104.8,19.9],[104.1,21.8],[103.2,21.9],[101.8,21.2],[100.5,20.4],...COORDS_TH.slice(48)],
  // 1893+: Modern borders (Laos lost to France)
  1893: COORDS_TH,
  1909: COORDS_TH,
  1932: COORDS_TH,
  1997: COORDS_TH,
  2026: COORDS_TH,
}

const HIST_LOST = {
  1700: [], 1767: [], 1782: [], 1855: [],
  1893: [{ coords: COORDS_LA, name: 'Лаос → Франции 1893' }],
  1909: [
    { coords: COORDS_LA,         name: 'Лаос' },
    { coords: COORDS_KH,         name: 'Камбоджа' },
    { coords: COORDS_MALAY_LOST, name: 'Малайя → Британии' },
  ],
  1932: [{ coords: COORDS_LA, name: 'Лаос' }, { coords: COORDS_KH, name: 'Камбоджа' }],
  1997: [{ coords: COORDS_LA, name: 'Лаос' }, { coords: COORDS_KH, name: 'Камбоджа' }],
  2026: [{ coords: COORDS_LA, name: 'Лаос' }, { coords: COORDS_KH, name: 'Камбоджа' }],
}

// [lon,lat] → Leaflet [lat,lng]
function toLL(coords) {
  return coords.map(([lo, la]) => [la, lo])
}

function geo(coords) {
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } }
}

export default function LeafletMap({ period }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const siamRef      = useRef(null)
  const lostRef      = useRef([])
  const thRef        = useRef(null)

  // Mount map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const L = require('leaflet')

    // Fix default marker icons (Next.js asset path issue)
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current, {
      center: [13.5, 101.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 8,
      scrollWheelZoom: false,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 8,
    }).addTo(map)

    // Modern Thailand reference — added once, stays forever
    thRef.current = L.geoJSON(geo(COORDS_TH), {
      style: {
        color: '#2244bb',
        weight: 2.5,
        dashArray: '8 5',
        fillColor: 'transparent',
        fillOpacity: 0,
        opacity: 0.7,
      },
    }).bindTooltip('Современный Таиланд (для сравнения)', { sticky: true }).addTo(map)

    mapRef.current = map
    renderPeriod(map, period)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update layers when period changes
  useEffect(() => {
    if (!mapRef.current) return
    renderPeriod(mapRef.current, period)
  }, [period])

  function renderPeriod(map, p) {
    const L = require('leaflet')

    // Remove previous dynamic layers
    if (siamRef.current) { siamRef.current.remove(); siamRef.current = null }
    lostRef.current.forEach(l => l.remove())
    lostRef.current = []

    // Lost territories
    ;(HIST_LOST[p.year] || []).forEach(lt => {
      const layer = L.geoJSON(geo(lt.coords), {
        style: {
          color: '#cc3311',
          weight: 1.5,
          dashArray: '6 4',
          fillColor: '#ee4422',
          fillOpacity: 0.28,
          opacity: 0.7,
        },
      }).bindTooltip(lt.name, { sticky: true }).addTo(map)
      lostRef.current.push(layer)
    })

    // Historical Siam territory — on top
    siamRef.current = L.geoJSON(geo(HIST_SIAM[p.year] || COORDS_TH), {
      style: {
        color: '#a05818',
        weight: 2.5,
        fillColor: '#e8a060',
        fillOpacity: 0.6,
      },
    }).bindTooltip(`Сиам ${p.year} · ${p.km}`, { sticky: true }).addTo(map)
  }

  return (
    <div
      ref={containerRef}
      style={{ height: 420, width: '100%', borderRadius: '12px 12px 0 0' }}
    />
  )
}
