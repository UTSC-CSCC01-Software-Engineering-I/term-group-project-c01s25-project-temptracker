import { Button } from "@/components/shadcn/button";
import { Users } from "lucide-react";

interface EmptyStateProps {
  hasSearchTerm: boolean;
  onClearSearch: () => void;
}

export default function EmptyState({
  hasSearchTerm,
  onClearSearch,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        {hasSearchTerm ? "No users found" : "No public members yet"}
      </h3>
      <p className="text-muted-foreground">
        {hasSearchTerm
          ? "Try adjusting your search terms or browse all members."
          : "Be the first to make your profile public in settings!"}
      </p>
      {hasSearchTerm && (
        <Button onClick={onClearSearch} className="mt-4">
          View All Members
        </Button>
      )}
    </div>
  );
}
