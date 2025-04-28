import { Stack, useRouter, usePathname } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    if (pathname.includes("/materi")) setActiveTab("materi");
    else if (pathname.includes("/gameA")) setActiveTab("permainan");
    else setActiveTab("home");

    console.log("Current Pathname:", pathname);
  }, [pathname]);

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === "home") router.push("/");
    else if (tabName === "materi") router.push("/(tabs)/materi");
    else if (tabName === "permainan") router.push("/(tabs)/gameA");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});