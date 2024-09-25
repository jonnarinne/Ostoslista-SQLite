import { StyleSheet, TextInput, Button, View, FlatList, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

export default function App() {

  const db = SQLite.openDatabaseSync('productdb.db');

  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [products, setProducts] = useState([]);


  // Alustetaan tietokanta ja luodaan taulukko, jos sitä ei ole
  const initialize = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS item (id INTEGER PRIMARY KEY NOT NULL, product TEXT, amount TEXT);
      `);
      // Todo: update the course list
    } catch (error) {
      console.error('Could not open database', error);
    }
  }


    // Päivitetään lista tietokannasta
    const updateList = async () => {
      try {
        const list = await db.getAllAsync('SELECT * from item');
        setProducts(list);
      } catch (error) {
        console.error('Could not get items', error);
      }
    }

  // Lisätään uusi ostos tietokantaan
  const saveItem = async () => {
    try {
      await db.runAsync('INSERT INTO item VALUES (?, ?, ?)', null, product, amount);
      // Todo: update the course list
    } catch (error) {
      console.error('Could not add item', error);
    }
  };

  // Poista ostos tietokannasta
  const deleteItem = async (id) => {
    console.log('deleteItem')
    try {
      await db.runAsync('DELETE FROM item WHERE id=?', id);
      await updateList();
    }
    catch (error) {
      console.error('Could not delete item', error);
    }
  }

  useEffect(() => {
    initialize(); // Kutsutaan kun komponentti renderöidään ensimmäistä kertaa
  }, []);

  return (
    <View style={styles.container}>
    <TextInput
      placeholder='Product'
      onChangeText={setProduct}
      value={product}
      style={styles.input}
    />
    <TextInput
      placeholder='Amount'
      onChangeText={setAmount}
      value={amount}
      style={styles.input}
    />
    <Button onPress={saveItem} title="Save" />

    <FlatList
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) =>
        <View style={styles.itemContainer}>
          <Text>{item.product}</Text>
          <Text>{item.amount}</Text>
          <Text style={styles.boughtText} onPress={() => deleteItem(item.id)}>bought</Text>
        </View>}
      data={products}
    />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
  boughtText: {
    color: '#0000ff',
  },
});