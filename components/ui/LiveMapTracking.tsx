import colors from '@/constants/colors';
import { GOOGLE_MAPS_API_KEY } from '@/constants/config';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { GlassCard } from './GlassCard';

const { width, height } = Dimensions.get('window');

interface Location {
  latitude: number;
  longitude: number;
}

interface LiveMapTrackingProps {
  pickup: Location;
  dropoff: Location;
  driverLocation?: Location;
  isActive?: boolean;
  height?: number;
}

export const LiveMapTracking: React.FC<LiveMapTrackingProps> = ({
  pickup,
  dropoff,
  driverLocation,
  isActive = false,
  height = 300,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [mapError, setMapError] = useState<string | null>(null);

  console.log('LiveMapTracking Debug:', {
    pickup,
    dropoff,
    driverLocation,
    isActive,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY ? `${GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 'AIzaSyAejqe2t4TAptcLnkpoFTTNMhm0SFHFJgQ'.substring(0, 10) + '...',
  });

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (point1: any, point2: any): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generate HTML for embedded Google Maps
  const generateMapHTML = () => {
    const apiKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'AIzaSyAejqe2t4TAptcLnkpoFTTNMhm0SFHFJgQ'
      ? GOOGLE_MAPS_API_KEY
      : '';

    if (!apiKey) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center; }
            .container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 16px; }
            .message { font-size: 14px; color: #666; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">📍 Route Preview</div>
            <div class="message">
              Google Maps API key not configured.<br>
              Showing route information instead.
            </div>
          </div>
        </body>
        </html>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .info-window { font-size: 12px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            const pickup = { lat: ${pickup.latitude}, lng: ${pickup.longitude} };
            const dropoff = { lat: ${dropoff.latitude}, lng: ${dropoff.longitude} };
            ${driverLocation ? `const driver = { lat: ${driverLocation.latitude}, lng: ${driverLocation.longitude} };` : ''}

            const map = new google.maps.Map(document.getElementById('map'), {
              zoom: 12,
              center: pickup,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              disableDefaultUI: true,
              zoomControl: true,
            });

            // Add pickup marker
            const pickupMarker = new google.maps.Marker({
              position: pickup,
              map: map,
              title: 'Pickup Location',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#10B981',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            });

            // Add dropoff marker
            const dropoffMarker = new google.maps.Marker({
              position: dropoff,
              map: map,
              title: 'Destination',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#EF4444',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            });

            ${driverLocation ? `
            // Add driver marker
            const driverMarker = new google.maps.Marker({
              position: driver,
              map: map,
              title: 'Driver Location',
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            });
            ` : ''}

            // Draw route line
            const routePath = new google.maps.Polyline({
              path: [pickup, dropoff],
              geodesic: true,
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            });
            routePath.setMap(map);

            // Fit bounds to show all markers
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(pickup);
            bounds.extend(dropoff);
            ${driverLocation ? 'bounds.extend(driver);' : ''}
            map.fitBounds(bounds);
          }

          // Initialize map when Google Maps API loads
          if (typeof google !== 'undefined') {
            initMap();
          } else {
            window.initMap = initMap;
          }
        </script>
      </body>
      </html>
    `;
  };

  return (
    <GlassCard style={[styles.container, { height }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          Live Route Tracking
        </Text>
        {isActive && (
          <View style={styles.liveBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
      </View>
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: generateMapHTML() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            setMapError('Failed to load map');
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent);
            setMapError('Failed to load map');
          }}
        />

        {/* Route info overlay */}
        <View style={styles.routeInfoOverlay}>
          <Text style={[styles.routeInfoText, { color: 'white' }]}>
            📍 {pickup.latitude.toFixed(4)}, {pickup.longitude.toFixed(4)} → {dropoff.latitude.toFixed(4)}, {dropoff.longitude.toFixed(4)}
          </Text>
          <Text style={[styles.routeInfoText, { color: 'rgba(255,255,255,0.8)' }]}>
            Distance: ~{calculateDistance(pickup, dropoff).toFixed(1)} km
          </Text>
        </View>
      </View>

    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
  },
  fallbackMap: {
    alignItems: 'center',
    padding: 20,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  routeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  routeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  fallbackNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  routeInfoOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
  },
  routeInfoText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
  },
});