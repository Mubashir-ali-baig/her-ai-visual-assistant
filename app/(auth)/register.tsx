import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeContext } from "../../contexts/ThemeContext";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp } = useAuth();
  const { currentTheme } = useThemeContext();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await signUp(email, password);
      Alert.alert(
        "Success",
        "Registration successful! Please check your email for verification.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
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
        <Text style={themedStyles.title}>Create Account</Text>
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
        <TextInput
          style={themedStyles.input}
          placeholder="Confirm Password"
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={themedStyles.button} onPress={handleRegister}>
          <Text style={themedStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={themedStyles.link}>Already have an account? Login</Text>
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
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: isDark ? "#ECEDEE" : "#11181C",
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
