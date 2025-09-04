import { useAuth } from "../../context/AuthContext";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return "∎";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "∎";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function domainFromEmail(email?: string | null) {
  if (!email) return "";
  const at = email.indexOf("@");
  return at > -1 ? email.slice(at + 1) : "";
}

export default function CompanyBadge({ href = "/companies" }: { href?: string }) {
  const { user } = useAuth();
  // name fallback chain: company.name -> companyName -> email domain
  const name =
    (user as any)?.company?.name ||
    (user as any)?.companyName ||
    domainFromEmail(user?.email) ||
    "—";

  return (
    <a
      href={href}
      className="group inline-flex items-center rounded-xl border bg-white/80 px-3 py-2 shadow-sm hover:bg-white transition"
      title="View company"
    >
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white text-sm font-semibold">
        {initials(name)}
      </div>
      <div className="ml-3 leading-tight">
        <div className="text-[10px] uppercase tracking-wide text-gray-500">Company</div>
        <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
          {name}
        </div>
      </div>
    </a>
  );
}
