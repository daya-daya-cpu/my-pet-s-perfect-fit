import { createFileRoute } from "@tanstack/react-router";
import SizeFinder from "@/components/SizeFinder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "큰강아지 사이즈 추천 연구소 | 대형견 옷 사이즈 진짜 후기로 찾기" },
      { name: "description", content: "AI 추천 대신, 우리 아이와 비슷한 체형의 친구들이 실제로 입은 사이즈와 후기를 보여드려요. 대형견 의류 큰강아지." },
      { property: "og:title", content: "큰강아지 사이즈 추천 연구소" },
      { property: "og:description", content: "비슷한 체형 친구들의 진짜 후기로 사이즈 찾기" },
    ],
  }),
  component: () => (
    <main className="min-h-screen bg-background">
      <SizeFinder />
    </main>
  ),
});
