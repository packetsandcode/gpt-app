import { Chat } from "./components/chat";
import { cookies } from "next/headers";
import { DEFAULT_CHAT_MODEL } from "./components/common/models";
import { generateUUID } from "./components/common/utils";
import { useSharedData } from "./context/sharedDataContext";

export default function Home() {
  const id = generateUUID();
  
  return (
    <div className="transition-all duration-300 group-[.sidebar-wrapper]/sidebar-wrapper:data-[state=expanded]:ml-[var(--sidebar-width)] ml-0">
      <Chat 
        id={id}
        initialMessages={[]}
        initialChatModel={DEFAULT_CHAT_MODEL}
        initialVisibilityType="private"
        isReadonly={false}
      />
    </div>
  );
}
