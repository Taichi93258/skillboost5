import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Alert, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Card, Button as PaperButton, Paragraph, Title } from 'react-native-paper';
import { auth } from '../firebase';

export default function UserInfoScreen() {
  const headerHeight = useHeaderHeight();
  const user = auth.currentUser;

  const handlePasswordReset = async () => {
    if (!user || !user.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert('送信完了', 'パスワードリセット用のメールを送信しました');
    } catch (e) {
      const errorMessage = (() => {
        switch (e.code) {
          case 'auth/invalid-email':
            return '有効なメールアドレスを入力してください';
          case 'auth/user-not-found':
            return '指定されたメールアドレスのユーザーは存在しません';
          default:
            return '送信に失敗しました';
        }
      })();
      Alert.alert('エラー', errorMessage);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientBackground}>
      <Animatable.View
        animation="fadeInDown"
        style={[
          styles.container,
          { justifyContent: 'flex-start', marginTop: headerHeight * 2.5 },
        ]}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>ユーザー情報</Title>
            <Paragraph style={styles.subtitle}>ニックネーム: {user.displayName || ''}</Paragraph>
            <Paragraph style={styles.subtitle}>メールアドレス: {user.email || ''}</Paragraph>
          </Card.Content>
          <Card.Actions>
            <PaperButton
              mode="contained"
              icon="lock-reset"
              onPress={handlePasswordReset}
              style={styles.button}
            >
              パスワードをリセット
            </PaperButton>
          </Card.Actions>
        </Card>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 16 },
  card: { width: '100%', maxWidth: 400, },
  button: { marginLeft: 'auto' },
});
