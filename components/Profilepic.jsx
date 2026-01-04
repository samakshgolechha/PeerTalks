export default function Profilepic({ gender, className }) {
  return <img className={"object-cover rounded-full " + className} src={gender == "Female" ? "https://www.pngall.com/wp-content/uploads/5/Profile-Female-PNG-Image.png" : "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG.png"} alt={"User Profile"} />
}