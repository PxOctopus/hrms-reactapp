export default function Badge({
  text,
  tone = "gray",
}: { text: string; tone?: "gray" | "green" | "red" }) {
  const map: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[tone]}`}>
      {text}
    </span>
  );
}