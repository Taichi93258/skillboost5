import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const categories = ['Business Trends', 'IT', 'Health'];

export default function CategoryScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a category</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Quiz', { category: item })}>
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  itemText: { fontSize: 18 },
});