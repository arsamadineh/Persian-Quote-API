import DeveloperPortalDashboard from "@/components/developer-portal-dashboard";

export const metadata = {
  title: 'داشبورد توسعه‌دهندگان | Developer Dashboard',
  description: 'Manage your API keys, view analytics, and access SDK snippets.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">پورتال توسعه‌دهندگان</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <DeveloperPortalDashboard />
      </main>
    </div>
  );
}
