import { UserForm } from "../../_components/UserForm";
import { getUserById } from "@/lib/api/admin/user";
import { getAuthToken } from "@/lib/cookies";
import { notFound } from "next/navigation";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAuthToken();

  try {
    const userData = await getUserById(id, token || undefined);

    // Backend returns: { success: true, data: user }
    const user = userData?.data || userData;

    if (!user) {
      notFound();
    }

    return (
      <div>
        <UserForm initialData={user} token={token || undefined} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch user:", error);
    notFound();
  }
}
