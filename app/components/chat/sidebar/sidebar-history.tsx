import type { Chat } from "@/app/lib/db/schema";

const PAGE_SIZE = 20;

export interface ChatHistory {
    chats: Array<Chat>;
    hasMore: boolean;
}

export function getChatHistoryPaginationKey(
    pageIndex: number,
    previousPageData: ChatHistory,
) {
    if (previousPageData && previousPageData.hasMore === false) {
        return null;
    }

    if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

    const firstChatFromPage = previousPageData.chats.at(-1);

    if (!firstChatFromPage) return null;

    return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}