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
  Square,
  Eye,
  FileCodeCorner as Code,
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
import { PDFPreviewModal } from "./pdf-preview-modal";
import { CodePreviewModal } from "./code-preview-modal";

type MaterialType = "pdf" | "website" | "video" | "code";

export function MaterialsSection() {
  const { materials, addMaterial, toggleMaterial, removeMaterial } = useMaterials();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MaterialType>("pdf");
  const [previewPDF, setPreviewPDF] = useState<Material | null>(null);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [previewCode, setPreviewCode] = useState<Material | null>(null);
  const [isCodePreviewOpen, setIsCodePreviewOpen] = useState(false);

  const getIcon = (type: MaterialType) => {
    switch (type) {
      case "pdf": return <FileText className="h-4 w-4" />;
      case "website": return <Link className="h-4 w-4" />;
      case "video": return <PlayCircle className="h-4 w-4" />;
      case "code": return <Code className="h-4 w-4" />;
    }
  };

  const handlePDFPreview = (material: Material) => {
    if (material.type === "pdf" && material.file) {
      setPreviewPDF(material);
      setIsPDFPreviewOpen(true);
    }
  };

  const handleCodePreview = (material: Material) => {
    if (material.type === "code" && material.file) {
      setPreviewCode(material);
      setIsCodePreviewOpen(true);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>Materials</span>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:cursor-pointer">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Material</DialogTitle>
              <DialogDescription>
                Upload PDFs, add website links, attach code or include video URLs to provide context for your conversations.
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
                  
                  <div 
                    className={`flex items-center gap-2 flex-1 min-w-0 ${
                      (material.type === "pdf" || material.type === "code") ? "cursor-pointer hover:opacity-75 hover:bg-blue-50/50 rounded-sm px-1 transition-colors" : ""
                    }`}
                    onClick={() => {
                      if (material.type === "pdf") handlePDFPreview(material);
                      if (material.type === "code") handleCodePreview(material);
                    }}
                    title={
                      material.type === "pdf" ? "Click to preview PDF" : 
                      material.type === "code" ? "Click to preview code" :
                      material.url || material.name
                    }
                  >
                    {getIcon(material.type)}
                    <span className="text-sm truncate">
                      {material.name}
                    </span>
                  </div>

                  {/* Preview button for PDFs */}
                  {material.type === "pdf" && material.file && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handlePDFPreview(material)}
                      title="Preview PDF"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Preview button for Code */}
                  {material.type === "code" && material.file && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCodePreview(material)}
                      title="Preview Code"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  
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

      {/* PDF Preview Modal */}
      <PDFPreviewModal 
        pdf={previewPDF}
        isOpen={isPDFPreviewOpen}
        onOpenChange={setIsPDFPreviewOpen}
      />

      {/* Code Preview Modal */}
      <CodePreviewModal 
        code={previewCode}
        isOpen={isCodePreviewOpen}
        onOpenChange={setIsCodePreviewOpen}
      />
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
    
    if ((activeTab === "pdf" || activeTab === "code") && file) {
      const dataUrl = await getBase64(file);
      onAdd({
        type: activeTab,
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
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "code" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("code")}
        >
          <Code className="h-4 w-4 inline mr-2" />
          Code
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(activeTab === "pdf" || activeTab === "code") && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Upload {activeTab === "pdf" ? "PDF" : "Code"}</div>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop a {activeTab === "pdf" ? "PDF" : "Code File"} here, or click to select
              </p>
              <input
                id="file"
                type="file"
                accept=".pdf,.py,.js,.ts,.java,.cpp,.cs,.rb,.go,.rs,.c, .md, .txt,.json"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('file')?.click()}
              >
                Select {activeTab === "pdf" ? "PDF" : "Code File"}
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
            ((activeTab === "pdf" || activeTab === "code") && !file) || 
            ((activeTab === "website" || activeTab === "video") && !url)
          }>
            Add Material
          </Button>
        </div>
      </form>
    </div>
  );
}