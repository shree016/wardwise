'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export interface Issue {
  id: string;
  issue_type: string;
  severity: string;
  severity_score: number;
  status: string;
  description: string;
  latitude: number;
  longitude: number;
  ward_name: string;
  reporter_name: string;
  reported_count: number;
  created_at: string;
}

interface Props {
  issues: Issue[];
  selected: Issue | null;
  onSelect: (issue: Issue) => void;
  openCount: number;
  fixedCount: number;
  verifiedCount: number;
}

const STATUS_COLOR: Record<string, string> = {
  open: '#ef4444',
  fixed: '#f59e0b',
  verified: '#22c55e',
};

function toGeoJSON(issues: Issue[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: issues
      .filter(i => i.latitude && i.longitude)
      .map(i => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [i.longitude, i.latitude] },
        properties: {
          id: i.id,
          issue_type: i.issue_type,
          severity: i.severity,
          severity_score: i.severity_score,
          status: i.status,
          description: i.description || '',
          ward_name: i.ward_name,
          reporter_name: i.reporter_name || 'Anonymous',
          reported_count: i.reported_count,
          created_at: i.created_at,
          color: STATUS_COLOR[i.status] ?? '#6b7280',
          radius: i.severity === 'high' ? 14 : i.severity === 'medium' ? 10 : 7,
          stroke_width: i.status === 'open' ? 2.5 : 1.5,
        },
      })),
  };
}

export default function MapboxCanvas({ issues, selected, onSelect, openCount, fixedCount, verifiedCount }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const initializedRef = useRef(false);

  // Init map once
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [77.6245, 12.9352],
      zoom: 11.5,
      pitch: 20,
      antialias: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      // ── Sources ──────────────────────────────────────────
      map.addSource('issues', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: false,
      });

      // ── Glow / halo layer (behind circles) ───────────────
      map.addLayer({
        id: 'issues-glow',
        type: 'circle',
        source: 'issues',
        paint: {
          'circle-radius': ['*', ['get', 'radius'], 1.8],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.18,
          'circle-blur': 1,
        },
      });

      // ── Main circle layer ─────────────────────────────────
      map.addLayer({
        id: 'issues-circles',
        type: 'circle',
        source: 'issues',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            9, ['*', ['get', 'radius'], 0.5],
            14, ['get', 'radius'],
            18, ['*', ['get', 'radius'], 1.5],
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': ['get', 'stroke_width'],
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.92,
          'circle-stroke-opacity': 0.95,
        },
      });

      // ── Label layer ───────────────────────────────────────
      map.addLayer({
        id: 'issues-labels',
        type: 'symbol',
        source: 'issues',
        minzoom: 13,
        layout: {
          'text-field': [
            'match', ['get', 'issue_type'],
            'pothole', '🕳',
            'garbage_dump', '🗑',
            'broken_streetlight', '💡',
            '⚠',
          ],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            13, 10,
            16, 16,
          ],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
      });

      // ── Selected highlight ring ───────────────────────────
      map.addSource('selected', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'selected-ring',
        type: 'circle',
        source: 'selected',
        paint: {
          'circle-radius': ['+', ['get', 'radius'], 8],
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#a78bfa',
          'circle-stroke-opacity': 0.9,
        },
      });

      // ── Cursor changes ────────────────────────────────────
      map.on('mouseenter', 'issues-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'issues-circles', () => {
        map.getCanvas().style.cursor = '';
      });

      // ── Click handler ─────────────────────────────────────
      map.on('click', 'issues-circles', e => {
        const props = e.features?.[0]?.properties;
        if (!props) return;
        // Reconstruct issue from feature properties
        const issue: Issue = {
          id: props.id,
          issue_type: props.issue_type,
          severity: props.severity,
          severity_score: props.severity_score,
          status: props.status,
          description: props.description,
          latitude: (e.features![0].geometry as GeoJSON.Point).coordinates[1],
          longitude: (e.features![0].geometry as GeoJSON.Point).coordinates[0],
          ward_name: props.ward_name,
          reporter_name: props.reporter_name,
          reported_count: props.reported_count,
          created_at: props.created_at,
        };
        onSelect(issue);
      });

      // ── Click on blank ────────────────────────────────────
      map.on('click', e => {
        const hit = map.queryRenderedFeatures(e.point, { layers: ['issues-circles'] });
        if (!hit.length) onSelect(null as any);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update GeoJSON source whenever issues list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('issues') as mapboxgl.GeoJSONSource | undefined;
    if (src) src.setData(toGeoJSON(issues));
  }, [issues]);

  // Highlight selected issue
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('selected') as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;

    if (!selected) {
      src.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    src.setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [selected.longitude, selected.latitude] },
        properties: {
          radius: selected.severity === 'high' ? 14 : selected.severity === 'medium' ? 10 : 7,
        },
      }],
    });

    map.flyTo({
      center: [selected.longitude, selected.latitude],
      zoom: Math.max(map.getZoom(), 14),
      duration: 800,
      essential: true,
    });
  }, [selected]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 px-3 py-2.5 shadow-xl">
          <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest mb-2">City Overview</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-5 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" />
                <span className="text-red-300">Open</span>
              </span>
              <span className="font-bold text-red-300 tabular-nums">{openCount}</span>
            </div>
            <div className="flex items-center justify-between gap-5 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_4px_#f59e0b]" />
                <span className="text-yellow-300">Fixed</span>
              </span>
              <span className="font-bold text-yellow-300 tabular-nums">{fixedCount}</span>
            </div>
            <div className="flex items-center justify-between gap-5 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]" />
                <span className="text-green-300">Verified</span>
              </span>
              <span className="font-bold text-green-300 tabular-nums">{verifiedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
