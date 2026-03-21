// 네비게이션 설정 - 새 메뉴 추가 시 이 파일만 수정
export interface NavItem {
  label: string;
  labelKo: string;
  href: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "News",
    labelKo: "뉴스",
    href: "/news",
  },
  {
    label: "Reviews",
    labelKo: "리뷰",
    href: "/reviews",
    children: [
      { label: "All Reviews", labelKo: "전체", href: "/reviews" },
      { label: "Korea", labelKo: "한국", href: "/reviews?country=kr" },
      { label: "Japan", labelKo: "일본", href: "/reviews?country=jp" },
      { label: "Asia", labelKo: "아시아", href: "/reviews?country=asia" },
      { label: "UK / US", labelKo: "영미권", href: "/reviews?country=en" },
    ],
  },
  {
    label: "Demo",
    labelKo: "데모 신청",
    href: "/demo",
  },
  {
    label: "About",
    labelKo: "소개",
    href: "/about",
  },
];

export const SITE_CONFIG = {
  name: "push play",
  tagline: "Discover music the world hasn't heard yet",
  description:
    "Independent media covering hidden indie artists from Korea, Japan, Asia, and beyond.",
  socials: {
    instagram: "https://www.instagram.com/pushplay_mag/",
    spotify: "https://open.spotify.com/user/313pk2lxylwsnsdplstuij3lgkzi?si=aa248e3b47664809",
  },
};
