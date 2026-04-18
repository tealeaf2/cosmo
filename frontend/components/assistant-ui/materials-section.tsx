import * as React from "react";
import { useState } from "react";
import { 
  FileText, 
  Link,
  Plus, 
  X,
  PlayCircle,
  Upload,
  SquareCheckBig,
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useMaterials, type Material } from "@/lib/materials-context";

type MaterialType = "pdf" | "website" | "video";

export function MaterialsSection() {
  const { materials, addMaterial, toggleMaterial, removeMaterial } = useMaterials();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MaterialType>("pdf");

  const getIcon = (type: MaterialType) => {
    switch (type) {
      case "pdf": return <FileText className="h-4 w-4" />;
      case "website": return <Link className="h-4 w-4" />;
      case "video": return <PlayCircle className="h-4 w-4" />;
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>Materials</span>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Material</DialogTitle>
              <DialogDescription>
                Upload PDFs, add website links, or include video URLs to provide context for your conversations.
              </DialogDescription>
            </DialogHeader>
            <MaterialsDialog 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onAdd={(material) => {
                addMaterial(material);
                setIsAddDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {materials.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No materials added yet
            </div>
          ) : (
            materials.map((material) => (
              <SidebarMenuItem key={material.id} title={material.url || material.name}>
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => toggleMaterial(material.id)}
                  >
                    {material.enabled ? (
                      <SquareCheckBig className="h-3 w-3" />
                    ) : (
                      <Square className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getIcon(material.type)}
                    <span className="text-sm truncate">
                      {material.name}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => removeMaterial(material.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

interface MaterialsDialogProps {
  activeTab: MaterialType;
  setActiveTab: (tab: MaterialType) => void;
  onAdd: (material: Omit<Material, "id" | "enabled">) => void;
}

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

function MaterialsDialog({ activeTab, setActiveTab, onAdd }: MaterialsDialogProps) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "pdf" && file) {
      const dataUrl = await getBase64(file);
      
      onAdd({
        type: "pdf",
        name: file.name,
        file: dataUrl,
      });
    } else if ((activeTab === "website" || activeTab === "video") && url) {
      onAdd({
        type: activeTab,
        name: url,
        url: new URL(url).toString(),
      });
    }
    
    setUrl("");
    setFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "pdf" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("pdf")}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          PDF
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "website" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("website")}
        >
          <Link className="h-4 w-4 inline mr-2" />
          Website
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "video" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("video")}
        >
          <PlayCircle className="h-4 w-4 inline mr-2" />
          Video
        </button>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === "pdf" && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Upload PDF</div>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop a PDF file here, or click to select
              </p>
              <input
                id="file"
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('file')?.click()}
              >
                Select PDF
              </Button>
              {file && (
                <p className="mt-2 text-sm text-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>
        )}

        {(activeTab === "website" || activeTab === "video") && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {activeTab === "website" ? "Website URL" : "Video URL"}
            </div>
            <Input
              id="url"
              type="url"
              placeholder={
                activeTab === "website" 
                  ? "https://example.com" 
                  : "https://www.youtube.com/watch?v=..."
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={
            (activeTab === "pdf" && !file) || 
            ((activeTab === "website" || activeTab === "video") && !url)
          }>
            Add Material
          </Button>
        </div>
      </form>
    </div>
  );
}