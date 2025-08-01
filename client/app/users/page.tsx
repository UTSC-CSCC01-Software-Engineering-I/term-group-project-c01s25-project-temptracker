"use client";

import { Users } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import UserCard from "./UserCard";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import SearchSection from "./SearchSection";
import Pagination from "./Pagination";

export default function UsersPage() {
  const {
    filteredUsers,
    paginatedUsers,
    loading,
    searchTerm,
    setSearchTerm,
    clearSearch,
    pagination,
  } = useUsers();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Users className="w-8 h-8" />
            Community Members
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover and connect with fellow temperature trackers in our
            community. Browse public profiles and see their contributions to
            climate research.
          </p>
        </div>

        <SearchSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground text-center">
            {loading
              ? "Loading..."
              : `Found ${filteredUsers.length} public ${
                  filteredUsers.length === 1 ? "member" : "members"
                }`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            hasSearchTerm={!!searchTerm}
            onClearSearch={clearSearch}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
              totalItems={pagination.totalUsers}
              itemsPerPage={pagination.usersPerPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
