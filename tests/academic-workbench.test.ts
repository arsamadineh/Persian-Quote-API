import { describe, it, expect } from "bun:test"
import { scanHemistich, scanBeyt } from "@persian-quote/arud"
import { cite, makeQuiz, toMoodleXml, toGift, toCsv } from "@persian-quote/tools"

describe("Academic & University Workflows", () => {
  it("scans classical Persian meters accurately with prosodic liaison and long vowels", () => {
    const beytFerdowsi = scanBeyt([
      "به نام خداوند جان و خرد",
      "که از این برتر اندیشه برنگذرد",
    ])
    expect(beytFerdowsi[0].meter).toBe("بحر متقارب")
    expect(beytFerdowsi[1].meter).toBe("بحر متقارب")
    expect(beytFerdowsi[0].syllables.length).toBe(11)
    expect(beytFerdowsi[1].syllables.length).toBe(11)
    expect(beytFerdowsi[0].confidence).toBeGreaterThanOrEqual(0.95)
    expect(beytFerdowsi[1].confidence).toBeGreaterThanOrEqual(0.95)

    const hafez296 = scanHemistich("در وفای عشق تو مشهور خوبانم چو شمع")
    expect(hafez296.meter).toBe("بحر رمل")
    expect(hafez296.confidence).toBeGreaterThanOrEqual(0.95)
    expect(hafez296.syllables.length).toBe(15)

    const rumi = scanHemistich("بشنو از نی چون حکایت می‌کند")
    expect(rumi.meter).toBe("بحر رمل")
    expect(rumi.confidence).toBeGreaterThanOrEqual(0.95)
    expect(rumi.syllables.length).toBe(11)

    const hafezHazaj = scanHemistich("سحر بلبل حکایت با صبا کرد")
    expect(hafezHazaj.meter).toBe("بحر هزج")
    expect(hafezHazaj.confidence).toBeGreaterThanOrEqual(0.95)
    expect(hafezHazaj.syllables.length).toBe(11)
  })

  it("generates academic citations across APA, Chicago, and BibTeX", () => {
    const work = {
      id: "hafez.ghazaliat.296",
      poetId: "hafez",
      poetName: "حافظ شیرازی",
      title: "غزل ۲۹۶",
      collection: "دیوان حافظ",
      kind: "classical" as const,
    }

    const apa = cite(work, "apa-fa", { beyt: 1 })
    expect(apa).toBe("(حافظ شیرازی، غزل ۲۹۶، بیت ۱)")

    const chicago = cite(work, "chicago-fa", { beyt: 1 })
    expect(chicago).toBe("حافظ شیرازی. غزل ۲۹۶، بیت ۱.")

    const bibtex = cite(work, "bibtex")
    expect(bibtex).toContain("@misc{hafez_ghazaliat_296")
    expect(bibtex).toContain("author = {حافظ شیرازی}")
  })

  it("generates LMS-ready quizzes and exports to Moodle XML", () => {
    const work = {
      id: "hafez.ghazaliat.296",
      poetId: "hafez",
      poetName: "حافظ شیرازی",
      title: "غزل ۲۹۶",
      stanzas: [
        [
          "در وفای عشق تو مشهور خوبانم چو شمع",
          "شب‌نشین کوی سربازان و رندانم چو شمع",
        ],
      ],
      beyts: [
        [
          "در وفای عشق تو مشهور خوبانم چو شمع",
          "شب‌نشین کوی سربازان و رندانم چو شمع",
        ],
      ],
      kind: "classical" as const,
    }

    const q = makeQuiz(work as any, "cloze-radif", 42)
    expect(q.kind).toBe("cloze-radif")
    expect(q.prompt).toContain("___")
    expect(q.answer).toBe("شمع")

    const moodle = toMoodleXml([q])
    expect(moodle).toContain("<quiz>")
    expect(moodle).toContain('<question type="shortanswer">')
    expect(moodle).toContain("شمع")

    const gift = toGift([q])
    expect(gift).toContain("{=شمع}")

    const csv = toCsv([q])
    expect(csv).toContain("cloze-radif")
  })
})
