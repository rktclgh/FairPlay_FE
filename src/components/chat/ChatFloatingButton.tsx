/**
 * 우측 하단 고정 채팅버튼입니다.
 * 클릭 시 모달이 열립니다.
 */
import { MessageCircle } from "lucide-react";

export default function ChatFloatingButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            className="fixed bottom-6 right-6 z-[1003] w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-black/10 flex items-center justify-center hover:brightness-105 active:scale-95 transition"
            onClick={onClick}
            aria-label="채팅 열기"
        >
            <MessageCircle className="w-6 h-6" />
        </button>
    );
}