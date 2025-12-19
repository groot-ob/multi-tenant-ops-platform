import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
console.log("Current Session:", JSON.stringify(session, null, 2));
  

  if (!session) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-3xl mb-4">SaaS Platform</h1>
        <Link href="/login" className="text-blue-600 underline">Please Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Select an Organization</h1>
      <ul className="space-y-2">
        {session.user.memberships.map((m) => (
          <li key={m.tenantId}>
            <Link 
              href={`/t/${m.slug}/dashboard`}
              className="block p-3 border rounded hover:bg-gray-50 transition"
            >
              {m.name} <span className="text-xs text-gray-400 uppercase">({m.role})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}