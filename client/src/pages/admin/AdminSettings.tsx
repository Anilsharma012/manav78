import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Save, Menu, Settings, GripVertical } from "lucide-react";

interface MenuItemData {
  id: number;
  title: string;
  titleHindi?: string;
  path: string;
  iconKey: string;
  order: number;
  isActive: boolean;
  group?: string;
}

interface SettingData {
  id: number;
  key: string;
  value: string;
  label: string;
  labelHindi?: string;
  description?: string;
  type: "boolean" | "string" | "number" | "json";
  category: string;
}

const availableIcons = [
  "LayoutDashboard", "Users", "GraduationCap", "CreditCard", "FileText",
  "Award", "Image", "Phone", "Info", "Settings", "IdCard", "Receipt", "ClipboardList"
];

export default function AdminSettings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [settings, setSettings] = useState<SettingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItemData | null>(null);
  const [menuForm, setMenuForm] = useState({
    title: "",
    titleHindi: "",
    path: "",
    iconKey: "LayoutDashboard",
    order: 0,
    isActive: true,
    group: "main"
  });

  const invalidateMenuCache = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/menu"] });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [menuRes, settingsRes] = await Promise.all([
        fetch("/api/admin/menu/all", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (menuRes.ok) setMenuItems(await menuRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    try {
      const url = editingMenu ? `/api/admin/menu/${editingMenu.id}` : "/api/admin/menu";
      const method = editingMenu ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(menuForm)
      });
      
      if (response.ok) {
        toast({ title: "Success", description: `Menu item ${editingMenu ? "updated" : "created"} successfully` });
        setMenuDialogOpen(false);
        setEditingMenu(null);
        setMenuForm({ title: "", titleHindi: "", path: "", iconKey: "LayoutDashboard", order: 0, isActive: true, group: "main" });
        fetchData();
        invalidateMenuCache();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save menu item", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      const response = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast({ title: "Success", description: "Menu item deleted" });
        fetchData();
        invalidateMenuCache();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete menu item", variant: "destructive" });
    }
  };

  const handleToggleMenuItem = async (item: MenuItemData) => {
    try {
      const response = await fetch(`/api/admin/menu/${item.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: !item.isActive })
      });
      
      if (response.ok) {
        toast({ title: "Success", description: `Menu item ${!item.isActive ? "enabled" : "disabled"}` });
        fetchData();
        invalidateMenuCache();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update menu item", variant: "destructive" });
    }
  };

  const handleSettingChange = async (setting: SettingData, newValue: string) => {
    try {
      const response = await fetch(`/api/admin/settings/${setting.key}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ value: newValue })
      });
      
      if (response.ok) {
        toast({ title: "Success", description: `${setting.label} updated` });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update setting", variant: "destructive" });
    }
  };

  const openEditDialog = (item: MenuItemData) => {
    setEditingMenu(item);
    setMenuForm({
      title: item.title,
      titleHindi: item.titleHindi || "",
      path: item.path,
      iconKey: item.iconKey,
      order: item.order,
      isActive: item.isActive,
      group: item.group || "main"
    });
    setMenuDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingMenu(null);
    setMenuForm({ title: "", titleHindi: "", path: "", iconKey: "LayoutDashboard", order: menuItems.length + 1, isActive: true, group: "main" });
    setMenuDialogOpen(true);
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SettingData[]>);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Settings / सेटिंग्स</h1>
          <p className="text-muted-foreground">Manage menu items and application settings</p>
        </div>

        <Tabs defaultValue="menu" className="space-y-4">
          <TabsList data-testid="tabs-settings">
            <TabsTrigger value="menu" data-testid="tab-menu">
              <Menu className="h-4 w-4 mr-2" />
              Menu Items
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="h-4 w-4 mr-2" />
              Feature Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>Sidebar Menu Items</CardTitle>
                  <CardDescription>Manage navigation menu for admin dashboard</CardDescription>
                </div>
                <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openNewDialog} data-testid="button-add-menu">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Menu Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingMenu ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
                      <DialogDescription>Configure the menu item details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title (English)</Label>
                          <Input
                            value={menuForm.title}
                            onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                            placeholder="Dashboard"
                            data-testid="input-menu-title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title (Hindi)</Label>
                          <Input
                            value={menuForm.titleHindi}
                            onChange={(e) => setMenuForm({ ...menuForm, titleHindi: e.target.value })}
                            placeholder="डैशबोर्ड"
                            data-testid="input-menu-title-hindi"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Path</Label>
                        <Input
                          value={menuForm.path}
                          onChange={(e) => setMenuForm({ ...menuForm, path: e.target.value })}
                          placeholder="/admin/dashboard"
                          data-testid="input-menu-path"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Select value={menuForm.iconKey} onValueChange={(v) => setMenuForm({ ...menuForm, iconKey: v })}>
                            <SelectTrigger data-testid="select-menu-icon">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableIcons.map((icon) => (
                                <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Order</Label>
                          <Input
                            type="number"
                            value={menuForm.order}
                            onChange={(e) => setMenuForm({ ...menuForm, order: parseInt(e.target.value) || 0 })}
                            data-testid="input-menu-order"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={menuForm.isActive}
                          onCheckedChange={(v) => setMenuForm({ ...menuForm, isActive: v })}
                          data-testid="switch-menu-active"
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setMenuDialogOpen(false)} data-testid="button-cancel">Cancel</Button>
                      <Button onClick={handleSaveMenu} disabled={saving} data-testid="button-save-menu">
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id} data-testid={`row-menu-${item.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            {item.order}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.titleHindi && <p className="text-xs text-muted-foreground">{item.titleHindi}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.path}</TableCell>
                        <TableCell>{item.iconKey}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => handleToggleMenuItem(item)}
                            data-testid={`switch-menu-status-${item.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" onClick={() => openEditDialog(item)} data-testid={`button-edit-menu-${item.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteMenu(item.id)} data-testid={`button-delete-menu-${item.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categorySettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between py-3 border-b last:border-0" data-testid={`setting-${setting.key}`}>
                      <div className="space-y-0.5">
                        <Label className="text-base">{setting.label}</Label>
                        {setting.labelHindi && <p className="text-xs text-muted-foreground">{setting.labelHindi}</p>}
                        {setting.description && <p className="text-sm text-muted-foreground">{setting.description}</p>}
                      </div>
                      <div>
                        {setting.type === "boolean" ? (
                          <Switch
                            checked={setting.value === "true"}
                            onCheckedChange={(checked) => handleSettingChange(setting, checked.toString())}
                            data-testid={`switch-setting-${setting.key}`}
                          />
                        ) : (
                          <Input
                            type={setting.type === "number" ? "number" : "text"}
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting, e.target.value)}
                            className="w-48"
                            data-testid={`input-setting-${setting.key}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
