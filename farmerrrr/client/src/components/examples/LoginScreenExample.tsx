import LoginScreen from "../LoginScreen";

export default function LoginScreenExample() {
  return <LoginScreen onSendOTP={(mobile) => console.log("OTP sent to:", mobile)} />;
}
