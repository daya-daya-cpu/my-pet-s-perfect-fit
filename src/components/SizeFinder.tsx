import { useMemo, useState } from "react";
import { PRODUCTS, REVIEWS, type Product, type Review, type Fit, type Gender } from "@/data/reviews";

type Step = 1 | 2 | 3 | 4;

interface DogInfo {
  breed: string;
  gender: Gender | null;
  weight: number;
  chest: number;
  back: number;
}
interface FitPref {
  chestFit: "snug" | "loose" | null;
  backFit: "snug" | "short" | null;
  belly: "cover" | "any" | null;
}

const initialDog: DogInfo = { breed: "", gender: null, weight: 25, chest: 65, back: 50 };
const initialFit: FitPref = { chestFit: null, backFit: null, belly: null };

export default function SizeFinder() {
  const [step, setStep] = useState<Step>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [dog, setDog] = useState<DogInfo>(initialDog);
  const [fit, setFit] = useState<FitPref>(initialFit);
  const [filter, setFilter] = useState<"all" | "perfect" | "loose">("all");

  const reset = () => {
    setStep(1); setProduct(null); setDog(initialDog); setFit(initialFit); setFilter("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const step1Done = !!product;
  const step2Done = dog.gender !== null;
  const step3Done = fit.chestFit !== null && fit.backFit !== null && (dog.gender === "male" || fit.belly !== null);

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-32 pt-6">
      <Header />

      <Stepper current={step} />

      <Accordion
        title="STEP 1 · 어떤 옷을 보시나요?"
        open={step === 1}
        done={step1Done}
        onOpen={() => setStep(1)}
        summary={product?.name}
      >
        <Step1
          product={product}
          onPick={(p) => { setProduct(p); setStep(2); }}
        />
      </Accordion>

      <Accordion
        title="STEP 2 · 우리 아이 정보"
        open={step === 2}
        done={step2Done}
        disabled={!step1Done}
        onOpen={() => step1Done && setStep(2)}
        summary={step2Done ? `${dog.gender === "female" ? "여아" : "남아"} · ${dog.weight}kg · 가슴${dog.chest}` : undefined}
      >
        <Step2
          dog={dog}
          setDog={setDog}
          onNext={() => setStep(3)}
        />
      </Accordion>

      <Accordion
        title="STEP 3 · 보호자 핏 성향"
        open={step === 3}
        done={step3Done}
        disabled={!step2Done}
        onOpen={() => step2Done && setStep(3)}
      >
        <Step3
          fit={fit}
          setFit={setFit}
          gender={dog.gender}
          onSubmit={() => { setStep(4); setTimeout(() => window.scrollTo({ top: 9999, behavior: "smooth" }), 60); }}
        />
      </Accordion>

      {step === 4 && product && (
        <Result
          product={product}
          dog={dog}
          fit={fit}
          filter={filter}
          setFilter={setFilter}
          onReset={reset}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="mb-5 text-center">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-accent-foreground">
        🐕 큰강아지 · 사이즈 추천 연구소
      </div>
      <h1 className="mt-3 text-[26px] font-bold leading-tight text-foreground">
        우리 아이랑 비슷한 친구는<br />뭘 입었을까요?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        AI 추천 대신, 진짜 후기로 찾아드려요
      </p>
    </header>
  );
}

function Stepper({ current }: { current: Step }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className={`h-1.5 rounded-full transition-all ${n <= current ? "w-8 bg-primary" : "w-4 bg-border"}`} />
      ))}
    </div>
  );
}

function Accordion({
  title, open, done, disabled, onOpen, summary, children,
}: {
  title: string; open: boolean; done?: boolean; disabled?: boolean;
  onOpen: () => void; summary?: string; children: React.ReactNode;
}) {
  return (
    <section className={`mb-3 overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-all ${disabled ? "opacity-50" : ""}`}>
      <button
        onClick={onOpen}
        disabled={disabled}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <div className="font-display text-[15px] font-bold text-foreground">{title}</div>
          {summary && !open && <div className="mt-0.5 text-xs text-muted-foreground">{summary}</div>}
        </div>
        <div className="flex items-center gap-2">
          {done && <span className="text-primary">✓</span>}
          <span className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
        </div>
      </button>
      {open && <div className="border-t px-5 py-5">{children}</div>}
    </section>
  );
}

function Step1({ product, onPick }: { product: Product | null; onPick: (p: Product) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRODUCTS.map((p) => {
        const active = product?.name === p.name;
        return (
          <button
            key={p.name}
            onClick={() => onPick(p)}
            className={`rounded-xl border-2 p-3 text-left transition-all ${active ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary/40"}`}
          >
            <div className="font-display text-sm font-bold text-foreground">{p.name}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              <Tag>{p.sizing === "eu" ? "유럽 사이즈" : "국내 사이즈"}</Tag>
              <Tag tone={p.stretch === "none" ? "warn" : "soft"}>{p.stretchLabel}</Tag>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Tag({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "warn" | "primary" }) {
  const cls =
    tone === "warn" ? "bg-warning/20 text-warning-foreground"
    : tone === "primary" ? "bg-primary text-primary-foreground"
    : "bg-secondary text-secondary-foreground";
  return <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{children}</span>;
}

function Step2({ dog, setDog, onNext }: { dog: DogInfo; setDog: (d: DogInfo) => void; onNext: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label>견종 (선택)</Label>
        <input
          value={dog.breed}
          onChange={(e) => setDog({ ...dog, breed: e.target.value })}
          placeholder="예: 진도믹스"
          className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <Label>성별</Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {(["female", "male"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setDog({ ...dog, gender: g })}
              className={`rounded-lg border-2 py-3 text-sm font-medium transition-all ${dog.gender === g ? "border-primary bg-primary-soft text-accent-foreground" : "border-border bg-card"}`}
            >
              {g === "female" ? "🎀 여아" : "💙 남아"}
            </button>
          ))}
        </div>
      </div>
      <Slider label="몸무게" value={dog.weight} min={10} max={60} unit="kg" onChange={(v) => setDog({ ...dog, weight: v })} />
      <Slider label="가슴둘레" value={dog.chest} min={40} max={100} unit="cm" onChange={(v) => setDog({ ...dog, chest: v })} />
      <Slider label="등길이" value={dog.back} min={28} max={80} unit="cm" onChange={(v) => setDog({ ...dog, back: v })} />
      <button
        onClick={onNext}
        disabled={!dog.gender}
        className="w-full rounded-xl bg-primary py-3.5 font-display font-bold text-primary-foreground disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-muted-foreground">{children}</div>;
}

function Slider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <div className="font-display text-lg font-bold text-primary">
          {value}<span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function Step3({ fit, setFit, gender, onSubmit }: {
  fit: FitPref; setFit: (f: FitPref) => void; gender: Gender | null; onSubmit: () => void;
}) {
  const ready = fit.chestFit && fit.backFit && (gender === "male" || fit.belly);
  return (
    <div className="space-y-5">
      <Choice
        label="가슴 핏"
        value={fit.chestFit}
        onChange={(v) => setFit({ ...fit, chestFit: v as "snug" | "loose" })}
        options={[
          { v: "snug", label: "딱 맞게", sub: "옷이 펄럭이지 않는 게 좋아요" },
          { v: "loose", label: "넉넉하게", sub: "여유 있는 게 편해 보여요" },
        ]}
      />
      <Choice
        label="등길이 핏"
        value={fit.backFit}
        onChange={(v) => setFit({ ...fit, backFit: v as "snug" | "short" })}
        options={[
          { v: "snug", label: "딱 맞게", sub: "엉덩이까지 덮어주세요" },
          { v: "short", label: "짧게", sub: "배가 조금 보여도 괜찮아요" },
        ]}
      />
      {gender === "female" && (
        <Choice
          label="배 부분"
          value={fit.belly}
          onChange={(v) => setFit({ ...fit, belly: v as "cover" | "any" })}
          options={[
            { v: "cover", label: "가리고 싶어요", sub: "" },
            { v: "any", label: "상관없어요", sub: "" },
          ]}
        />
      )}
      <button
        onClick={onSubmit}
        disabled={!ready}
        className="w-full rounded-xl bg-primary py-3.5 font-display font-bold text-primary-foreground disabled:opacity-40"
      >
        결과 보기 →
      </button>
    </div>
  );
}

function Choice({ label, value, onChange, options }: {
  label: string; value: string | null; onChange: (v: string) => void;
  options: { v: string; label: string; sub: string }[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 space-y-2">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`block w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${value === o.v ? "border-primary bg-primary-soft" : "border-border bg-card"}`}
          >
            <div className="text-sm font-bold text-foreground">{o.label}</div>
            {o.sub && <div className="mt-0.5 text-xs text-muted-foreground">{o.sub}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Recommendation logic ----
const SIZE_ORDER_KR = ["M", "L", "XL", "2XL", "3XL"];
const SIZE_ORDER_EU = ["M", "L", "XL", "2XL"];

function shiftSize(size: string, delta: number, sizing: "kr" | "eu") {
  const arr = sizing === "eu" ? SIZE_ORDER_EU : SIZE_ORDER_KR;
  const i = arr.indexOf(size);
  if (i < 0) return size;
  return arr[Math.min(arr.length - 1, Math.max(0, i + delta))];
}

function similarity(r: Review, dog: DogInfo) {
  const dChest = Math.abs(r.chest - dog.chest);
  const dWeight = Math.abs(r.weight - dog.weight);
  const dBack = Math.abs(r.back - dog.back);
  // lower is better; normalize roughly
  const score = (dChest / 60) * 0.4 + (dWeight / 50) * 0.4 + (dBack / 52) * 0.2;
  return 1 - Math.min(1, score);
}

function Result({ product, dog, fit, filter, setFilter, onReset }: {
  product: Product; dog: DogInfo; fit: FitPref;
  filter: "all" | "perfect" | "loose";
  setFilter: (f: "all" | "perfect" | "loose") => void;
  onReset: () => void;
}) {
  const ranked = useMemo(() => {
    const pool = REVIEWS.filter((r) => r.product === product.name);
    return pool
      .map((r) => ({ r, s: similarity(r, dog) }))
      .sort((a, b) => b.s - a.s);
  }, [product, dog]);

  const baseSize = ranked[0]?.r.size ?? "L";
  let recommended = baseSize;
  if (product.stretch === "none") {
    recommended = shiftSize(baseSize, fit.chestFit === "loose" ? 2 : 1, product.sizing);
  } else if (product.stretch === "high") {
    recommended = fit.chestFit === "loose" ? shiftSize(baseSize, 1, product.sizing) : baseSize;
  } else {
    recommended = fit.chestFit === "loose" ? shiftSize(baseSize, 1, product.sizing) : baseSize;
  }
  const arr = product.sizing === "eu" ? SIZE_ORDER_EU : SIZE_ORDER_KR;
  const idx = arr.indexOf(recommended);
  const adjacent = [arr[idx - 1], arr[idx + 1]].filter(Boolean) as string[];

  let displayed = ranked;
  if (filter === "perfect") displayed = ranked.filter((x) => x.r.fit === "perfect");
  if (filter === "loose") displayed = ranked.filter((x) => x.r.fit !== "perfect");
  const fallback = displayed.length === 0;
  if (fallback) displayed = ranked;
  displayed = displayed.slice(0, 10);

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
        <div className="bg-gradient-to-br from-primary to-[oklch(0.55_0.13_165)] px-5 py-6 text-primary-foreground">
          <div className="text-xs opacity-90">{product.name} · 추천 사이즈</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="font-display text-5xl font-bold">{recommended}</div>
            <div className="text-sm opacity-80">사이즈</div>
          </div>
          {adjacent.length > 0 && (
            <div className="mt-3 flex gap-2 text-xs">
              {adjacent.map((s) => (
                <span key={s} className="rounded-md bg-white/20 px-2 py-1">또는 {s}</span>
              ))}
            </div>
          )}
        </div>
        {product.stretch === "none" && (
          <div className="flex items-start gap-2 border-t bg-warning/15 px-5 py-3 text-xs text-warning-foreground">
            <span>⚠️</span>
            <span>이 제품은 <b>신축성이 없어요</b>. 평소보다 한 사이즈 여유 있게 선택하세요.</span>
          </div>
        )}
        {product.sizing === "eu" && (
          <div className="border-t bg-secondary px-5 py-3 text-xs text-muted-foreground">
            💡 유럽 사이즈는 국내보다 한 사이즈 큰 편이에요.
          </div>
        )}
      </section>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-foreground">
          비슷한 친구들 후기
        </h2>
        <button onClick={onReset} className="text-xs text-muted-foreground underline">다시 검색</button>
      </div>

      <div className="mb-3 flex gap-1.5">
        {([
          { v: "all", l: "전체" }, { v: "perfect", l: "딱맞음만" }, { v: "loose", l: "넉넉함만" },
        ] as const).map((b) => (
          <button
            key={b.v}
            onClick={() => setFilter(b.v)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${filter === b.v ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {b.l}
          </button>
        ))}
      </div>

      {fallback && (
        <div className="mb-3 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
          아직 이 조건의 후기가 없어요. 비슷한 체형 후기를 보여드릴게요.
        </div>
      )}

      <div className="space-y-3">
        {displayed.map(({ r }, i) => (
          <ReviewCard key={r.id} r={r} top={i < 2} />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[480px] border-t bg-card px-4 py-3 shadow-[var(--shadow-float)]">
        <button className="w-full rounded-xl bg-primary py-3.5 font-display font-bold text-primary-foreground active:scale-[0.98]">
          이 사이즈로 구매하러 가기 →
        </button>
      </div>
    </>
  );
}

function ReviewCard({ r, top }: { r: Review; top: boolean }) {
  const fitTone = r.fit === "perfect" ? "primary" : r.fit === "slightly_loose" ? "soft" : "warn";
  return (
    <article className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)]">
      {top && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          ⭐ 우리 아이랑 가장 비슷해요
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-bold text-foreground">
            {r.name} <span className="text-xs font-normal text-muted-foreground">· {r.breed}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {r.gender === "female" ? "여아" : "남아"} · {r.weight}kg · 가슴 {r.chest} · 등 {r.back}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold text-primary">{r.size}</div>
          <Tag tone={fitTone}>{r.fitLabel}</Tag>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{r.review}</p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{r.date}</span>
        <span>👍 도움돼요 {r.helpful}</span>
      </div>
    </article>
  );
}
