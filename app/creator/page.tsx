import { CreatorMonetization } from "@/components/creator-monetization"

export default function CreatorPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center p-4">
      <main className="w-full max-w-4xl py-12">
        <CreatorMonetization />
      </main>
    </div>
  )
}
