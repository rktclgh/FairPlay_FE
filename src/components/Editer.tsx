import React, { useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// 1) 픽커 모듈 & CSS
// 타입 선언이 없을 수 있어 any 처리
// eslint-disable-next-line @typescript-eslint/no-var-requires
import QuillBetterTablePicker from 'quill-better-table-picker';
// CSS 반드시 포함 (툴바 그리드 픽커 UI)
import 'quill-better-table-picker/dist/quill-better-table-picker.css';

// 2) 이 모듈은 Quill이 window 전역에 있어야 동작
// (패키지 README 요구 사항)
(window as any).Quill = Quill;

// 3) 모듈 등록
Quill.register(
    {
        'modules/better-table': QuillBetterTablePicker.default || QuillBetterTablePicker,
    },
    true
);

export default function QuillWithGridPicker() {
    const quillRef = useRef<ReactQuill | null>(null);

    const modules = useMemo(
        () => ({
            // 픽커 버튼은 툴바에서 {"better-table": []} 형태로 선언
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', { 'better-table': [] }], // ← 그리드 픽커 버튼
            ],
            // 모듈 활성화
            'better-table': true,
            history: { delay: 1000, maxStack: 100, userOnly: true },
        }),
        []
    );

    return (
        <ReactQuill
            ref={quillRef}
            // 중요: 픽커가 커스텀 테마를 기대함
            theme="better-table-snow"
            modules={modules}
            placeholder="내용을 입력하세요…"
        />
    );
}
