import { AsyncStorage } from 'react-native';

export const commonHelper = {
  getFilters
}

async function getFilters() {
  let data = await AsyncStorage.getItem('user_filters');
  data = JSON.parse(data);
  return data;
}

async function setFilters() {
  
}