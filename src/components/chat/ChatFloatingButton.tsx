/**
 * 우측 하단 고정 채팅버튼입니다.
 * 클릭 시 모달이 열리고, 모달이 열려있을 때는 X 아이콘으로 바뀝니다.
 */
import { MessageCircle, X } from "lucide-react";

export default function ChatFloatingButton({ 
    onClick, 
    isOpen 
}: { 
    onClick: () => void;
    isOpen: boolean;
}) {
    return (
        <button
            className="fixed bottom-6 right-6 z-[1003] w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-600/20 ring-1 ring-black/10 flex items-center justify-center hover:brightness-105 active:scale-95 transition-all duration-300"
            onClick={onClick}
            aria-label={isOpen ? "채팅 닫기" : "채팅 열기"}
        >
            <div className="relative w-6 h-6 flex items-center justify-center">
                <MessageCircle 
                    className={`w-6 h-6 absolute transition-all duration-300 ${
                        isOpen 
                            ? 'opacity-0 scale-75 rotate-90' 
                            : 'opacity-100 scale-100 rotate-0'
                    }`} 
                />
                <X 
                    className={`w-6 h-6 absolute transition-all duration-300 ${
                        isOpen 
                            ? 'opacity-100 scale-100 rotate-0' 
                            : 'opacity-0 scale-75 -rotate-90'
                    }`} 
                />
            </div>
        </button>
    );
}