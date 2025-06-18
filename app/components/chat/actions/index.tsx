// import { cookies } from "next/headers";
import type { VisibilityType } from "../header/visibility-selector";
import { updateChatVisiblityById } from "@/app/lib/db/queries";

// export async function saveChatModelAsCookie(model: string) {
//   const cookieStore = await cookies();
//   cookieStore.set('chat-model', model);
// }

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}