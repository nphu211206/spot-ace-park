import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  user_roles: { role: string }[];
}

const UsersManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          created_at,
          user_roles!user_roles_user_id_fkey (role)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data as any || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Đang tải...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý người dùng</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tham gia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || "Chưa cập nhật"}
                </TableCell>
                <TableCell>{user.phone || "Chưa cập nhật"}</TableCell>
                <TableCell>
                  {user.user_roles.map((role, idx) => (
                    <Badge key={idx} variant="secondary" className="mr-1">
                      {role.role === "admin" ? "Quản trị" : "Người dùng"}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsersManagement;