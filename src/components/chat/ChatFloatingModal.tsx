// src/components/Chat/ChatFloatingModal.tsx

import { useState } from "react";
import ChatModal from "./ChatModal";
import ChatFloatingButton from "./ChatFloatingButton";

export default function ChatFloatingModal() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ChatFloatingButton onClick={() => setOpen(true)} />
            <ChatModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}
