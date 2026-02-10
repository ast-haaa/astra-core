import OTPScreen from "../OTPScreen";

export default function OTPScreenExample() {
  return (
    <OTPScreen
      mobile="9876543210"
      onVerify={(otp) => console.log("OTP verified:", otp)}
      onBack={() => console.log("Back pressed")}
      onResend={() => console.log("Resend OTP")}
    />
  );
}
