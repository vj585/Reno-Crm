import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { API_URL } from '../config/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const limit = 10;

  const fetchCustomers = async (currentPage, currentSearch, currentSortBy, currentSortOrder) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_URL}/customers`);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('limit', limit);
      if (currentSearch) url.searchParams.append('search', currentSearch);
      url.searchParams.append('sortBy', currentSortBy);
      url.searchParams.append('sortOrder', currentSortOrder);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      
      setCustomers(data.customers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchCustomers(page, search, sortBy, sortOrder);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1); // Reset to page 1 on sort change
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on search change
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <p className="text-muted-foreground mt-2">Manage your customer database and purchase history.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>All Customers ({total})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search name, email, city..."
                className="pl-8"
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-10 bg-red-50 dark:bg-red-950/20 rounded-md text-red-600 dark:text-red-400">
              <p className="font-medium">Error loading customers</p>
              <p className="text-sm mt-1">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => fetchCustomers(page, search, sortBy, sortOrder)}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">Name <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('city')}>
                      <div className="flex items-center">City <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('totalSpent')}>
                      <div className="flex items-center">Total Spend <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('orderCount')}>
                      <div className="flex items-center">Orders <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('lastOrderDate')}>
                      <div className="flex items-center">Last Purchase <ArrowUpDown className="ml-2 h-4 w-4" /></div>
                    </TableHead>
                    <TableHead>Channel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(limit)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.city || '-'}</TableCell>
                        <TableCell>₹{customer.totalSpent?.toLocaleString() || 0}</TableCell>
                        <TableCell>{customer.orderCount}</TableCell>
                        <TableCell>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{customer.preferredChannel}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!error && totalPages > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <div className="text-sm font-medium">Page {page} of {totalPages}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
