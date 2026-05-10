export type Fit = "perfect" | "slightly_loose" | "loose";
export type Gender = "female" | "male";

export interface Review {
  id: number;
  product: string;
  name: string;
  breed: string;
  gender: Gender;
  weight: number;
  chest: number;
  back: number;
  size: string;
  fit: Fit;
  fitLabel: string;
  review: string;
  date: string;
  helpful: number;
}

export interface Product {
  name: string;
  sizing: "kr" | "eu";
  stretch: "high" | "medium" | "none";
  stretchLabel: string;
}

export const PRODUCTS: Product[] = [
  { name: "국민나시", sizing: "kr", stretch: "high", stretchLabel: "신축성 좋음" },
  { name: "리얼쿨나시", sizing: "kr", stretch: "high", stretchLabel: "신축성 좋음" },
  { name: "메쉬나시", sizing: "eu", stretch: "none", stretchLabel: "신축성 없음" },
  { name: "양메쉬나시", sizing: "kr", stretch: "medium", stretchLabel: "신축성 보통" },
  { name: "요루면나시", sizing: "kr", stretch: "medium", stretchLabel: "신축성 보통" },
  { name: "농구나시", sizing: "kr", stretch: "high", stretchLabel: "신축성 좋음" },
];

const fitMap = (f: Fit) =>
  f === "perfect" ? "딱 맞음" : f === "slightly_loose" ? "약간 넉넉" : "넉넉함";

const sizesKR = ["M", "L", "XL", "2XL", "3XL"];
const sizesEU = ["M", "L", "XL", "2XL"];

const breeds = ["진도믹스", "리트리버", "보더콜리", "사모예드", "허스키", "라브라도", "셰퍼드", "도사믹스", "믹스견", "스탠다드푸들"];
const namesF = ["단팥이", "초코", "보리", "설이", "콩이", "마음이", "별이", "봄이", "달이", "꿀이"];
const namesM = ["바둑이", "두부", "감자", "구름이", "산이", "달봉이", "호두", "장군이", "쿠키", "토토"];

function makeReviews(): Review[] {
  const out: Review[] = [];
  let id = 1;
  for (const p of PRODUCTS) {
    const sizes = p.sizing === "eu" ? sizesEU : sizesKR;
    for (let i = 0; i < 12; i++) {
      const gender: Gender = i % 2 === 0 ? "female" : "male";
      const weight = 15 + ((i * 3 + p.name.length) % 35);
      const chest = 50 + ((i * 4 + p.name.length * 2) % 40);
      const back = 32 + ((i * 3) % 35);
      // size pick by chest
      const sIdx = Math.min(sizes.length - 1, Math.floor((chest - 50) / 10));
      const size = sizes[sIdx];
      const fit: Fit = i % 3 === 0 ? "perfect" : i % 3 === 1 ? "slightly_loose" : "loose";
      const reviewsTxt = [
        `가슴 ${chest}인데 ${size} 딱 좋아요. 입히기 편해요.`,
        `${weight}kg ${gender === "female" ? "여아" : "남아"}예요. ${size} 사이즈 추천!`,
        `등길이 ${back}cm인데 ${size} 길이 적당해요.`,
        `${p.stretch === "none" ? "신축성 없어서 한 사이즈 크게 갔는데 잘했어요." : "핏 너무 예뻐요. 재구매 의사 있어요."}`,
        `우리 ${gender === "female" ? namesF[i % 10] : namesM[i % 10]}한테 잘 어울려요.`,
      ];
      out.push({
        id: id++,
        product: p.name,
        name: gender === "female" ? namesF[i % 10] : namesM[i % 10],
        breed: breeds[(i + p.name.length) % breeds.length],
        gender,
        weight,
        chest,
        back,
        size,
        fit,
        fitLabel: fitMap(fit),
        review: reviewsTxt[i % reviewsTxt.length],
        date: `2025.${String(((i % 11) + 1)).padStart(2, "0")}`,
        helpful: 5 + ((i * 7 + p.name.length) % 60),
      });
    }
  }
  return out;
}

export const REVIEWS: Review[] = makeReviews();
