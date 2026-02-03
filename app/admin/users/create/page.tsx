import { UserForm } from "../_components/UserForm";
import { getAuthToken } from "@/lib/cookies";

export default async function CreateUserPage() {
  const token = await getAuthToken();
  return (
    <div className="p-6">
      <UserForm token={token || undefined} />
    </div>
  );
}
