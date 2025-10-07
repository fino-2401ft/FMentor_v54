// components/HackerNewsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Linking, TouchableOpacity } from "react-native";

interface HNStory {
  id: number;
  title: string;
  by: string;
  url?: string;
  score: number;
}

export default function HackerNewsScreen() {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStories = async () => {
      try {
        const topIdsResp = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
        const topIds: number[] = await topIdsResp.json();
        const top12 = topIds.slice(0, 12);
        const storiesData = await Promise.all(
          top12.map(async (id) => {
            const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            return res.json();
          })
        );
        setStories(storiesData);
      } catch (error) {
        console.error("Error fetching Hacker News:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStories();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="blue" style={{ marginTop: 50 }} />;

  return (
    <FlatList
      data={stories}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => item.url && Linking.openURL(item.url)}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>By {item.by}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginVertical: 8,
    marginHorizontal: 15,
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  meta: {
    fontSize: 12,
    color: "#777",
  },
});