"use client";

import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Search } from "lucide-react";

interface SearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchSection({
  searchTerm,
  setSearchTerm,
}: SearchSectionProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // search is handled by useEffect in parent component
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by username or biography..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
    </div>
  );
}
