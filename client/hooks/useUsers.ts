import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

export interface PublicUser {
  id: string;
  username: string;
  biography: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  stats?: {
    upload_count: number;
    curr_streak: number;
    max_streak: number;
  };
}

const USERS_PER_PAGE = 12;

export function useUsers() {
  const [allUsers, setAllUsers] = useState<PublicUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const response = await axios.get(`${API_BASE_URL}/users/public`);

      setAllUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = useCallback(
    (searchValue: string) => {
      if (!searchValue.trim()) {
        setFilteredUsers(allUsers);
        return;
      }

      const filtered = allUsers.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchValue.toLowerCase()) ||
          (user.biography &&
            user.biography.toLowerCase().includes(searchValue.toLowerCase()))
      );

      setFilteredUsers(filtered);
    },
    [allUsers]
  );

  const paginationData = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      paginatedUsers,
      totalUsers,
      totalPages,
      currentPage,
      usersPerPage: USERS_PER_PAGE,
    };
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers(searchTerm);
    // Reset to page 1 when search changes
    setCurrentPage(1);
  }, [searchTerm, allUsers, filterUsers]);

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    allUsers,
    filteredUsers,
    paginatedUsers: paginationData.paginatedUsers,
    loading,
    searchTerm,
    setSearchTerm,
    clearSearch,
    refetch: fetchUsers,
    pagination: {
      currentPage: paginationData.currentPage,
      totalPages: paginationData.totalPages,
      totalUsers: paginationData.totalUsers,
      usersPerPage: paginationData.usersPerPage,
      onPageChange: handlePageChange,
    },
  };
}
