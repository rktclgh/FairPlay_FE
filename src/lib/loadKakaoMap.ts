export function loadKakaoMap(callback: () => void) {
    const kakaoKey = import.meta.env.VITE_KAKAO_MAP_ID;

    if (!kakaoKey) {
        console.error("카카오 API 키가 정의되지 않았습니다.");
        return;
    }

    // 이미 로드된 경우 (중복 방지)
    if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(callback); // 반드시 load 안에서 실행
        return;
    }

    const existingScript = document.querySelector(`script[src*="dapi.kakao.com"]`);
    if (existingScript) {
        existingScript.addEventListener("load", () => {
            window.kakao.maps.load(callback);
        });
        return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;

    script.onerror = () => console.error("카카오맵 SDK 로드 실패");

    script.onload = () => {
        window.kakao.maps.load(callback);
    };

    document.head.appendChild(script);
}
