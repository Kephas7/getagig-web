import { UserForm } from "../_components/UserForm";
import { getAuthToken } from "@/lib/cookies";

export default async function CreateUserPage() {
  const token = await getAuthToken();
  return (
    <div>
      <UserForm token={token || undefined} />
    </div>
  );
}
