import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "./AdminStats";
import ParkingManagement from "./ParkingManagement";
import BookingsManagement from "./BookingsManagement";
import UsersManagement from "./UsersManagement";
import SystemConfig from "./SystemConfig";

const AdminDashboard = () => {
  return (
    <Tabs defaultValue="stats" className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="stats">Tổng quan</TabsTrigger>
        <TabsTrigger value="parking">Bãi xe</TabsTrigger>
        <TabsTrigger value="bookings">Đặt chỗ</TabsTrigger>
        <TabsTrigger value="users">Người dùng</TabsTrigger>
        <TabsTrigger value="config">Cấu hình</TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        <AdminStats />
      </TabsContent>

      <TabsContent value="parking">
        <ParkingManagement />
      </TabsContent>

      <TabsContent value="bookings">
        <BookingsManagement />
      </TabsContent>

      <TabsContent value="users">
        <UsersManagement />
      </TabsContent>

      <TabsContent value="config">
        <SystemConfig />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboard;