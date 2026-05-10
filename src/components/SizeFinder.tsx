import { useMemo, useState } from "react";
import {
  NONGGU_REVIEWS,
  NONGGU_SIZE_TABLE,
  SIZE_ORDER,
  fitLabel,
  fitTone,
  maskAuthor,
  type NonGuReview,
  type Fit,
} from "@/data/nonggu";

type Step = 1 | 2 | 3;
type Gender = "female" | "male";

interface DogInfo {
  breed: string;
  gender: Gender | null;
  weight: number;
  chest: number | null;     // optional
  back: number | null;      // optional
  knowsChest: boolean;
}
interface FitPref {
  chestFit: "snug" | "loose" | null;
  backFit: "snug" | "short" | null;
  belly: "cover" | "any" | null;
}

const initialDog: DogInfo = { breed: "", gender: null, weight: 20, chest: null, back: null, knowsChest: false };
const initialFit: FitPref = { chestFit: null, backFit: null, belly: null };

export default function SizeFinder() {
  const [step, setStep] = useState<Step>(1);
  const [dog, setDog] = useState<DogInfo>(initialDog);
  const [fit, setFit] = useState<FitPref>(initialFit);
  const [filter, setFilter] = useState<"all" | "perfect" | "loose" | "tight">("all");

  const reset = () => {
    setStep(1); setDog(initialDog); setFit(initialFit); setFilter("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const step1Done = dog.gender !== null;
  const step2Done = fit.chestFit !== null && fit.backFit !== null && (dog.gender === "male" || fit.belly !== null);

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-32 pt-6">
      <Header />
      <Stepper current={step} />

      <Accordion
        title="STEP 1 · 우리 아이 정보"
        open={step === 1}
        done={step1Done}
        onOpen={() => setStep(1)}
        summary={step1Done ? `${dog.gender === "female" ? "여아" : "남아"} · ${dog.weight}kg${dog.knowsChest && dog.chest ? ` · 가슴${dog.chest}` : ""}` : undefined}
      >
        <Step1 dog={dog} setDog={setDog} onNext={() => setStep(2)} />
      </Accordion>

      <Accordion
        title="STEP 2 · 보호자 핏 성향"
        open={step === 2}
        done={step2Done}
        disabled={!step1Done}
        onOpen={() => step1Done && setStep(2)}
      >
        <Step2
          fit={fit}
          setFit={setFit}
          gender={dog.gender}
          onSubmit={() => { setStep(3); setTimeout(() => window.scrollTo({ top: 9999, behavior: "smooth" }), 60); }}
        />
      </Accordion>

      {step === 3 && (
        <Result dog={dog} fit={fit} filter={filter} setFilter={setFilter} onReset={reset} />
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
        농구나시 <span className="text-primary">진짜 후기</span>로<br />사이즈 찾기
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        실제 구매한 {NONGGU_REVIEWS.length}명의 후기에서 비슷한 아이를 찾아드려요
      </p>
    </header>
  );
}

function Stepper({ current }: { current: Step }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className={`h-1.5 rounded-full transition-all ${n <= current ? "w-10 bg-primary" : "w-4 bg-border"}`} />
      ))}
    </div>
  );
}

function Accordion({ title, open, done, disabled, onOpen, summary, children }: {
  title: string; open: boolean; done?: boolean; disabled?: boolean;
  onOpen: () => void; summary?: string; children: React.ReactNode;
}) {
  return (
    <section className={`mb-3 overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-all ${disabled ? "opacity-50" : ""}`}>
      <button onClick={onOpen} disabled={disabled} className="flex w-full items-center justify-between px-5 py-4 text-left">
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

function Step1({ dog, setDog, onNext }: { dog: DogInfo; setDog: (d: DogInfo) => void; onNext: () => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label>견종 (선택)</Label>
        <input
          value={dog.breed}
          onChange={(e) => setDog({ ...dog, breed: e.target.value })}
          placeholder="예: 진도믹스, 리트리버"
          className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <Label>성별</Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {(["female", "male"] as const).map((g) => (
            <button key={g} onClick={() => setDog({ ...dog, gender: g })}
              className={`rounded-lg border-2 py-3 text-sm font-medium transition-all ${dog.gender === g ? "border-primary bg-primary-soft text-accent-foreground" : "border-border bg-card"}`}>
              {g === "female" ? "🎀 여아" : "💙 남아"}
            </button>
          ))}
        </div>
      </div>
      <Slider label="몸무게 (필수)" value={dog.weight} min={2} max={60} unit="kg" onChange={(v) => setDog({ ...dog, weight: v })} />

      <div className="rounded-xl border bg-secondary/40 p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={dog.knowsChest}
            onChange={(e) => setDog({ ...dog, knowsChest: e.target.checked })}
            className="h-4 w-4 accent-primary"
          />
          <span className="font-medium text-foreground">가슴둘레/등길이도 알아요</span>
        </label>
        {dog.knowsChest && (
          <div className="mt-3 space-y-4">
            <Slider label="가슴둘레" value={dog.chest ?? 60} min={30} max={100} unit="cm" onChange={(v) => setDog({ ...dog, chest: v })} />
            <Slider label="등길이" value={dog.back ?? 50} min={20} max={80} unit="cm" onChange={(v) => setDog({ ...dog, back: v })} />
          </div>
        )}
        {!dog.knowsChest && (
          <div className="mt-2 text-[11px] text-muted-foreground">몰라도 OK! 몸무게만으로도 추천 가능해요.</div>
        )}
      </div>

      <button onClick={onNext} disabled={!dog.gender}
        className="w-full rounded-xl bg-primary py-3.5 font-display font-bold text-primary-foreground disabled:opacity-40">
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
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary" />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function Step2({ fit, setFit, gender, onSubmit }: {
  fit: FitPref; setFit: (f: FitPref) => void; gender: Gender | null; onSubmit: () => void;
}) {
  const ready = fit.chestFit && fit.backFit && (gender === "male" || fit.belly);
  return (
    <div className="space-y-5">
      <Choice label="가슴 핏" value={fit.chestFit} onChange={(v) => setFit({ ...fit, chestFit: v as "snug" | "loose" })}
        options={[
          { v: "snug", label: "딱 맞게", sub: "옷이 펄럭이지 않는 게 좋아요" },
          { v: "loose", label: "넉넉하게", sub: "여유 있는 게 편해 보여요" },
        ]} />
      <Choice label="등길이 핏" value={fit.backFit} onChange={(v) => setFit({ ...fit, backFit: v as "snug" | "short" })}
        options={[
          { v: "snug", label: "딱 맞게", sub: "엉덩이까지 덮어주세요" },
          { v: "short", label: "짧게", sub: "배가 조금 보여도 괜찮아요" },
        ]} />
      {gender === "female" && (
        <Choice label="배 부분" value={fit.belly} onChange={(v) => setFit({ ...fit, belly: v as "cover" | "any" })}
          options={[
            { v: "cover", label: "가리고 싶어요", sub: "" },
            { v: "any", label: "상관없어요", sub: "" },
          ]} />
      )}
      <button onClick={onSubmit} disabled={!ready}
        className="w-full rounded-xl bg-primary py-3.5 font-display font-bold text-primary-foreground disabled:opacity-40">
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
          <button key={o.v} onClick={() => onChange(o.v)}
            className={`block w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${value === o.v ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
            <div className="text-sm font-bold text-foreground">{o.label}</div>
            {o.sub && <div className="mt-0.5 text-xs text-muted-foreground">{o.sub}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Recommendation ----
function similarity(r: NonGuReview, dog: DogInfo): number {
  let score = 0;
  let weights = 0;
  if (r.weight != null) {
    const d = Math.abs(r.weight - dog.weight) / 30;
    score += (1 - Math.min(1, d)) * 0.6;
    weights += 0.6;
  }
  if (r.chest != null && dog.knowsChest && dog.chest != null) {
    const d = Math.abs(r.chest - dog.chest) / 40;
    score += (1 - Math.min(1, d)) * 0.3;
    weights += 0.3;
  }
  if (r.back != null && dog.knowsChest && dog.back != null) {
    const d = Math.abs(r.back - dog.back) / 30;
    score += (1 - Math.min(1, d)) * 0.1;
    weights += 0.1;
  }
  if (r.breed && dog.breed && r.breed.includes(dog.breed.trim())) {
    score += 0.05;
  }
  return weights > 0 ? score / weights : 0;
}

function recommendSize(dog: DogInfo, fit: FitPref): { primary: string; alt: string[]; reason: string } {
  // 1. Vote from top-N similar reviews that have explicit size
  const ranked = NONGGU_REVIEWS
    .map((r) => ({ r, s: similarity(r, dog) }))
    .filter((x) => x.r.size)
    .sort((a, b) => b.s - a.s)
    .slice(0, 15);

  const votes = new Map<string, number>();
  ranked.forEach(({ r, s }) => {
    if (!r.size) return;
    let w = s;
    // Adjust vote based on fit reported
    if (r.fit === "loose" && fit.chestFit === "snug") w *= 0.7;
    if (r.fit === "tight" && fit.chestFit === "loose") w *= 0.7;
    votes.set(r.size, (votes.get(r.size) || 0) + w);
  });

  let pick = "";
  let reason = "";
  if (votes.size > 0) {
    pick = [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0];
    reason = `비슷한 체형 후기 ${ranked.length}건 분석`;
  } else {
    // fallback by weight table
    const row = NONGGU_SIZE_TABLE.find((s) => dog.weight >= s.weightMin && dog.weight < s.weightMax);
    pick = row?.size ?? "3XL";
    reason = "사이즈 표 기준";
  }

  // Apply fit preference (농구나시 = 신축성 좋음 → 넉넉 선호 시 한단계 위)
  const idx = SIZE_ORDER.indexOf(pick);
  if (fit.chestFit === "loose" && idx >= 0 && idx < SIZE_ORDER.length - 1) {
    pick = SIZE_ORDER[idx + 1];
  }
  const fIdx = SIZE_ORDER.indexOf(pick);
  const alt = [SIZE_ORDER[fIdx - 1], SIZE_ORDER[fIdx + 1]].filter(Boolean);
  return { primary: pick, alt, reason };
}

function Result({ dog, fit, filter, setFilter, onReset }: {
  dog: DogInfo; fit: FitPref;
  filter: "all" | "perfect" | "loose" | "tight";
  setFilter: (f: "all" | "perfect" | "loose" | "tight") => void;
  onReset: () => void;
}) {
  const { rec, ranked } = useMemo(() => {
    const rec = recommendSize(dog, fit);
    const ranked = NONGGU_REVIEWS
      .map((r) => ({ r, s: similarity(r, dog) }))
      .sort((a, b) => b.s - a.s);
    return { rec, ranked };
  }, [dog, fit]);

  const filterFn = (r: NonGuReview): boolean => {
    if (filter === "all") return true;
    if (filter === "perfect") return r.fit === "perfect";
    if (filter === "loose") return r.fit === "loose" || r.fit === "too_large";
    if (filter === "tight") return r.fit === "tight" || r.fit === "too_small";
    return true;
  };
  let displayed = ranked.filter((x) => filterFn(x.r));
  const fallback = displayed.length === 0;
  if (fallback) displayed = ranked;
  displayed = displayed.slice(0, 10);

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
        <div className="bg-gradient-to-br from-primary to-[oklch(0.55_0.13_165)] px-5 py-6 text-primary-foreground">
          <div className="text-xs opacity-90">농구나시 · 추천 사이즈</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="font-display text-5xl font-bold">{rec.primary}</div>
            <div className="text-sm opacity-80">사이즈</div>
          </div>
          <div className="mt-2 text-[11px] opacity-80">{rec.reason}</div>
          {rec.alt.length > 0 && (
            <div className="mt-3 flex gap-2 text-xs">
              {rec.alt.map((s) => (
                <span key={s} className="rounded-md bg-white/20 px-2 py-1">또는 {s}</span>
              ))}
            </div>
          )}
        </div>
        <div className="border-t bg-secondary px-5 py-3 text-xs text-muted-foreground">
          💡 농구나시는 <b>신축성이 좋아</b> 딱 맞게 입혀도 펄럭이지 않아요.
        </div>
      </section>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-foreground">비슷한 친구들 후기</h2>
        <button onClick={onReset} className="text-xs text-muted-foreground underline">다시 검색</button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {([
          { v: "all", l: "전체" },
          { v: "perfect", l: "딱맞음" },
          { v: "loose", l: "넉넉" },
          { v: "tight", l: "작음" },
        ] as const).map((b) => (
          <button key={b.v} onClick={() => setFilter(b.v)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${filter === b.v ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {b.l}
          </button>
        ))}
      </div>

      {fallback && (
        <div className="mb-3 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
          이 조건의 후기가 없어 비슷한 체형 후기를 보여드려요.
        </div>
      )}

      <div className="space-y-3">
        {displayed.map(({ r }, i) => (
          <ReviewCard key={r.id} r={r} top={i < 2} />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[480px] border-t bg-card px-4 py-3 shadow-[var(--shadow-float)]">
        <button className="w-full rounded-xl bg-primary py-3.5 font-display font-bold text-primary-foreground active:scale-[0.98]">
          {rec.primary} 사이즈로 구매하러 가기 →
        </button>
      </div>
    </>
  );
}

function ReviewCard({ r, top }: { r: NonGuReview; top: boolean }) {
  return (
    <article className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)]">
      {top && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          ⭐ 우리 아이랑 가장 비슷해요
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-bold text-foreground">
            {maskAuthor(r.author)}
            {r.breed && <span className="ml-1 text-xs font-normal text-muted-foreground">· {r.breed}</span>}
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
            {r.gender && <span>{r.gender === "female" ? "여아" : "남아"}</span>}
            {r.weight != null && <span>{r.weight}kg</span>}
            {r.chest != null && <span>가슴 {r.chest}</span>}
            {r.back != null && <span>등 {r.back}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {r.size ? (
            <div className="font-display text-xl font-bold text-primary">{r.size}</div>
          ) : (
            <div className="text-[10px] text-muted-foreground">사이즈 미기재</div>
          )}
          <Tag tone={fitTone(r.fit)}>{fitLabel(r.fit)}</Tag>
        </div>
      </div>
      <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {r.review}
      </p>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{r.date}</span>
        {r.rating != null && <span>{"★".repeat(r.rating)}</span>}
      </div>
    </article>
  );
}

function Tag({ children, tone = "soft" }: { children: React.ReactNode; tone?: "soft" | "warn" | "primary" }) {
  const cls =
    tone === "warn" ? "bg-warning/20 text-warning-foreground"
    : tone === "primary" ? "bg-primary text-primary-foreground"
    : "bg-secondary text-secondary-foreground";
  return <span className={`mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>{children}</span>;
}
