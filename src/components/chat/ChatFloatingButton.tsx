/**
 * 우측 하단 고정 채팅버튼입니다.
 * 클릭 시 모달이 열립니다.
 */
export default function ChatFloatingButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-black text-white shadow-xl flex items-center justify-center hover:bg-neutral-800 transition"
            onClick={onClick}
            aria-label="채팅 열기"
        >
            <span className="text-3xl">💬</span>
        </button>
    );
}