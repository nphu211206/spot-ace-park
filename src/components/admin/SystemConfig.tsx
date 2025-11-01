import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Config {
  id: string;
  config_key: string;
  config_value: any;
  description: string;
}

const SystemConfig = () => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("system_config")
        .select("*")
        .order("config_key");

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      toast.error("Không thể tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (id: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from("system_config")
        .update({ config_value: newValue })
        .eq("id", id);

      if (error) throw error;
      toast.success("Đã cập nhật cấu hình");
      fetchConfigs();
    } catch (error: any) {
      toast.error("Không thể cập nhật");
    }
  };

  if (loading) {
    return <p>Đang tải...</p>;
  }

  return (
    <div className="space-y-6">
      {configs.map((config) => (
        <Card key={config.id}>
          <CardHeader>
            <CardTitle className="text-lg">{config.description}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Key: <code className="bg-muted px-2 py-1 rounded">{config.config_key}</code>
              </div>
              <div>
                <Label>Giá trị hiện tại</Label>
                <pre className="bg-muted p-3 rounded mt-2 overflow-auto">
                  {JSON.stringify(config.config_value, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemConfig;