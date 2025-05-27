# skillboost5

## 概要
skillboost5は、OpenAI APIとFirebaseを活用して、日替わりの日本語クイズ問題を生成し、提供するReact Native（Expo）アプリケーションです。バックエンドにはFirebase Functionsを用いてGPT-4モデルで問題を生成し、Firestoreに保存します。クライアントアプリは日替わりクイズを取得して表示します。

## 前提条件
以下のソフトウェアがインストールされている必要があります。
- Node.js (推奨 v18.x)
- Yarn (または npm)
- Expo CLI (`npm install -g expo-cli`)
 - Firebase CLI (`npm install -g firebase-tools`)

## 環境変数の設定
プロジェクトのルートディレクトリで、`.env.example` をコピーして `.env` を作成し、Firebaseの設定を入力してください。

```bash
cp .env.example .env
```

開発環境用には `.env.development` を同様にコピーして環境変数を設定します。

```bash
cp .env.example .env.development
```

必要に応じて以下の変数を編集してください:
- `FIREBASE_USE_EMULATOR`: `true` を設定するとローカルのFirebaseエミュレータを使用します。
- `DAILY_QUESTION_DATE`: クイズを取得する日付を指定します (YYYY-MM-DD)。

## Firebaseエミュレータの起動
ローカルでFirebase Emulator Suiteを起動します。

```bash
firebase emulators:start --only auth,firestore,ui
```
