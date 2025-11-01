import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Car, Users, TrendingUp } from "lucide-react";

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    avgOccupancy: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch revenue
      const { data: bookings } = await supabase
        .from("bookings")
        .select("total_cost")
        .eq("status", "completed");

      const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.total_cost), 0) || 0;

      // Fetch bookings count
      const { count: totalBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      // Fetch users count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch occupancy
      const { data: lots } = await supabase
        .from("parking_lots")
        .select("total_spots, available_spots");

      const totalSpots = lots?.reduce((sum, l) => sum + l.total_spots, 0) || 1;
      const availableSpots = lots?.reduce((sum, l) => sum + l.available_spots, 0) || 0;
      const avgOccupancy = ((totalSpots - availableSpots) / totalSpots) * 100;

      setStats({
        totalRevenue,
        totalBookings: totalBookings || 0,
        totalUsers: totalUsers || 0,
        avgOccupancy: avgOccupancy || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    {
      title: "Tổng doanh thu",
      value: `${stats.totalRevenue.toLocaleString()}đ`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Lượt đặt chỗ",
      value: stats.totalBookings.toString(),
      icon: Car,
      color: "text-blue-600",
    },
    {
      title: "Người dùng",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Tỷ lệ lấp đầy TB",
      value: `${stats.avgOccupancy.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;