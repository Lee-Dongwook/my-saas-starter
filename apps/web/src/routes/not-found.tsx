import { Link } from "react-router";

import { buttonVariants } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      {/* `buttonVariants` styles the link directly — a <button> must not wrap
          an <a>, and this keeps real link semantics (middle-click, copy URL). */}
      <Link to="/" className={buttonVariants({ className: "mt-2" })}>
        Back to dashboard
      </Link>
    </div>
  );
}
