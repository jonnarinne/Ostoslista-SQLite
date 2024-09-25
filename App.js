import { StyleSheet, TextInput, Button, View, FlatList, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

export default function App() {

  const db = SQLite.openDatabase('productdb.db');

  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [products, setProducts] = useState([]);


  // Alustetaan tietokanta ja luodaan taulukko, jos sitä ei ole
  const initialize = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY NOT NULL, product TEXT, amount TEXT);`,
        [],
        () => updateList(), // Päivitetään lista kun tietokanta on luotu onnistuneesti
        (txObj, error) => console.error('Could not open database', error)
      );
    });
  };


    // Päivitetään lista tietokannasta
    const updateList = () => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM products;',
          [],
          (txObj, resultSet) => setProducts(resultSet.rows._array), // Päivitetään tuotteet
          (txObj, error) => console.error('Could not get items', error)
        );
      });
    };

  // Lisätään uusi ostos tietokantaan
  const saveItem = () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO products (product, amount) VALUES (?, ?);',
        [product, amount],
        () => {
          updateList(); // Päivitetään lista kun uusi item on lisätty
          setProduct(''); // Tyhjennetään kentät
          setAmount('');
        },
        (txObj, error) => console.error('Could not add item', error)
      );
    });
  };

  // Poista ostos tietokannasta
  const deleteItem = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM products WHERE id = ?;',
        [id],
        () => updateList(), // Päivitä lista kun item on poistettu
        (txObj, error) => console.error('Could not delete item', error)
      );
    });
  };

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
  },
});
