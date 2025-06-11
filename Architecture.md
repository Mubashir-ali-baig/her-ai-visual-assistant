Here’s a detailed **Architecture Document** for your React Native companion AI app inspired by the movie *Her*.

---

# **Architecture Document: “HER” – Companion AI App**

## **1. Overview**

“HER” is a cross-platform (mobile & laptop) AI companion built using **React Native with Expo CLI**. It uses the device camera to observe surroundings, sends snapshots (and later video clips) to integrated **LLMs** (OpenAI, Gemini, Claude), receives contextual insights, and engages in memory-based conversations with the user.

---

## **2. Core Features**

| Feature                         | Description                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------- |
| **Auto Image Capture**          | Periodically captures images from the camera                                      |
| **Scene Understanding**         | Sends image to selected LLM with prompt, receives descriptive/commentary response |
| **Memory Storage**              | Saves image, LLM commentary, and metadata as a “memory”                           |
| **Contextual Conversation**     | Enables chat with AI, referencing recent and past memories                        |
| **Video Clip Capture (Future)** | Capture short video clips to enhance scene context                                |
| **Multi-LLM Integration**       | Select or blend between OpenAI, Gemini, and Claude models                         |

---

## **3. System Architecture**

### **3.1 High-Level Diagram**

```
            ┌────────────────────┐
            │    React Native    │
            │    (Expo App)      │
            └────────┬───────────┘
                     │
          ┌──────────▼────────────┐
          │   Camera Module       │ ◄──── Auto/Manual Trigger
          └────────┬──────────────┘
                   ▼
         ┌────────────────────┐
         │  Image/Video Store │ ◄── Expo FileSystem
         └────────┬───────────┘
                  ▼
        ┌──────────────────────────────┐
        │  LLM Integration Service     │ ◄─ Selectable: OpenAI / Gemini / Claude
        └────────┬─────────────────────┘
                 ▼
       ┌──────────────────────────────┐
       │  Memory Storage (SQLite /    │
       │  AsyncStorage / Cloud Store) │
       └────────┬─────────────────────┘
                ▼
       ┌────────────────────────────┐
       │   Chat + Memory Context    │ ◄─ Timeline + Threaded Conversation
       └────────────────────────────┘
```

---

## **4. Technology Stack**

| Layer                         | Technology                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------- |
| **Frontend**                  | React Native (Expo)                                                          |
| **Camera Access**             | `expo-camera`, `expo-media-library`                                          |
| **File Storage**              | `expo-file-system`                                                           |
| **Local DB**                  | `react-native-sqlite-storage` or `@react-native-async-storage/async-storage` |
| **Cloud Backend (Optional)**  | Firebase / Supabase / AWS Amplify                                            |
| **LLM APIs**                  | OpenAI API, Google Gemini API, Anthropic Claude API                          |
| **Authentication (Optional)** | Firebase Auth / OAuth (for cloud sync)                                       |
| **Voice (Optional)**          | `expo-speech`, `expo-av`, `react-native-tts`                                 |
| **Notification Scheduler**    | `expo-notifications`                                                         |

---

## **5. Module Breakdown**

### **5.1 Camera Controller**

* Uses `expo-camera` for access
* Auto-capture using background task (e.g., every 60s or based on event)
* Optional: Manual trigger for user-initiated capture
* Future: Switch between image and short video clip

### **5.2 Image/Video Preprocessor**

* Resize image (optimize for bandwidth)
* Store locally in `FileSystem.documentDirectory`

### **5.3 LLM Integration**

* Abstracted service to allow swapping between models
* Common prompt template:
  *"You're experiencing what I'm seeing. Describe or comment on this moment from your point of view."*
* Handles API calls and retries

```ts
interface LLMResponse {
  commentary: string;
  timestamp: number;
  source: "OpenAI" | "Gemini" | "Claude";
}
```

### **5.4 Memory Manager**

* Schema:

```ts
type Memory = {
  id: string;
  imageUri: string;
  videoUri?: string;
  commentary: string;
  createdAt: number;
  source: "OpenAI" | "Gemini" | "Claude";
};
```

* Stores in SQLite or AsyncStorage
* Optional sync to Supabase/Firebase for backup

### **5.5 Chat System**

* Built-in chat interface using context from:

  * Latest camera scene
  * Selected past memories
* Optional: Use `langchain`-like memory system to provide rolling memory window

---

## **6. Development Milestones**

| Milestone  | Scope                                                       |
| ---------- | ----------------------------------------------------------- |
| **MVP v1** | Image capture → LLM → Commentary → Memory save              |
| **v1.1**   | Memory timeline, basic chat referencing last LLM commentary |
| **v1.2**   | Supabase Integration, Storing memories, User based profile with signup and login, each user should have their memories stored separately from others                   |
| **v1.3**   | Video capture support (under 5s), automatic or manual       |
| **v2.0**   | Memory querying/chat + cloud sync + voice interaction       |

---

## **7. Security & Privacy**

* All camera captures stored locally unless cloud backup enabled
* Use encryption for local storage if sensitive
* Prompt user for consent before capturing anything
* Provide manual data purge and export features

---

## **8. Optional Enhancements**

* **Multimodal LLMs**: Use GPT-4o or Gemini 1.5 for image + video understanding
* **Voice Feedback**: Let the AI “talk” to the user using `TextToSpeech`
* **Biometric Gate**: Require FaceID/TouchID for sensitive access
* **Web App Companion**: React + Electron or web-based interface

---

## **9. Next Steps**

1. Scaffold the React Native Expo project
2. Implement Camera module with auto-capture
3. Create LLM service wrapper (OpenAI to start)
4. Implement Memory manager and local DB
5. Build chat UI with memory context
