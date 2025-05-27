# skillboost5

## 概要
skillboost5は、OpenAI APIとFirebaseを活用して、日替わりの日本語クイズ問題を生成し、提供するReact Native（Expo）アプリケーションです。バックエンドにはFirebase Functionsを用いてGPT-4モデルで問題を生成し、Firestoreに保存します。クライアントアプリは日替わりクイズを取得して表示します。

## 前提条件
以下のソフトウェアがインストールされている必要があります。
- Node.js (推奨 v18.x)
- Yarn (または npm)
- Expo CLI (`npm install -g expo-cli`)
- Firebase CLI (`npm install -g firebase-tools`)
