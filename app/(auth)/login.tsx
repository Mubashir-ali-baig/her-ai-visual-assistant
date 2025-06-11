import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  DevSettings,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeContext } from "../../contexts/ThemeContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const { currentTheme } = useThemeContext();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      router.replace("/");
      setTimeout(() => {
        DevSettings.reload();
      }, 100);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const isDark = currentTheme === "dark";
  const themedStyles = getThemedStyles(isDark);

  return (
    <View style={themedStyles.container}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={themedStyles.logo}
      />
      <Text style={themedStyles.appTitle}>Her</Text>
      <Text style={themedStyles.subtitle}>Her sees for you</Text>
      <View style={themedStyles.form}>
        <TextInput
          style={themedStyles.input}
          placeholder="Email"
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={themedStyles.input}
          placeholder="Password"
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={themedStyles.button} onPress={handleLogin}>
          <Text style={themedStyles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={themedStyles.link}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getThemedStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: isDark ? "#151718" : "#fff",
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 16,
      borderRadius: 20,
    },
    appTitle: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 4,
      color: isDark ? "#ECEDEE" : "#11181C",
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#aaa" : "#888",
      textAlign: "center",
      marginBottom: 32,
    },
    form: {
      width: "100%",
      maxWidth: 400,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      backgroundColor: isDark ? "#23272a" : "#fff",
      color: isDark ? "#ECEDEE" : "#11181C",
    },
    button: {
      backgroundColor: "#007AFF",
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
    },
    link: {
      color: "#007AFF",
      textAlign: "center",
    },
  });
}
