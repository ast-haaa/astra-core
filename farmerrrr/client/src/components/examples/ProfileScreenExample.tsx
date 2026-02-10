import ProfileScreen from "../ProfileScreen";

export default function ProfileScreenExample() {
  return (
    <ProfileScreen
      name="Ramesh Kumar"
      mobile="+91 98765 43210"
      village="Chandpur, Uttar Pradesh"
      language="Hindi"
      onEditProfile={() => console.log("Edit profile")}
      onSettings={() => console.log("Settings")}
      onLogout={() => console.log("Logout")}
    />
  );
}
