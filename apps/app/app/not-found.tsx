import { Link } from "@repo/design-system/components/link";
import { Button } from "@repo/design-system/components/ui/button";
import { SearchIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

const NotFound = () => (
  <main className="flex min-h-screen w-screen items-center justify-center bg-backdrop">
    <EmptyState
      description="Sorry, we couldn't find the page you were looking for! Please check the URL and try again."
      icon={SearchIcon}
      title="Not Found"
    >
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </EmptyState>
  </main>
);

export default NotFound;
