import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import React, { useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { API_KEY, API_KEY2 } from '@env';
import * as Location from 'expo-location';


export default function App() {
  const [search, setSearch] = React.useState("");
  const [region, setRegion] = React.useState({
    latitude: 60.200692,
    longitude: 24.934302,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [restaurants, setRestaurants] = React.useState([]);

  async function myLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
    let myLocation = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: myLocation.coords.latitude,
      longitude: myLocation.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  useEffect(() => {
    (async () => {
      await myLocation();
    })();
  }, []);

  const getLocation = () => {
    fetch(`https://geocode.maps.co/search?q=${search}&api_key=${API_KEY}`)
      .then((response) => response.json())
      .then((data) => {
        const location = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(location);
        getRestaurants(location);
      })
  };

  const getRestaurants = (location) => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=500&type=restaurant&key=${API_KEY2}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const restaurants = data.results.map((restaurant) => {
          return {
            name: restaurant.name,
            latitude: restaurant.geometry.location.lat,
            longitude: restaurant.geometry.location.lng,
            vicinity: restaurant.vicinity,
          };
        });
        setRestaurants(restaurants);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
  return (
    <View style={styles.container}>
      <MapView style={{ width: "100%", height: "90%" }}
        region={region}>
        <Marker
          coordinate={region}
        />
        {restaurants.map((restaurant, index) => (
          <Marker
            pinColor={'yellow'}
            key={index}
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude
            }}
            title={restaurant.name}
            description={restaurant.vicinity}
          />
        ))}
      </MapView>
      <View style={styles.searchBar}>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, textAlign: "center" }}
          placeholder="Search"
          onChangeText={(text) => setSearch(text)}
        />
        <Button style={styles.button} title="View"
          onPress={getLocation}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    width: "100%",
    height: "10%",
  },
  button: {
    width: "60%",
    height: 20,
  }
});
