import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { API_URL } from '../config/api';
import { toast } from '../utils/toast';

export default function SegmentBuilder() {
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/segments`)
      .then(res => res.json())
      .then(data => setSegments(data))
      .catch(err => toast.error('Failed to load segments: ' + err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Segments</h2>
        <p className="text-muted-foreground mt-2">Manage your saved customer audiences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map(seg => (
                <TableRow key={seg._id}>
                  <TableCell className="font-medium">{seg.name}</TableCell>
                  <TableCell>{seg.customerCount}</TableCell>
                  <TableCell>{new Date(seg.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {segments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">No segments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
