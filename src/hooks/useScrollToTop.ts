import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    // pathname이 변경되었을 때만 스크롤 실행
    if (prevPathname.current !== pathname) {
      // 자동 스크롤 중인지 확인
      if (!isAutoScrolling.current) {
        // 여러 방법으로 스크롤을 최상단으로 이동
        const scrollToTop = () => {
          // 1. window.scrollTo 사용
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant", // smooth 대신 instant 사용
          });

          // 2. document.documentElement.scrollTop
          if (document.documentElement) {
            document.documentElement.scrollTop = 0;
          }

          // 3. document.body.scrollTop
          if (document.body) {
            document.body.scrollTop = 0;
          }

          // 4. 모든 스크롤 가능한 요소들도 리셋
          const scrollableElements =
            document.querySelectorAll("[data-scrollable]");
          scrollableElements.forEach((element) => {
            if (element instanceof HTMLElement) {
              element.scrollTop = 0;
            }
          });

          // 5. 추가로 한 번 더 확인
          setTimeout(() => {
            if (window.scrollY !== 0) {
              window.scrollTo(0, 0);
            }
            if (
              document.documentElement &&
              document.documentElement.scrollTop !== 0
            ) {
              document.documentElement.scrollTop = 0;
            }
            if (document.body && document.body.scrollTop !== 0) {
              document.body.scrollTop = 0;
            }
          }, 50);
        };

        // 즉시 실행
        scrollToTop();

        // requestAnimationFrame을 사용하여 다음 프레임에서 실행
        requestAnimationFrame(() => {
          scrollToTop();
        });

        // 약간의 지연 후 한 번 더 실행 (DOM 렌더링 완료 후)
        const timer = setTimeout(scrollToTop, 100);

        // 추가로 더 긴 지연 후 한 번 더 실행
        const timer2 = setTimeout(scrollToTop, 300);

        // 마지막으로 한 번 더 실행
        const timer3 = setTimeout(scrollToTop, 500);

        return () => {
          clearTimeout(timer);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };
      }
    }

    prevPathname.current = pathname;
  }, [pathname]);

  // 자동 스크롤 상태를 외부에서 제어할 수 있도록 함수 반환
  const setAutoScrolling = (scrolling: boolean) => {
    isAutoScrolling.current = scrolling;
  };

  // 기본 사용법을 위한 함수 (기존 코드와의 호환성 유지)
  const scrollToTop = () => {
    if (!isAutoScrolling.current) {
      // 즉시 실행
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // requestAnimationFrame을 사용하여 다음 프레임에서도 실행
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body) {
          document.body.scrollTop = 0;
        }
      });
    }
  };

  return {
    setAutoScrolling,
    scrollToTop,
  };
};
